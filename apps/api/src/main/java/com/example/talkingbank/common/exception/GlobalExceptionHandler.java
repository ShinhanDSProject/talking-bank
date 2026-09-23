package com.example.talkingbank.common;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * 컨트롤러 이후에 난 예외를 공통 포맷으로 바꾼다.
 * 시큐리티 필터에서 난 예외는 여기까지 오지 않으므로 JwtAuthenticationEntryPoint가 따로 처리한다.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handleBusiness(BusinessException e, HttpServletRequest request) {
        ErrorCode code = e.getErrorCode();
        return ResponseEntity.status(code.status()).body(ErrorResponse.of(code, request.getRequestURI()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException e,
            HttpServletRequest request) {
        List<ErrorResponse.FieldError> fieldErrors = e.getBindingResult().getFieldErrors().stream()
                .map(fe -> new ErrorResponse.FieldError(fe.getField(), fe.getDefaultMessage()))
                .toList();
        return ResponseEntity.status(ErrorCode.COMMON_001.status())
                .body(ErrorResponse.of(ErrorCode.COMMON_001, request.getRequestURI(), fieldErrors));
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ErrorResponse> handleConstraint(ConstraintViolationException e,
            HttpServletRequest request) {
        List<ErrorResponse.FieldError> fieldErrors = e.getConstraintViolations().stream()
                .map(v -> new ErrorResponse.FieldError(lastNode(v.getPropertyPath().toString()), v.getMessage()))
                .toList();
        return ResponseEntity.status(ErrorCode.COMMON_001.status())
                .body(ErrorResponse.of(ErrorCode.COMMON_001, request.getRequestURI(), fieldErrors));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleUnexpected(Exception e, HttpServletRequest request) {
        log.error("처리되지 않은 예외: {} {}", request.getMethod(), request.getRequestURI(), e);
        return ResponseEntity.status(ErrorCode.COMMON_002.status())
                .body(ErrorResponse.of(ErrorCode.COMMON_002, request.getRequestURI()));
    }

    private static String lastNode(String propertyPath) {
        int idx = propertyPath.lastIndexOf('.');
        return idx < 0 ? propertyPath : propertyPath.substring(idx + 1);
    }
}
