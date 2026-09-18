package com.example.bankbank.account;

import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class AccountService {

    private final AccountRepository accountRepository;

    public AccountService(AccountRepository accountRepository) {
        this.accountRepository = accountRepository;
    }

    public List<AccountResponse> findAll() {
        return accountRepository.findAllByOrderByOpenedAtDesc().stream()
                .map(AccountResponse::from)
                .toList();
    }
}
