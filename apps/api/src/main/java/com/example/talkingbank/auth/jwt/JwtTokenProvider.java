package com.example.talkingbank.auth.jwt;

import com.example.talkingbank.auth.config.JwtProperties;
import com.example.talkingbank.common.exception.BusinessException;
import com.example.talkingbank.common.exception.ErrorCode;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.JwtParser;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;
import javax.crypto.SecretKey;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/** JWT 발급·검증. HS256, claims: sub=userId, email, type=ACCESS|REFRESH, jti(같은 초에 발급해도 값이 다르도록). */
@Slf4j
@Component
public class JwtTokenProvider {

    static final String CLAIM_EMAIL = "email";
    static final String CLAIM_TYPE = "type";

    private final SecretKey key;
    private final JwtParser parser;
    private final JwtProperties properties;

    public JwtTokenProvider(JwtProperties properties) {
        this.properties = properties;
        if (properties.hasSecret()) {
            this.key = Keys.hmacShaKeyFor(properties.secret().getBytes(StandardCharsets.UTF_8));
        } else {
            // 로컬 전용: 저장소에 시크릿을 두지 않기 위해 기동마다 새 키를 만든다. 재시작하면 기존 토큰은 무효가 된다.
            this.key = Jwts.SIG.HS256.key().build();
            log.warn("JWT_SECRET 이 없어 임시 서명 키를 생성했습니다. 서버를 재시작하면 발급된 토큰이 모두 무효화됩니다.");
        }
        // 파서는 불변·스레드 안전이라 한 번만 만든다.
        this.parser = Jwts.parser().verifyWith(key).build();
    }

    public String createAccessToken(Long userId, String email) {
        return build(userId, TokenType.ACCESS, properties.accessTokenValidity().toMillis())
                .claim(CLAIM_EMAIL, email)
                .compact();
    }

    public String createRefreshToken(Long userId) {
        return build(userId, TokenType.REFRESH, properties.refreshTokenValidity().toMillis()).compact();
    }

    public long accessTokenValiditySeconds() {
        return properties.accessTokenValidity().toSeconds();
    }

    public long refreshTokenValiditySeconds() {
        return properties.refreshTokenValidity().toSeconds();
    }

    /**
     * 서명·만료를 검증하고 claims를 돌려준다.
     * 만료는 AUTH_005, 그 외(서명 불일치 · 변조 · 형식 오류)는 AUTH_004. 프론트가 "재발급"과 "재로그인"을 구분해야 해서 나눈다.
     */
    public ParsedToken parse(String token) {
        try {
            Claims claims = parser.parseSignedClaims(token).getPayload();
            TokenType type = TokenType.valueOf(claims.get(CLAIM_TYPE, String.class));
            return new ParsedToken(Long.parseLong(claims.getSubject()), claims.get(CLAIM_EMAIL, String.class), type);
        } catch (ExpiredJwtException e) {
            throw new BusinessException(ErrorCode.AUTH_005);
        } catch (JwtException | IllegalArgumentException | NullPointerException e) {
            throw new BusinessException(ErrorCode.AUTH_004);
        }
    }

    public record ParsedToken(Long userId, String email, TokenType type) {}

    private io.jsonwebtoken.JwtBuilder build(Long userId, TokenType type, long validityMillis) {
        Instant now = Instant.now();
        return Jwts.builder()
                .id(UUID.randomUUID().toString())
                .subject(String.valueOf(userId))
                .claim(CLAIM_TYPE, type.name())
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusMillis(validityMillis)))
                .signWith(key, Jwts.SIG.HS256);
    }
}
