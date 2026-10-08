package com.example.talkingbank.bank.service;

import com.example.talkingbank.bank.dto.BankResponse;
import com.example.talkingbank.bank.entity.BankStatus;
import com.example.talkingbank.bank.repository.BankRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BankService {
    private final BankRepository bankRepository;

    public List<BankResponse> findActiveBanks() {
        return bankRepository.findAllByStatusOrderByCodeAsc(BankStatus.ACTIVE).stream()
                .map(BankResponse::from).toList();
    }
}
