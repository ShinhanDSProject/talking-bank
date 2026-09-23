package com.example.talkingbank.auth.controller;

import com.example.talkingbank.auth.config.AuthProperties;
import com.example.talkingbank.auth.dto.EmailCheckResponse;
import com.example.talkingbank.auth.dto.LoginRequest;
import com.example.talkingbank.auth.dto.SignupRequest;
import com.example.talkingbank.auth.dto.SignupResponse;
import com.example.talkingbank.auth.dto.TokenResponse;
import com.example.talkingbank.auth.jwt.JwtTokenProvider;
import com.example.talkingbank.auth.service.AuthService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.time.Duration;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@Validated
@RequiredArgsConstructor
public class AuthController {

    static final String REFRESH_COOKIE = "refresh_token";
    /** 쿠키는 재발급·로그아웃 요청에만 실리도록 경로를 좁힌다. */
    private static final String REFRESH_COOKIE_PATH = "/api/auth";

    private final AuthService authService;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthProperties authProperties;

    @GetMapping("/check-email")
    public EmailCheckResponse checkEmail(
            @RequestParam @NotBlank(message = "이메일을 입력해 주세요") @Email(message = "올바른 이메일 형식이 아닙니다") String email) {
        return new EmailCheckResponse(authService.isEmailAvailable(email));
    }

    @PostMapping("/signup")
    public ResponseEntity<SignupResponse> signup(@Valid @RequestBody SignupRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.signup(request));
    }

    @PostMapping("/login")
    public ResponseEntity<TokenResponse> login(@Valid @RequestBody LoginRequest request) {
        return withRefreshCookie(authService.login(request));
    }

    @PostMapping("/refresh")
    public ResponseEntity<TokenResponse> refresh(
            @CookieValue(name = REFRESH_COOKIE, required = false) String refreshToken) {
        return withRefreshCookie(authService.reissue(refreshToken));
    }

    /** Access Token 블랙리스트는 두지 않는다. 로그아웃 뒤에도 기존 Access Token은 만료(30분)까지 유효하다. */
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@AuthenticationPrincipal Long userId) {
        authService.logout(userId);
        return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, refreshCookie("", Duration.ZERO).toString())
                .build();
    }

    private ResponseEntity<TokenResponse> withRefreshCookie(AuthService.LoginResult result) {
        ResponseCookie cookie = refreshCookie(result.refreshToken(),
                Duration.ofSeconds(jwtTokenProvider.refreshTokenValiditySeconds()));
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(result.tokenResponse());
    }

    private ResponseCookie refreshCookie(String value, Duration maxAge) {
        return ResponseCookie.from(REFRESH_COOKIE, value)
                .httpOnly(true)
                .secure(authProperties.cookieSecure())
                .sameSite("Strict")
                .path(REFRESH_COOKIE_PATH)
                .maxAge(maxAge)
                .build();
    }
}
