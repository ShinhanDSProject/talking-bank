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

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private UserStatus status;

    @Column(nullable = false)
    private int loginFailCount;

    private LocalDateTime lastLoginAt;

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

    public boolean isLocked() {
        return status == UserStatus.LOCKED;
    }

    public boolean isWithdrawn() {
        return status == UserStatus.WITHDRAWN;
    }

    /** 로그인 실패를 기록하고, 허용 횟수에 도달하면 잠근다. 잠겼으면 true. */
    public boolean recordLoginFailure(int maxFailCount) {
        loginFailCount++;
        if (loginFailCount >= maxFailCount) {
            status = UserStatus.LOCKED;
            return true;
        }
        return false;
    }

    public void recordLoginSuccess(LocalDateTime now) {
        loginFailCount = 0;
        lastLoginAt = now;
    }
}
