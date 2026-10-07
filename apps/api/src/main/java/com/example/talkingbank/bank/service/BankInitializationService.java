package com.example.talkingbank.bank.service;

import com.example.talkingbank.bank.entity.Bank;
import com.example.talkingbank.bank.repository.BankRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class BankInitializationService {
    private final BankRepository bankRepository;

    // 은행별 독립 트랜잭션: 동시 기동의 중복 충돌은 롤백이 끝난 뒤 호출자가 확인한다.
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void registerIfMissing(String code, String name) {
        if (!bankRepository.existsByCode(code)) {
            bankRepository.saveAndFlush(Bank.create(code, name));
        }
    }

    @Transactional(readOnly = true)
    public boolean exists(String code) {
        return bankRepository.existsByCode(code);
    }
}
