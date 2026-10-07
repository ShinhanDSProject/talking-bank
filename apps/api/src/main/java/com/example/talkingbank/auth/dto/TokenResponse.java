package com.example.talkingbank.auth.dto;

/** Access Token은 body로, Refresh Token은 httpOnly 쿠키로 나간다. expiresIn은 초. */
public record TokenResponse(String accessToken, String tokenType, long expiresIn) {

    public static TokenResponse of(String accessToken, long expiresInSeconds) {
        return new TokenResponse(accessToken, "Bearer", expiresInSeconds);
    }
}
