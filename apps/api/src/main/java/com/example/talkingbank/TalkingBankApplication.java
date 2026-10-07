package com.example.talkingbank;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * 인증은 JWT 필터가 직접 하므로, 기동 때 임시 사용자와 비밀번호를 만드는 기본 UserDetailsService는 끈다.
 * @EnableJpaAuditing 은 여기 둔다 — @DataJpaTest 같은 슬라이스 테스트도 이 클래스의 어노테이션은 읽으므로 BaseTimeEntity 가 항상 채워진다.
 */
@SpringBootApplication(exclude = UserDetailsServiceAutoConfiguration.class)
@EnableJpaAuditing
public class TalkingBankApplication {

    public static void main(String[] args) {
        SpringApplication.run(TalkingBankApplication.class, args);
    }
}
