package com.example.bankbank.config;

import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * 프론트엔드(apps/web)가 별도 도메인에 배포되므로 허용 출처를 설정으로 관리한다.
 * 예) CORS_ALLOWED_ORIGINS=https://bank-bank.example.com
 */
@ConfigurationProperties(prefix = "app.cors")
public record CorsProperties(List<String> allowedOrigins) {

    public CorsProperties {
        if (allowedOrigins == null || allowedOrigins.isEmpty()) {
            allowedOrigins = List.of("http://localhost:5173");
        }
    }
}
