package com.example.talkingbank.auth.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.cookie;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.example.talkingbank.auth.config.JwtProperties;
import com.example.talkingbank.auth.dto.LoginRequest;
import com.example.talkingbank.auth.dto.SignupRequest;
import com.example.talkingbank.auth.jwt.JwtTokenProvider;
import com.example.talkingbank.auth.jwt.TokenType;
import com.example.talkingbank.auth.repository.RefreshTokenRepository;
import com.example.talkingbank.user.entity.User;
import com.example.talkingbank.user.repository.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest
@AutoConfigureMockMvc
class AuthControllerTest {

    private static final String EMAIL = "test@example.com";
    private static final String PASSWORD = "Test1234!";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @BeforeEach
    void setUp() {
        refreshTokenRepository.deleteAll();
        userRepository.deleteAll();
    }

    // ---------- 도우미 ----------

    private String json(Object body) throws Exception {
        return objectMapper.writeValueAsString(body);
    }

    private MvcResult signup(String email, String password) throws Exception {
        return mockMvc.perform(post("/api/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(SignupRequest.builder().email(email).password(password).name("홍길동").phone("010-1234-5678").build())))
                .andReturn();
    }

    private MvcResult login(String email, String password) throws Exception {
        return mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(LoginRequest.builder().email(email).password(password).build())))
                .andReturn();
    }

    private String accessTokenOf(MvcResult result) throws Exception {
        JsonNode body = objectMapper.readTree(result.getResponse().getContentAsString());
        return body.get("accessToken").asText();
    }

    private Cookie refreshCookieOf(MvcResult result) {
        MockHttpServletResponse response = result.getResponse();
        return response.getCookie(AuthController.REFRESH_COOKIE);
    }

    // ---------- 이메일 중복 확인 ----------

    @Nested
    @DisplayName("이메일 중복 확인")
    class CheckEmail {

        @Test
        @DisplayName("미등록 이메일은 available=true")
        void available() throws Exception {
            mockMvc.perform(get("/api/auth/check-email").param("email", EMAIL))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.available").value(true));
        }

        @Test
        @DisplayName("등록된 이메일은 대소문자가 달라도 available=false")
        void takenCaseInsensitive() throws Exception {
            signup(EMAIL, PASSWORD);

            mockMvc.perform(get("/api/auth/check-email").param("email", "TEST@Example.com"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.available").value(false));
        }

        @Test
        @DisplayName("형식이 틀리면 400 COMMON_001")
        void invalidFormat() throws Exception {
            mockMvc.perform(get("/api/auth/check-email").param("email", "not-an-email"))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.errorCode").value("COMMON_001"))
                    .andExpect(jsonPath("$.fieldErrors[0].field").value("email"));
        }
    }

    // ---------- 회원가입 ----------

    @Nested
    @DisplayName("회원가입")
    class Signup {

        @Test
        @DisplayName("정상 가입은 201이고 응답에 비밀번호가 없으며 DB에는 BCrypt 해시가 저장된다")
        void success() throws Exception {
            MvcResult result = signup("TEST@Example.com", PASSWORD);

            assertThat(result.getResponse().getStatus()).isEqualTo(201);
            JsonNode body = objectMapper.readTree(result.getResponse().getContentAsString());
            assertThat(body.get("userId").asLong()).isPositive();
            assertThat(body.get("email").asText()).isEqualTo(EMAIL);
            assertThat(body.has("password")).isFalse();

            User saved = userRepository.findByEmail(EMAIL).orElseThrow();
            assertThat(saved.getPassword()).startsWith("$2a$").isNotEqualTo(PASSWORD);
            assertThat(saved.getCreatedAt()).isNotNull();
            assertThat(saved.getUpdatedAt()).isNotNull();
            assertThat(body.get("createdAt").asText()).isNotBlank();
        }

        @Test
        @DisplayName("중복 이메일은 409 AUTH_001")
        void duplicate() throws Exception {
            signup(EMAIL, PASSWORD);

            mockMvc.perform(post("/api/auth/signup")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(SignupRequest.builder().email(EMAIL).password(PASSWORD).name("김철수").phone("010-9999-8888").build())))
                    .andExpect(status().isConflict())
                    .andExpect(jsonPath("$.errorCode").value("AUTH_001"))
                    .andExpect(jsonPath("$.timestamp").exists())
                    .andExpect(jsonPath("$.path").value("/api/auth/signup"));
        }

        @Test
        @DisplayName("비밀번호 규칙 위반은 400 AUTH_002")
        void weakPassword() throws Exception {
            mockMvc.perform(post("/api/auth/signup")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(SignupRequest.builder().email(EMAIL).password("password").name("홍길동").phone("010-1234-5678").build())))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.errorCode").value("AUTH_002"));
        }

