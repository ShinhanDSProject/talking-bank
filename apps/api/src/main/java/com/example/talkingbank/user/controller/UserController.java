package com.example.talkingbank.user.controller;

import com.example.talkingbank.user.dto.UserResponse;
import com.example.talkingbank.user.service.UserService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    /** 인증된 사용자 본인 정보. JwtAuthenticationFilter가 principal에 userId를 넣는다. */
    @GetMapping("/me")
    public UserResponse me(@AuthenticationPrincipal Long userId) {
        return userService.findMe(userId);
    }
}
