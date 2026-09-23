package com.example.talkingbank.account;

import com.example.talkingbank.account.entity.Account;
import com.example.talkingbank.account.entity.AccountStatus;
import com.example.talkingbank.account.repository.AccountRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/** 로컬 개발에서 화면을 바로 확인할 수 있도록 계좌가 하나도 없을 때만 예시 데이터를 넣는다. */
@Component
@Profile("local")
@RequiredArgsConstructor
public class AccountSeeder implements CommandLineRunner {

    private final AccountRepository accountRepository;

    @Override
    @Transactional
    public void run(String... args) {
        if (accountRepository.count() > 0) {
            return;
        }

        accountRepository.saveAll(List.of(
                Account.builder()
                        .accountNumber("110-123-456789")
                        .ownerName("김신한")
                        .productName("주거래 입출금통장")
                        .balance(new BigDecimal("1250000.00"))
                        .currency("KRW")
                        .status(AccountStatus.ACTIVE)
                        .openedAt(LocalDate.of(2024, 3, 2))
                        .build(),
                Account.builder()
                        .accountNumber("110-987-654321")
                        .ownerName("이하나")
                        .productName("마이카 적금")
                        .balance(new BigDecimal("8400000.00"))
                        .currency("KRW")
                        .status(AccountStatus.ACTIVE)
                        .openedAt(LocalDate.of(2023, 11, 20))
                        .build(),
                Account.builder()
                        .accountNumber("352-001-112233")
                        .ownerName("박우리")
                        .productName("외화 보통예금")
                        .balance(new BigDecimal("3120.55"))
                        .currency("USD")
                        .status(AccountStatus.DORMANT)
                        .openedAt(LocalDate.of(2022, 6, 8))
                        .build()));
    }
}
