package com.example.talkingbank.bank.controller;

import com.example.talkingbank.bank.dto.BankResponse;
import com.example.talkingbank.bank.service.BankService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/banks")
@RequiredArgsConstructor
public class BankController {
    private final BankService bankService;

    @GetMapping
    public List<BankResponse> getBanks() {
        return bankService.findActiveBanks();
    }
}
