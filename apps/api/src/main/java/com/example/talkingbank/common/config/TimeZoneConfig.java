package com.example.talkingbank.common.config;

import jakarta.annotation.PostConstruct;
import java.util.TimeZone;
import org.springframework.context.annotation.Configuration;

/**
 * JVM 기본 시간대를 Asia/Seoul 로 고정한다.
 * LocalDateTime.now() · JPA Auditing · 토큰 만료 계산이 전부 JVM 기본 시간대를 쓰므로,
 * 컨테이너(UTC)에서 띄워도 저장되는 시각이 화면과 9시간 어긋나지 않게 한다.
 */
@Configuration
public class TimeZoneConfig {

    public static final String ZONE_ID = "Asia/Seoul";

    @PostConstruct
    void setDefaultTimeZone() {
        TimeZone.setDefault(TimeZone.getTimeZone(ZONE_ID));
    }
}
