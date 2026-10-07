package com.example.talkingbank.bank.config;

import com.example.talkingbank.bank.service.BankInitializationService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class BankInitializer implements ApplicationRunner {
    private static final List<SeedBank> BANKS = List.of(
            new SeedBank("BNK", "경남은행"),
            new SeedBank("KB", "국민은행"),
            new SeedBank("NH", "농협은행"),
            new SeedBank("SHINHAN", "신한은행"));

    private final BankInitializationService initializationService;

    @Override
    public void run(ApplicationArguments args) {
        for (SeedBank bank : BANKS) {
            try {
                initializationService.registerIfMissing(bank.code(), bank.name());
            } catch (DataIntegrityViolationException exception) {
                // 다른 서버가 같은 코드를 먼저 등록한 경우만 허용한다.
                if (!initializationService.exists(bank.code())) {
                    throw exception;
                }
            }
        }
    }

    private record SeedBank(String code, String name) {}
}
