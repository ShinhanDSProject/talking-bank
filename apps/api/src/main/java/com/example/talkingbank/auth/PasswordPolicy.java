package com.example.talkingbank.auth;

import com.example.talkingbank.common.BusinessException;
import com.example.talkingbank.common.ErrorCode;
import java.util.regex.Pattern;

/**
 * 비밀번호 규칙: 8~20자, 영문 · 숫자 · 특수문자를 모두 포함.
 * 가입 · 변경 때만 검사한다. 로그인 요청에는 걸지 않는다 — 규칙이 바뀌면 기존 가입자가 로그인을 못 하게 된다.
 * 프론트도 같은 정규식을 쓴다.
 */
public final class PasswordPolicy {

    public static final String REGEX =
            "^(?=.*[a-zA-Z])(?=.*\\d)(?=.*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>/?]).{8,20}$";

    private static final Pattern PATTERN = Pattern.compile(REGEX);

    private PasswordPolicy() {}

    public static void validate(String rawPassword) {
        if (rawPassword == null || !PATTERN.matcher(rawPassword).matches()) {
            throw new BusinessException(ErrorCode.AUTH_002);
        }
    }
}
