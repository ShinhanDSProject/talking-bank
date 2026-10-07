package com.example.talkingbank.account.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.example.talkingbank.account.entity.Account;
import com.example.talkingbank.account.entity.AccountStatus;
import com.example.talkingbank.account.repository.AccountRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class AccountControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private AccountRepository accountRepository;

    @BeforeEach
    void setUp() {
        accountRepository.deleteAll();
    }

    @Test
    @DisplayName("계좌 목록을 인증 없이 조회할 수 있다")
    void getAccounts() throws Exception {
        accountRepository.save(Account.builder()
                .accountNumber("110-123-456789")
                .ownerName("김신한")
                .productName("주거래 입출금통장")
                .balance(new BigDecimal("1250000.00"))
                .currency("KRW")
                .status(AccountStatus.ACTIVE)
                .openedAt(LocalDate.of(2024, 3, 2))
                .build());

        mockMvc.perform(get("/api/accounts"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].accountNumber").value("110-123-456789"))
                .andExpect(jsonPath("$[0].ownerName").value("김신한"))
                .andExpect(jsonPath("$[0].status").value("ACTIVE"))
                .andExpect(jsonPath("$[0].openedAt").value("2024-03-02"));
    }

    @Test
    @DisplayName("계좌가 없으면 빈 배열을 반환한다")
    void getAccountsWhenEmpty() throws Exception {
        mockMvc.perform(get("/api/accounts"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }
}
