package com.example.talkingbank.bank.dto;

import com.example.talkingbank.bank.entity.Bank;

public record BankResponse(Long id, String code, String name) {
    public static BankResponse from(Bank bank) {
        return new BankResponse(bank.getId(), bank.getCode(), bank.getName());
    }
}
