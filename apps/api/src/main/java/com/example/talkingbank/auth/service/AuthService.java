package com.example.talkingbank.auth;

import com.example.talkingbank.common.BusinessException;
import com.example.talkingbank.common.ErrorCode;
import com.example.talkingbank.user.User;
import com.example.talkingbank.user.UserRepository;
import java.time.LocalDateTime;
import java.util.Locale;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    /** 이메일이 없을 때도 비밀번호 비교 시간을 비슷하게 맞추기 위한 더미 해시("이메일 없음"과 "비밀번호 불일치"를 응답 시간으로 구분하지 못하게). */
    private static final String DUMMY_PASSWORD = "dummy-password-for-timing";

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthProperties authProperties;
    private final String dummyHash;

    public AuthService(UserRepository userRepository, RefreshTokenRepository refreshTokenRepository,
            PasswordEncoder passwordEncoder, JwtTokenProvider jwtTokenProvider, AuthProperties authProperties) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
        this.authProperties = authProperties;
        this.dummyHash = passwordEncoder.encode(DUMMY_PASSWORD);
    }

    /** 중복 확인과 가입이 반드시 같은 정규화를 거쳐야 한다. 다르면 확인은 통과하는데 가입에서 실패한다. */
    static String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    @Transactional(readOnly = true)
    public boolean isEmailAvailable(String email) {
        return !userRepository.existsByEmail(normalizeEmail(email));
    }

    @Transactional
    public SignupResponse signup(SignupRequest request) {
        String email = normalizeEmail(request.getEmail());
        PasswordPolicy.validate(request.getPassword());
        if (userRepository.existsByEmail(email)) {
            throw new BusinessException(ErrorCode.AUTH_001);
        }
        User user = User.signup(email, passwordEncoder.encode(request.getPassword()), request.getName().trim(),
                request.getPhone().trim());
        try {
            // 동시 가입으로 existsByEmail을 둘 다 통과해도 DB unique 제약이 막는다. 그때 500이 아니라 409가 나가야 한다.
            return SignupResponse.from(userRepository.saveAndFlush(user));
        } catch (DataIntegrityViolationException e) {
            throw new BusinessException(ErrorCode.AUTH_001);
        }
    }

    /** 실패 횟수는 예외가 나도 저장돼야 하므로 BusinessException에는 롤백하지 않는다. */
    @Transactional(noRollbackFor = BusinessException.class)
    public LoginResult login(LoginRequest request) {
        User user = userRepository.findByEmail(normalizeEmail(request.getEmail())).orElse(null);
        if (user == null || user.isWithdrawn()) {
            passwordEncoder.matches(request.getPassword(), dummyHash);
            throw new BusinessException(ErrorCode.AUTH_003);
        }
        if (user.isLocked()) {
            throw new BusinessException(ErrorCode.AUTH_008);
        }
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            boolean lockedNow = user.recordLoginFailure(authProperties.maxLoginFailCount());
            throw new BusinessException(lockedNow ? ErrorCode.AUTH_008 : ErrorCode.AUTH_003);
        }
        user.recordLoginSuccess(LocalDateTime.now());
        return issueTokens(user);
    }

    /** 탈취 의심으로 저장된 토큰을 지운 뒤 예외를 던지므로, 그 삭제가 롤백되지 않게 한다. */
    @Transactional(noRollbackFor = BusinessException.class)
    public LoginResult reissue(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new BusinessException(ErrorCode.AUTH_006);
        }
        JwtTokenProvider.ParsedToken parsed;
        try {
            parsed = jwtTokenProvider.parse(refreshToken);
        } catch (BusinessException e) {
            throw new BusinessException(ErrorCode.AUTH_006);
        }
        if (parsed.type() != TokenType.REFRESH) {
            throw new BusinessException(ErrorCode.AUTH_006);
        }
        RefreshToken stored = refreshTokenRepository.findByUserId(parsed.userId())
                .orElseThrow(() -> new BusinessException(ErrorCode.AUTH_006));
        if (!stored.matches(refreshToken)) {
            // 서명은 맞는데 저장된 값과 다르다 = 이미 rotation된 옛 토큰이 다시 왔다. 탈취 가능성이 있어 전부 폐기한다.
            refreshTokenRepository.delete(stored);
            throw new BusinessException(ErrorCode.AUTH_006);
        }
        User user = userRepository.findById(parsed.userId())
                .orElseThrow(() -> new BusinessException(ErrorCode.AUTH_006));
        if (user.isLocked()) {
            throw new BusinessException(ErrorCode.AUTH_008);
        }
        if (user.isWithdrawn()) {
            throw new BusinessException(ErrorCode.AUTH_006);
        }
        return issueTokens(user);
    }

    @Transactional
    public void logout(Long userId) {
        refreshTokenRepository.deleteByUserId(userId);
    }

    private LoginResult issueTokens(User user) {
        String accessToken = jwtTokenProvider.createAccessToken(user.getId(), user.getEmail());
        String refreshToken = jwtTokenProvider.createRefreshToken(user.getId());
        LocalDateTime expiresAt = LocalDateTime.now().plusSeconds(jwtTokenProvider.refreshTokenValiditySeconds());

        refreshTokenRepository.findByUserId(user.getId()).ifPresentOrElse(
                stored -> stored.rotate(refreshToken, expiresAt),
                () -> refreshTokenRepository.save(new RefreshToken(user.getId(), refreshToken, expiresAt)));

        return new LoginResult(TokenResponse.bearer(accessToken, jwtTokenProvider.accessTokenValiditySeconds()),
                refreshToken);
    }

    /** 컨트롤러가 accessToken은 body로, refreshToken은 쿠키로 나눠 보낸다. */
    public record LoginResult(TokenResponse tokenResponse, String refreshToken) {}
}
