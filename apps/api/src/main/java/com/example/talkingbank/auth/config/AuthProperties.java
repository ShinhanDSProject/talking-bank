package com.example.talkingbank.auth.config;

import java.time.Duration;
import org.springframework.boot.context.properties.ConfigurationProperties;

/** application.yaml 의 auth.* */
@ConfigurationProperties(prefix = "auth")
public record AuthProperties(int maxLoginFailCount, Duration lockDuration, boolean cookieSecure) {}
