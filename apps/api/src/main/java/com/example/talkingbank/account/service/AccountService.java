package com.example.talkingbank.account.service;

import com.example.talkingbank.account.dto.AccountResponse;
import com.example.talkingbank.account.repository.AccountRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class AccountService {

    private final AccountRepository accountRepository;

    public List<AccountResponse> findAll() {
        return accountRepository.findAllByOrderByOpenedAtDesc().stream()
                .map(AccountResponse::from)
                .toList();
    }
}
