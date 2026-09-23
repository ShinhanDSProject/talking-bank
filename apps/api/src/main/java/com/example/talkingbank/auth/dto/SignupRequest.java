package com.example.talkingbank.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Getter;
import lombok.ToString;
import lombok.extern.jackson.Jacksonized;

/**
 * 비밀번호 형식은 PasswordPolicy가 AUTH_002로 따로 검사한다. 로그에 비밀번호가 찍히지 않게 toString에서 뺀다.
 * Jackson은 @Jacksonized 덕분에 빌더로 역직렬화한다 — 기본 생성자가 없고 필드는 final이다.
 */
@Getter
@Builder
@Jacksonized
@ToString(exclude = "password")
public class SignupRequest {

    @NotBlank(message = "이메일을 입력해 주세요")
    @Email(message = "올바른 이메일 형식이 아닙니다")
    @Size(max = 255)
    private final String email;

    @NotBlank(message = "비밀번호를 입력해 주세요")
    private final String password;

    @NotBlank(message = "이름을 입력해 주세요")
    @Size(min = 2, max = 50, message = "이름은 2~50자입니다")
    private final String name;

    @NotBlank(message = "휴대폰 번호를 입력해 주세요")
    @Pattern(regexp = "^01[0-9]-?\\d{3,4}-?\\d{4}$", message = "올바른 휴대폰 번호 형식이 아닙니다")
    private final String phone;
}
