package com.example.talkingbank.auth;

import com.example.talkingbank.common.BusinessException;
import com.example.talkingbank.common.ErrorCode;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;
import javax.crypto.SecretKey;
import org.springframework.stereotype.Component;

/** JWT 발급·검증. HS256, claims: sub=userId, email, type=ACCESS|REFRESH, jti(같은 초에 발급해도 값이 다르도록). */
@Component
public class JwtTokenProvider {

    static final String CLAIM_EMAIL = "email";
    static final String CLAIM_TYPE = "type";

    private final SecretKey key;
    private final JwtProperties properties;

    public JwtTokenProvider(JwtProperties properties) {
        this.properties = properties;
        this.key = Keys.hmacShaKeyFor(properties.secret().getBytes(StandardCharsets.UTF_8));
    }

    public String createAccessToken(Long userId, String email) {
        return build(userId, TokenType.ACCESS, properties.accessTokenValidity().toMillis())
                .claim(CLAIM_EMAIL, email)
                .compact();
    }

    public String createRefreshToken(Long userId) {
        return build(userId, TokenType.REFRESH, properties.refreshTokenValidity().toMillis()).compact();
    }

    public long accessTokenValiditySeconds() {
        return properties.accessTokenValidity().toSeconds();
    }

    public long refreshTokenValiditySeconds() {
        return properties.refreshTokenValidity().toSeconds();
    }

    /**
     * 서명·만료를 검증하고 claims를 돌려준다.
     * 만료는 AUTH_005, 그 외(서명 불일치 · 변조 · 형식 오류)는 AUTH_004. 프론트가 "재발급"과 "재로그인"을 구분해야 해서 나눈다.
     */
    public ParsedToken parse(String token) {
        try {
            Claims claims = Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
            TokenType type = TokenType.valueOf(claims.get(CLAIM_TYPE, String.class));
            return new ParsedToken(Long.parseLong(claims.getSubject()), claims.get(CLAIM_EMAIL, String.class), type);
        } catch (ExpiredJwtException e) {
            throw new BusinessException(ErrorCode.AUTH_005);
        } catch (JwtException | IllegalArgumentException | NullPointerException e) {
            throw new BusinessException(ErrorCode.AUTH_004);
        }
    }

    public record ParsedToken(Long userId, String email, TokenType type) {}

    private io.jsonwebtoken.JwtBuilder build(Long userId, TokenType type, long validityMillis) {
        Instant now = Instant.now();
        return Jwts.builder()
                .id(UUID.randomUUID().toString())
                .subject(String.valueOf(userId))
                .claim(CLAIM_TYPE, type.name())
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusMillis(validityMillis)))
                .signWith(key, Jwts.SIG.HS256);
    }
}
