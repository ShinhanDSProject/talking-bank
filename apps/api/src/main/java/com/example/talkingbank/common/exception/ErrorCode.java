package com.example.talkingbank.common.exception;

import org.springframework.http.HttpStatus;

/** 에러 응답의 errorCode. 프론트는 이 코드로 분기하고, message는 그대로 보여줘도 되는 문장으로 쓴다. */
public enum ErrorCode {
    AUTH_001(HttpStatus.CONFLICT, "이미 사용 중인 이메일입니다"),
    AUTH_002(HttpStatus.BAD_REQUEST, "비밀번호 형식이 올바르지 않습니다"),
    AUTH_003(HttpStatus.UNAUTHORIZED, "이메일 또는 비밀번호가 일치하지 않습니다"),
    AUTH_004(HttpStatus.UNAUTHORIZED, "유효하지 않은 토큰입니다"),
    AUTH_005(HttpStatus.UNAUTHORIZED, "만료된 토큰입니다"),
    AUTH_006(HttpStatus.UNAUTHORIZED, "유효하지 않은 Refresh Token입니다"),
    AUTH_007(HttpStatus.FORBIDDEN, "접근 권한이 없습니다"),
    AUTH_008(HttpStatus.LOCKED, "로그인 시도 횟수를 초과했습니다"),
    COMMON_001(HttpStatus.BAD_REQUEST, "입력값이 올바르지 않습니다"),
    COMMON_002(HttpStatus.INTERNAL_SERVER_ERROR, "서버 오류가 발생했습니다");

    private final HttpStatus status;
    private final String message;

    ErrorCode(HttpStatus status, String message) {
        this.status = status;
        this.message = message;
    }

    public HttpStatus status() {
        return status;
    }

    public String message() {
        return message;
    }
}
