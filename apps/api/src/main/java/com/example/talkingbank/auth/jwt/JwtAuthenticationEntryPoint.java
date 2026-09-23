package com.example.talkingbank.auth;

import com.example.talkingbank.common.ErrorCode;
import com.example.talkingbank.common.ErrorResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

/** 인증 실패 401. 필터 단계의 예외는 @RestControllerAdvice가 잡지 못하므로 여기서 공통 포맷 JSON을 직접 쓴다. */
@Component
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final ObjectMapper objectMapper;

    public JwtAuthenticationEntryPoint(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response, AuthenticationException e)
            throws IOException {
        Object attribute = request.getAttribute(JwtAuthenticationFilter.ERROR_CODE_ATTRIBUTE);
        ErrorCode code = attribute instanceof ErrorCode ec ? ec : ErrorCode.AUTH_004;
        write(response, request.getRequestURI(), code, objectMapper);
    }

    static void write(HttpServletResponse response, String path, ErrorCode code, ObjectMapper objectMapper)
            throws IOException {
        response.setStatus(code.status().value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        objectMapper.writeValue(response.getWriter(), ErrorResponse.of(code, path));
    }
}
