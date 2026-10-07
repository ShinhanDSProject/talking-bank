package com.example.talkingbank.auth.jwt;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.example.talkingbank.auth.config.JwtProperties;
import com.example.talkingbank.common.exception.BusinessException;
import com.example.talkingbank.common.exception.ErrorCode;
import java.time.Duration;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class JwtTokenProviderTest {

    private static final String SECRET = "unit-test-secret-key-that-is-at-least-32-characters";

    private final JwtTokenProvider provider =
            new JwtTokenProvider(new JwtProperties(SECRET, Duration.ofMinutes(30), Duration.ofDays(7)));

    @Test
    @DisplayName("발급한 Access Token에서 userId · email · type=ACCESS를 읽을 수 있다")
    void accessTokenClaims() {
        String token = provider.createAccessToken(7L, "user@example.com");

        JwtTokenProvider.ParsedToken parsed = provider.parse(token);

        assertThat(parsed.userId()).isEqualTo(7L);
        assertThat(parsed.email()).isEqualTo("user@example.com");
        assertThat(parsed.type()).isEqualTo(TokenType.ACCESS);
    }

    @Test
    @DisplayName("Access와 Refresh의 type claim이 다르다")
    void tokenTypesDiffer() {
        assertThat(provider.parse(provider.createRefreshToken(7L)).type()).isEqualTo(TokenType.REFRESH);
        assertThat(provider.parse(provider.createAccessToken(7L, "a@b.c")).type()).isEqualTo(TokenType.ACCESS);
    }

    @Test
    @DisplayName("만료된 토큰은 AUTH_005")
    void expiredToken() {
        JwtTokenProvider expiring =
                new JwtTokenProvider(new JwtProperties(SECRET, Duration.ofSeconds(-60), Duration.ofSeconds(-60)));
        String token = expiring.createAccessToken(1L, "a@b.c");

        assertThatThrownBy(() -> provider.parse(token))
                .isInstanceOf(BusinessException.class)
                .extracting(e -> ((BusinessException) e).getErrorCode())
                .isEqualTo(ErrorCode.AUTH_005);
    }

    @Test
    @DisplayName("다른 시크릿으로 서명된 토큰은 AUTH_004")
    void wrongSecret() {
        JwtTokenProvider other = new JwtTokenProvider(
                new JwtProperties("another-secret-key-that-is-also-32-characters-long", Duration.ofMinutes(30),
                        Duration.ofDays(7)));
        String token = other.createAccessToken(1L, "a@b.c");

        assertThatThrownBy(() -> provider.parse(token))
                .isInstanceOf(BusinessException.class)
                .extracting(e -> ((BusinessException) e).getErrorCode())
                .isEqualTo(ErrorCode.AUTH_004);
    }

    @Test
    @DisplayName("변조된 토큰은 AUTH_004")
    void tamperedToken() {
        String token = provider.createAccessToken(1L, "a@b.c");
        String tampered = token.substring(0, token.length() - 3) + "abc";

        assertThatThrownBy(() -> provider.parse(tampered))
                .isInstanceOf(BusinessException.class)
                .extracting(e -> ((BusinessException) e).getErrorCode())
                .isEqualTo(ErrorCode.AUTH_004);
    }

    @Test
    @DisplayName("시크릿이 비어 있으면 임시 키를 만들어 자기 토큰은 검증하지만 다른 인스턴스와는 호환되지 않는다")
    void blankSecretGeneratesEphemeralKey() {
        JwtTokenProvider a = new JwtTokenProvider(new JwtProperties("", Duration.ofMinutes(30), Duration.ofDays(7)));
        JwtTokenProvider b = new JwtTokenProvider(new JwtProperties(null, Duration.ofMinutes(30), Duration.ofDays(7)));
        String token = a.createAccessToken(1L, "a@b.c");

        assertThat(a.parse(token).userId()).isEqualTo(1L);
        assertThatThrownBy(() -> b.parse(token)).isInstanceOf(BusinessException.class);
    }

    @Test
    @DisplayName("환경 변수가 없어 플레이스홀더가 그대로 들어오면 원인을 말하며 기동하지 않는다")
    void unresolvedPlaceholderRejected() {
        assertThatThrownBy(() -> new JwtProperties("${JWT_SECRET}", Duration.ofMinutes(30), Duration.ofDays(7)))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("JWT_SECRET");
    }

    @Test
    @DisplayName("시크릿이 32바이트보다 짧으면 기동하지 않는다")
    void shortSecretRejected() {
        assertThatThrownBy(() -> new JwtProperties("short", Duration.ofMinutes(30), Duration.ofDays(7)))
                .isInstanceOf(IllegalArgumentException.class);
    }
}
