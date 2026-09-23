package com.example.talkingbank.common.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/** BaseTimeEntity의 @CreatedDate · @LastModifiedDate를 채우는 Auditing을 켠다. */
@Configuration
@EnableJpaAuditing
public class JpaConfig {}
