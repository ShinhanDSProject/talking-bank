package com.example.talkingbank.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

/** 로그인에는 비밀번호 형식 검사를 걸지 않는다 — 규칙이 바뀌어도 기존 가입자가 로그인할 수 있어야 한다. */
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@ToString(exclude = "password")
public class LoginRequest {

    @NotBlank(message = "이메일을 입력해 주세요")
    @Email(message = "올바른 이메일 형식이 아닙니다")
    private String email;

    @NotBlank(message = "비밀번호를 입력해 주세요")
    private String password;
}
