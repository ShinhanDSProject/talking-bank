package com.example.talkingbank.auth;

import com.example.talkingbank.user.User;
import java.time.LocalDateTime;

public record SignupResponse(Long userId, String email, String name, LocalDateTime createdAt) {

    public static SignupResponse from(User user) {
        return new SignupResponse(user.getId(), user.getEmail(), user.getName(), user.getCreatedAt());
    }
}
