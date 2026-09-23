package com.example.talkingbank.common.exception;

import com.example.talkingbank.common.response.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;

/**
 * 컨트롤러 이후에 난 예외를 공통 포맷으로 바꾼다.
 * 시큐리티 필터에서 난 예외는 여기까지 오지 않으므로 JwtAuthenticationEntryPoint가 따로 처리한다.
 * 클라이언트 잘못(400 · 404 · 405 · 415)은 각각 잡아서 500으로 새지 않게 한다.
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handleBusiness(BusinessException e, HttpServletRequest request) {
        return respond(e.getErrorCode(), request);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException e,
            HttpServletRequest request) {
        List<ErrorResponse.FieldError> fieldErrors = e.getBindingResult().getFieldErrors().stream()
                .map(fe -> new ErrorResponse.FieldError(fe.getField(), fe.getDefaultMessage()))
                .toList();
        return respond(ErrorCode.COMMON_001, request, fieldErrors);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ErrorResponse> handleConstraint(ConstraintViolationException e,
            HttpServletRequest request) {
        List<ErrorResponse.FieldError> fieldErrors = e.getConstraintViolations().stream()
                .map(v -> new ErrorResponse.FieldError(lastNode(v.getPropertyPath().toString()), v.getMessage()))
                .toList();
        return respond(ErrorCode.COMMON_001, request, fieldErrors);
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ErrorResponse> handleMissingParam(MissingServletRequestParameterException e,
            HttpServletRequest request) {
        return respond(ErrorCode.COMMON_001, request,
                List.of(new ErrorResponse.FieldError(e.getParameterName(), "필수 값입니다")));
    }

    /** 본문이 JSON이 아니거나 형식이 깨진 경우. */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleUnreadable(HttpMessageNotReadableException e,
            HttpServletRequest request) {
        return respond(ErrorCode.COMMON_001, request);
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(NoResourceFoundException e, HttpServletRequest request) {
        return respond(ErrorCode.COMMON_003, request);
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ErrorResponse> handleMethod(HttpRequestMethodNotSupportedException e,
            HttpServletRequest request) {
        return respond(ErrorCode.COMMON_004, request);
    }

    @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
    public ResponseEntity<ErrorResponse> handleMediaType(HttpMediaTypeNotSupportedException e,
            HttpServletRequest request) {
        return respond(ErrorCode.COMMON_005, request);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleUnexpected(Exception e, HttpServletRequest request) {
        log.error("처리되지 않은 예외: {} {}", request.getMethod(), request.getRequestURI(), e);
        return respond(ErrorCode.COMMON_002, request);
    }

    private static ResponseEntity<ErrorResponse> respond(ErrorCode code, HttpServletRequest request) {
        return ResponseEntity.status(code.getStatus()).body(ErrorResponse.of(code, request.getRequestURI()));
    }

    private static ResponseEntity<ErrorResponse> respond(ErrorCode code, HttpServletRequest request,
            List<ErrorResponse.FieldError> fieldErrors) {
        return ResponseEntity.status(code.getStatus())
                .body(ErrorResponse.of(code, request.getRequestURI(), fieldErrors));
    }

    private static String lastNode(String propertyPath) {
        int idx = propertyPath.lastIndexOf('.');
        return idx < 0 ? propertyPath : propertyPath.substring(idx + 1);
    }
}
