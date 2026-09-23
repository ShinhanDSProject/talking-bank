package com.example.talkingbank.common;

/** 도메인 규칙 위반. ErrorCode가 HTTP 상태와 메시지를 결정한다. */
public class BusinessException extends RuntimeException {

    private final ErrorCode errorCode;

    public BusinessException(ErrorCode errorCode) {
        super(errorCode.message());
        this.errorCode = errorCode;
    }

    public ErrorCode getErrorCode() {
        return errorCode;
    }
}
