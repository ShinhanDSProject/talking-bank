package com.example.talkingbank.user.dto;

import com.example.talkingbank.user.entity.User;
import java.time.LocalDateTime;

/** GET /api/users/me 응답. 비밀번호는 절대 포함하지 않는다. */
public record UserResponse(Long id, String email, String name, String phone, LocalDateTime createdAt) {

    public static UserResponse from(User user) {
        return new UserResponse(user.getId(), user.getEmail(), user.getName(), user.getPhone(), user.getCreatedAt());
    }
}
