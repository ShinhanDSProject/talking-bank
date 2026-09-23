package com.example.talkingbank.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** 비밀번호 형식은 PasswordPolicy가 AUTH_002로 따로 검사한다. toString에 비밀번호가 찍히지 않게 record를 쓰지 않는다. */
public class SignupRequest {

    @NotBlank(message = "이메일을 입력해 주세요")
    @Email(message = "올바른 이메일 형식이 아닙니다")
    @Size(max = 255)
    private String email;

    @NotBlank(message = "비밀번호를 입력해 주세요")
    private String password;

    @NotBlank(message = "이름을 입력해 주세요")
    @Size(min = 2, max = 50, message = "이름은 2~50자입니다")
    private String name;

    @NotBlank(message = "휴대폰 번호를 입력해 주세요")
    @Pattern(regexp = "^01[0-9]-?\\d{3,4}-?\\d{4}$", message = "올바른 휴대폰 번호 형식이 아닙니다")
    private String phone;

    protected SignupRequest() {}

    public SignupRequest(String email, String password, String name, String phone) {
        this.email = email;
        this.password = password;
        this.name = name;
        this.phone = phone;
    }

    public String getEmail() {
        return email;
    }

    public String getPassword() {
        return password;
    }

    public String getName() {
        return name;
    }

    public String getPhone() {
        return phone;
    }

    @Override
    public String toString() {
        return "SignupRequest{email='" + email + "', name='" + name + "', phone='" + phone + "'}";
    }
}
