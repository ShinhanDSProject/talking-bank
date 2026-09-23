package com.example.talkingbank.auth;

import com.example.talkingbank.common.BusinessException;
import com.example.talkingbank.common.ErrorCode;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Authorization: Bearer {token} 을 읽어 인증 컨텍스트를 채운다.
 * 토큰이 없으면 그냥 통과시킨다(permitAll 경로가 동작해야 하므로). 토큰이 잘못됐으면 에러 코드를 request에 남기고
 * 인증 없이 통과시켜, 보호된 경로에서 JwtAuthenticationEntryPoint가 그 코드로 401을 만든다.
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    static final String ERROR_CODE_ATTRIBUTE = "auth.errorCode";
    private static final String BEARER = "Bearer ";

    private final JwtTokenProvider jwtTokenProvider;

    public JwtAuthenticationFilter(JwtTokenProvider jwtTokenProvider) {
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (header != null && header.startsWith(BEARER)) {
            try {
                JwtTokenProvider.ParsedToken token = jwtTokenProvider.parse(header.substring(BEARER.length()));
                if (token.type() != TokenType.ACCESS) {
                    throw new BusinessException(ErrorCode.AUTH_004);
                }
                var authentication = new UsernamePasswordAuthenticationToken(token.userId(), null,
                        List.of(new SimpleGrantedAuthority("ROLE_USER")));
                SecurityContextHolder.getContext().setAuthentication(authentication);
            } catch (BusinessException e) {
                request.setAttribute(ERROR_CODE_ATTRIBUTE, e.getErrorCode());
            }
        }
        chain.doFilter(request, response);
    }
}
