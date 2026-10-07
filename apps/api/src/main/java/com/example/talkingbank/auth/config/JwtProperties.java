package com.example.talkingbank.auth.config;

import java.time.Duration;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * application.yaml 의 jwt.*
 * secret 이 비어 있으면 JwtTokenProvider 가 기동 때 임시 키를 만든다(로컬 전용 동작). 값이 있으면 32바이트 이상이어야 한다.
 * prod 프로필은 ${JWT_SECRET} 에 기본값이 없어 환경 변수가 없으면 바인딩 단계에서 실패한다.
 */
@ConfigurationProperties(prefix = "jwt")
public record JwtProperties(String secret, Duration accessTokenValidity, Duration refreshTokenValidity) {

    public JwtProperties {
        if (secret != null && secret.startsWith("${")) {
            // prod 에서 환경 변수가 없으면 플레이스홀더 문자열이 그대로 들어온다. 32바이트 오류보다 원인을 바로 말한다.
            throw new IllegalArgumentException("jwt.secret 이 설정되지 않았습니다. 환경 변수 JWT_SECRET 을 넣어 주세요 (" + secret + ")");
        }
        if (secret != null && !secret.isBlank() && secret.getBytes().length < 32) {
            throw new IllegalArgumentException("jwt.secret은 32바이트 이상이어야 합니다");
        }
    }

    public boolean hasSecret() {
        return secret != null && !secret.isBlank();
    }
}
