package com.example.talkingbank.auth;

import org.springframework.boot.context.properties.ConfigurationProperties;

/** application.yaml의 auth.* */
@ConfigurationProperties(prefix = "auth")
public record AuthProperties(int maxLoginFailCount, boolean cookieSecure) {}
