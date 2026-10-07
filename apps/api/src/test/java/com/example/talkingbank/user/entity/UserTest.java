package com.example.talkingbank.user.entity;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Duration;
import java.time.LocalDateTime;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class UserTest {

    private static final Duration LOCK = Duration.ofMinutes(30);
    private final LocalDateTime now = LocalDateTime.of(2026, 9, 24, 12, 0);

    private User user() {
        return User.signup("a@b.com", "encoded", "홍길동", "010-1234-5678");
    }

    @Test
    @DisplayName("허용 횟수에 도달하면 lockDuration 동안 잠기고, 그 시간이 지나면 풀린다")
    void lockIsTemporary() {
        User user = user();
        for (int i = 0; i < 4; i++) {
            assertThat(user.recordLoginFailure(5, LOCK, now)).isFalse();
        }
        assertThat(user.recordLoginFailure(5, LOCK, now)).isTrue();

        assertThat(user.isLocked(now)).isTrue();
        assertThat(user.isLocked(now.plusMinutes(29))).isTrue();
        assertThat(user.isLocked(now.plusMinutes(30))).isFalse();
    }

    @Test
    @DisplayName("잠기면 실패 횟수가 0으로 돌아가 잠금이 풀린 뒤 다시 5회를 센다")
    void failCountResetsOnLock() {
        User user = user();
        for (int i = 0; i < 5; i++) {
            user.recordLoginFailure(5, LOCK, now);
        }
        assertThat(user.getLoginFailCount()).isZero();
    }

    @Test
    @DisplayName("로그인 성공은 실패 횟수와 잠금을 모두 지운다")
    void successClearsLock() {
        User user = user();
        for (int i = 0; i < 5; i++) {
            user.recordLoginFailure(5, LOCK, now);
        }
        user.recordLoginSuccess(now.plusHours(1));

        assertThat(user.isLocked(now.plusHours(1))).isFalse();
        assertThat(user.getLockedUntil()).isNull();
        assertThat(user.getLastLoginAt()).isEqualTo(now.plusHours(1));
    }
}
