package com.example.talkingbank.common.config;

import com.example.talkingbank.auth.config.AuthProperties;
import com.example.talkingbank.auth.config.JwtProperties;
import com.example.talkingbank.auth.jwt.JwtAccessDeniedHandler;
import com.example.talkingbank.auth.jwt.JwtAuthenticationEntryPoint;
import com.example.talkingbank.auth.jwt.JwtAuthenticationFilter;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * JWT 기반 무상태 인증. CORS 설정은 두지 않는다 — 개발 중에는 Vite 프록시로 같은 출처가 되고,
 * 배포 구성은 인프라 이슈(AUTH-01)에서 정한다.
 */
@Configuration
@EnableWebSecurity
@EnableConfigurationProperties({JwtProperties.class, AuthProperties.class})
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /** JwtAuthenticationFilter 는 @Component 라 서블릿 컨테이너에도 자동 등록된다. 시큐리티 체인 안에서만 돌게 컨테이너 등록은 끈다. */
    @Bean
    public FilterRegistrationBean<JwtAuthenticationFilter> jwtFilterRegistration(JwtAuthenticationFilter filter) {
        FilterRegistrationBean<JwtAuthenticationFilter> registration = new FilterRegistrationBean<>(filter);
        registration.setEnabled(false);
        return registration;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, JwtAuthenticationFilter jwtAuthenticationFilter,
            JwtAuthenticationEntryPoint entryPoint, JwtAccessDeniedHandler accessDeniedHandler) throws Exception {
        return http
                // 토큰 기반이라 세션 CSRF 토큰을 쓰지 않는다. Refresh 쿠키는 SameSite=Strict + 경로 /api/auth 로 좁혀 둔다.
                .csrf(csrf -> csrf.disable())
                .formLogin(form -> form.disable())
                .httpBasic(basic -> basic.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/api/auth/check-email", "/api/auth/signup", "/api/auth/login",
                                "/api/auth/refresh").permitAll()
                        .requestMatchers("/actuator/health/**").permitAll()
                        // TODO: 계좌가 회원에 연결되면(ACCT) 지운다. 웹 계좌 목록 화면이 계속 돌게 이 한 경로만 연다 — 하위 경로는 열지 않는다.
                        .requestMatchers(HttpMethod.GET, "/api/accounts").permitAll()
                        .anyRequest().authenticated())
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(entryPoint)
                        .accessDeniedHandler(accessDeniedHandler))
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }
}
