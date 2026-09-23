package com.example.talkingbank.account;

import java.math.BigDecimal;
import java.time.LocalDate;

/** apps/web의 Account 타입(src/features/accounts/api.ts)과 모양을 맞춘다. */
public record AccountResponse(
        Long id,
        String accountNumber,
        String ownerName,
        String productName,
        BigDecimal balance,
        String currency,
        AccountStatus status,
        LocalDate openedAt) {

    public static AccountResponse from(Account account) {
        return new AccountResponse(
                account.getId(),
                account.getAccountNumber(),
                account.getOwnerName(),
                account.getProductName(),
                account.getBalance(),
                account.getCurrency(),
                account.getStatus(),
                account.getOpenedAt());
    }
}