        @Test
        @DisplayName("필수값이 빠지면 400 COMMON_001과 어떤 필드가 틀렸는지 알려준다")
        void missingFields() throws Exception {
            mockMvc.perform(post("/api/auth/signup")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(SignupRequest.builder().email("").password(PASSWORD).name("홍").phone("12345").build())))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.errorCode").value("COMMON_001"))
                    .andExpect(jsonPath("$.fieldErrors[*].field", hasItem("email")))
                    .andExpect(jsonPath("$.fieldErrors[*].field", hasItem("name")))
                    .andExpect(jsonPath("$.fieldErrors[*].field", hasItem("phone")));
        }
    }

    // ---------- 로그인 ----------

    @Nested
    @DisplayName("로그인")
    class Login {

        @BeforeEach
        void givenUser() throws Exception {
            signup(EMAIL, PASSWORD);
        }

        @Test
        @DisplayName("정상 로그인은 200, Access Token은 body로, Refresh Token은 httpOnly 쿠키로 온다")
        void success() throws Exception {
            MvcResult result = mockMvc.perform(post("/api/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(LoginRequest.builder().email(EMAIL).password(PASSWORD).build())))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.accessToken").isNotEmpty())
                    .andExpect(jsonPath("$.tokenType").value("Bearer"))
                    .andExpect(jsonPath("$.expiresIn").value(1800))
                    .andExpect(jsonPath("$.refreshToken").doesNotExist())
                    .andExpect(cookie().exists(AuthController.REFRESH_COOKIE))
                    .andExpect(cookie().httpOnly(AuthController.REFRESH_COOKIE, true))
                    .andExpect(cookie().path(AuthController.REFRESH_COOKIE, "/api/auth"))
                    .andReturn();

            JwtTokenProvider.ParsedToken access = jwtTokenProvider.parse(accessTokenOf(result));
            assertThat(access.type()).isEqualTo(TokenType.ACCESS);
            assertThat(access.email()).isEqualTo(EMAIL);

            User user = userRepository.findByEmail(EMAIL).orElseThrow();
            assertThat(user.getLastLoginAt()).isNotNull();
            assertThat(refreshTokenRepository.findByUserId(user.getId())).isPresent();
        }

        @Test
        @DisplayName("비밀번호가 틀리면 401 AUTH_003")
        void wrongPassword() throws Exception {
            mockMvc.perform(post("/api/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(LoginRequest.builder().email(EMAIL).password("Wrong1234!").build())))
                    .andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.errorCode").value("AUTH_003"))
                    .andExpect(jsonPath("$.message").value("이메일 또는 비밀번호가 일치하지 않습니다"));
        }

        @Test
        @DisplayName("없는 이메일도 비밀번호 불일치와 완전히 같은 응답이다")
        void unknownEmailLooksTheSame() throws Exception {
            mockMvc.perform(post("/api/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(LoginRequest.builder().email("nobody@example.com").password(PASSWORD).build())))
                    .andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.errorCode").value("AUTH_003"))
                    .andExpect(jsonPath("$.message").value("이메일 또는 비밀번호가 일치하지 않습니다"));
        }

        @Test
        @DisplayName("연속 5회 실패하면 잠기고 423 AUTH_008, 이후 올바른 비밀번호도 거부된다")
        void lockAfterFiveFailures() throws Exception {
            for (int i = 0; i < 4; i++) {
                assertThat(login(EMAIL, "Wrong1234!").getResponse().getStatus()).isEqualTo(401);
            }
            mockMvc.perform(post("/api/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(LoginRequest.builder().email(EMAIL).password("Wrong1234!").build())))
                    .andExpect(status().isLocked())
                    .andExpect(jsonPath("$.errorCode").value("AUTH_008"));

            assertThat(login(EMAIL, PASSWORD).getResponse().getStatus()).isEqualTo(423);
        }

        @Test
        @DisplayName("실패 뒤 성공하면 실패 횟수가 0으로 돌아간다")
        void resetFailCountOnSuccess() throws Exception {
            login(EMAIL, "Wrong1234!");
            login(EMAIL, "Wrong1234!");
            assertThat(userRepository.findByEmail(EMAIL).orElseThrow().getLoginFailCount()).isEqualTo(2);

            assertThat(login(EMAIL, PASSWORD).getResponse().getStatus()).isEqualTo(200);
            assertThat(userRepository.findByEmail(EMAIL).orElseThrow().getLoginFailCount()).isZero();
        }
    }

    // ---------- 토큰 재발급 · 로그아웃 ----------

    @Nested
    @DisplayName("토큰 재발급과 로그아웃")
    class RefreshAndLogout {

        private Cookie refreshCookie;
        private String accessToken;

        @BeforeEach
        void givenLoggedIn() throws Exception {
            signup(EMAIL, PASSWORD);
            MvcResult result = login(EMAIL, PASSWORD);
            refreshCookie = refreshCookieOf(result);
            accessToken = accessTokenOf(result);
        }

        @Test
        @DisplayName("유효한 Refresh 쿠키로 재발급하면 새 Access Token과 새 Refresh 쿠키가 온다")
        void reissue() throws Exception {
            MvcResult result = mockMvc.perform(post("/api/auth/refresh").cookie(refreshCookie))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.accessToken").isNotEmpty())
                    .andExpect(cookie().exists(AuthController.REFRESH_COOKIE))
                    .andReturn();

            assertThat(refreshCookieOf(result).getValue()).isNotEqualTo(refreshCookie.getValue());
        }

        @Test
        @DisplayName("Rotation 뒤 이전 Refresh Token으로 다시 요청하면 401 AUTH_006이고 저장된 토큰이 전부 폐기된다")
        void oldTokenAfterRotationIsRejected() throws Exception {
            mockMvc.perform(post("/api/auth/refresh").cookie(refreshCookie)).andExpect(status().isOk());

            mockMvc.perform(post("/api/auth/refresh").cookie(refreshCookie))
                    .andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.errorCode").value("AUTH_006"));

            Long userId = userRepository.findByEmail(EMAIL).orElseThrow().getId();
            assertThat(refreshTokenRepository.findByUserId(userId)).isEmpty();
        }

        @Test
        @DisplayName("Access Token을 Refresh 자리에 넣으면 401 AUTH_006")
        void accessTokenInRefreshSlot() throws Exception {
            mockMvc.perform(post("/api/auth/refresh").cookie(new Cookie(AuthController.REFRESH_COOKIE, accessToken)))
                    .andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.errorCode").value("AUTH_006"));
        }

        @Test
        @DisplayName("쿠키가 없으면 401 AUTH_006")
        void missingCookie() throws Exception {
            mockMvc.perform(post("/api/auth/refresh"))
                    .andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.errorCode").value("AUTH_006"));
        }

        @Test
        @DisplayName("로그아웃은 204이고 쿠키를 지우며, 그 뒤 재발급은 401")
        void logout() throws Exception {
            mockMvc.perform(post("/api/auth/logout")
                            .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken))
                    .andExpect(status().isNoContent())
                    .andExpect(cookie().maxAge(AuthController.REFRESH_COOKIE, 0));

            mockMvc.perform(post("/api/auth/refresh").cookie(refreshCookie))
                    .andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.errorCode").value("AUTH_006"));
        }

        @Test
        @DisplayName("로그아웃은 인증이 필요하다")
        void logoutRequiresAuth() throws Exception {
            mockMvc.perform(post("/api/auth/logout"))
                    .andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.errorCode").value("AUTH_004"));
        }
    }

    // ---------- 인증 필터 · /api/users/me ----------

    @Nested
    @DisplayName("인증 필터")
    class Filter {

        private String accessToken;
        private String refreshToken;

        @BeforeEach
        void givenLoggedIn() throws Exception {
            signup(EMAIL, PASSWORD);
            MvcResult result = login(EMAIL, PASSWORD);
            accessToken = accessTokenOf(result);
            refreshToken = refreshCookieOf(result).getValue();
        }

        @Test
        @DisplayName("유효한 Access Token으로 /api/users/me 를 부르면 본인 정보가 온다")
        void me() throws Exception {
            mockMvc.perform(get("/api/users/me").header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.email").value(EMAIL))
                    .andExpect(jsonPath("$.name").value("홍길동"))
                    .andExpect(jsonPath("$.password").doesNotExist());
        }

        @Test
        @DisplayName("토큰 없이 보호된 API를 부르면 401 AUTH_004 (공통 에러 포맷)")
        void noToken() throws Exception {
            mockMvc.perform(get("/api/users/me"))
                    .andExpect(status().isUnauthorized())
                    .andExpect(header().string(HttpHeaders.CONTENT_TYPE, containsString(MediaType.APPLICATION_JSON_VALUE)))
                    .andExpect(jsonPath("$.errorCode").value("AUTH_004"))
                    .andExpect(jsonPath("$.path").value("/api/users/me"));
        }

        @Test
        @DisplayName("Refresh Token으로 일반 API를 부르면 401")
        void refreshTokenRejectedAsAccess() throws Exception {
            mockMvc.perform(get("/api/users/me").header(HttpHeaders.AUTHORIZATION, "Bearer " + refreshToken))
                    .andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.errorCode").value("AUTH_004"));
        }

        @Test
        @DisplayName("변조된 토큰은 401 AUTH_004")
        void tampered() throws Exception {
            String tampered = accessToken.substring(0, accessToken.length() - 3) + "abc";
            mockMvc.perform(get("/api/users/me").header(HttpHeaders.AUTHORIZATION, "Bearer " + tampered))
                    .andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.errorCode").value("AUTH_004"));
        }

        @Test
        @DisplayName("만료된 토큰은 401 AUTH_005")
        void expired() throws Exception {
            JwtTokenProvider expiring = new JwtTokenProvider(new JwtProperties(
                    "test-only-secret-key-that-is-at-least-32-characters-long",
                    java.time.Duration.ofSeconds(-60), java.time.Duration.ofSeconds(-60)));
            String expiredToken = expiring.createAccessToken(1L, EMAIL);

            mockMvc.perform(get("/api/users/me").header(HttpHeaders.AUTHORIZATION, "Bearer " + expiredToken))
                    .andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.errorCode").value("AUTH_005"));
        }

        @Test
        @DisplayName("가입 · 로그인 · health는 토큰 없이 된다")
        void publicEndpoints() throws Exception {
            mockMvc.perform(get("/actuator/health")).andExpect(status().isOk());
            mockMvc.perform(get("/api/auth/check-email").param("email", "x@y.z")).andExpect(status().isOk());
        }
    }
}
