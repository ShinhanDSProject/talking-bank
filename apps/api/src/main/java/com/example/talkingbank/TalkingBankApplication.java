package com.example.talkingbank;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;

/** 인증은 JWT 필터가 직접 하므로, 기동 때 임시 사용자와 비밀번호를 만드는 기본 UserDetailsService는 끈다. */
@SpringBootApplication(exclude = UserDetailsServiceAutoConfiguration.class)
public class TalkingBankApplication {

    public static void main(String[] args) {
        SpringApplication.run(TalkingBankApplication.class, args);
    }
}
