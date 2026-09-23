package com.example.talkingbank.auth.config;

import java.time.Duration;
import org.springframework.boot.context.properties.ConfigurationProperties;

/** application.yaml의 jwt.* — 시크릿은 환경 변수 JWT_SECRET으로 주입한다. */
@ConfigurationProperties(prefix = "jwt")
public record JwtProperties(String secret, Duration accessTokenValidity, Duration refreshTokenValidity) {

    public JwtProperties {
        if (secret == null || secret.getBytes().length < 32) {
            throw new IllegalArgumentException("jwt.secret은 32바이트 이상이어야 합니다");
        }
    }
}
