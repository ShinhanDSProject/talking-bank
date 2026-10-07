package com.example.talkingbank.common.response;

import com.example.talkingbank.common.exception.ErrorCode;
import com.example.talkingbank.common.config.TimeZoneConfig;
import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.List;

/** 모든 API 오류 응답의 공통 포맷. fieldErrors는 입력 검증 실패일 때만 들어간다. */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ErrorResponse(
        String errorCode,
        String message,
        OffsetDateTime timestamp,
        String path,
        List<FieldError> fieldErrors) {

    private static final ZoneId ZONE = ZoneId.of(TimeZoneConfig.ZONE_ID);

    public record FieldError(String field, String reason) {}

    public static ErrorResponse of(ErrorCode errorCode, String path) {
        return new ErrorResponse(errorCode.name(), errorCode.getMessage(), OffsetDateTime.now(ZONE), path, null);
    }

    public static ErrorResponse of(ErrorCode errorCode, String path, List<FieldError> fieldErrors) {
        return new ErrorResponse(errorCode.name(), errorCode.getMessage(), OffsetDateTime.now(ZONE), path, fieldErrors);
    }
}
