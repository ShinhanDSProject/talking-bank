package com.example.talkingbank.user.entity;

import com.example.talkingbank.common.entity.BaseTimeEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Duration;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** 회원. 비밀번호는 BCrypt 해시만 저장한다. 상태 변경은 의미 있는 메서드로만 한다. */
@Entity
@Table(name = "users")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class User extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(nullable = false, length = 20)
    private String phone;

    // Hibernate 6은 이 컬럼을 DB의 native ENUM 으로 만든다(length 20은 무시된다). enum 값을 추가하면 ALTER TABLE 이 필요하다.
    // VARCHAR 로 고정하려면 @JdbcTypeCode(SqlTypes.VARCHAR) 를 붙인다.
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private UserStatus status;

    @Column(nullable = false)
    private int loginFailCount;

    private LocalDateTime lastLoginAt;

    /** 로그인 실패 누적으로 잠긴 경우 잠금이 풀리는 시각. null 이면 잠기지 않았다. */
    private LocalDateTime lockedUntil;

    private User(String email, String encodedPassword, String name, String phone) {
        this.email = email;
        this.password = encodedPassword;
        this.name = name;
        this.phone = phone;
        this.status = UserStatus.ACTIVE;
        this.loginFailCount = 0;
    }

    /** 가입. email은 정규화(trim · 소문자)된 값, password는 이미 인코딩된 값이어야 한다. */
    public static User signup(String normalizedEmail, String encodedPassword, String name, String phone) {
        return new User(normalizedEmail, encodedPassword, name, phone);
    }

    /** 실패 누적 잠금(시간 제한) 또는 관리자 잠금(status = LOCKED). */
    public boolean isLocked(LocalDateTime now) {
        return status == UserStatus.LOCKED || (lockedUntil != null && now.isBefore(lockedUntil));
    }

    public boolean isWithdrawn() {
        return status == UserStatus.WITHDRAWN;
    }

    /**
     * 로그인 실패를 기록하고, 허용 횟수에 도달하면 lockDuration 동안 잠근다. 잠겼으면 true.
     * 영구 잠금이 아니라 시간 제한 잠금이다 — 이메일만 알면 남의 계정을 영영 잠글 수 있는 구멍을 막는다.
     */
    public boolean recordLoginFailure(int maxFailCount, Duration lockDuration, LocalDateTime now) {
        loginFailCount++;
        if (loginFailCount >= maxFailCount) {
            lockedUntil = now.plus(lockDuration);
            loginFailCount = 0;
            return true;
        }
        return false;
    }

    public void recordLoginSuccess(LocalDateTime now) {
        loginFailCount = 0;
        lockedUntil = null;
        lastLoginAt = now;
    }
}
