package com.example.talkingbank.auth;

/** JWT의 type claim. 없으면 Refresh Token으로 일반 API를 부를 수 있게 되므로 반드시 검사한다. */
public enum TokenType {
    ACCESS,
    REFRESH
}
