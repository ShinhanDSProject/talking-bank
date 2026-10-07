package com.example.talkingbank.bank;

import static org.assertj.core.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.example.talkingbank.auth.jwt.JwtTokenProvider;
import com.example.talkingbank.bank.config.BankInitializer;
import com.example.talkingbank.bank.entity.Bank;
import com.example.talkingbank.bank.repository.BankRepository;
import java.util.concurrent.Executors;
import java.util.concurrent.Callable;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.DefaultApplicationArguments;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class BankIntegrationTest {
    @Autowired private BankRepository repository;
    @Autowired private BankInitializer initializer;
    @Autowired private JwtTokenProvider tokens;
    @Autowired private MockMvc mvc;

    @BeforeEach
    void reset() {
        repository.deleteAll();
    }

    @Test
    void authenticatedListIsSortedAndExcludesInactiveBanks() throws Exception {
        repository.saveAndFlush(Bank.create("ZZ", "은행 Z"));
        Bank inactive = Bank.create("BB", "비활성 은행");
        inactive.deactivate();
        repository.saveAndFlush(inactive);
        Bank first = repository.saveAndFlush(Bank.create("AA", "은행 A"));
        mvc.perform(get("/api/banks").header("Authorization", bearer()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].id").value(first.getId()))
                .andExpect(jsonPath("$[0].code").value("AA"))
                .andExpect(jsonPath("$[0].name").value("은행 A"))
                .andExpect(jsonPath("$[1].code").value("ZZ"));
    }

    @Test
    void emptyList() throws Exception {
        mvc.perform(get("/api/banks").header("Authorization", bearer()))
                .andExpect(status().isOk()).andExpect(content().json("[]"));
    }

    @Test
    void authenticationIsRequired() throws Exception {
        mvc.perform(get("/api/banks")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/banks").header("Authorization", "Bearer invalid"))
                .andExpect(status().isUnauthorized());
        mvc.perform(get("/api/banks").header("Authorization", "Bearer " + tokens.createRefreshToken(1L)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void duplicateCodeIsRejectedByDatabase() {
        repository.saveAndFlush(Bank.create("NH", "농협은행"));
        assertThatThrownBy(() -> repository.saveAndFlush(Bank.create("NH", "중복")))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void initializationAddsMissingBanksWithoutOverwritingExistingData() {
        Bank existing = Bank.create("NH", "기존 은행 이름");
        existing.deactivate();
        Long id = repository.saveAndFlush(existing).getId();
        initializer.run(new DefaultApplicationArguments());
        initializer.run(new DefaultApplicationArguments());
        assertThat(repository.count()).isEqualTo(4);
        Bank preserved = repository.findById(id).orElseThrow();
        assertThat(preserved.getName()).isEqualTo("기존 은행 이름");
        assertThat(preserved.getStatus().name()).isEqualTo("INACTIVE");
        assertThat(preserved.getCreatedAt()).isNotNull();
        assertThat(repository.findAll()).extracting(Bank::getCode)
                .containsExactlyInAnyOrder("NH", "KB", "BNK", "SHINHAN");
    }

    @Test
    void concurrentInitializationDoesNotCreateDuplicates() throws Exception {
        try (var executor = Executors.newFixedThreadPool(2)) {
            Callable<Void> task = () -> {
                initializer.run(new DefaultApplicationArguments());
                return null;
            };
            for (var result : executor.invokeAll(List.of(task, task))) {
                result.get();
            }
        }
        assertThat(repository.count()).isEqualTo(4);
    }

    @Test
    void invalidBankValuesAreRejected() {
        assertThatIllegalArgumentException().isThrownBy(() -> Bank.create("", "은행"));
        assertThatIllegalArgumentException().isThrownBy(() -> Bank.create("NH", " "));
        assertThatIllegalArgumentException().isThrownBy(() -> Bank.create("nh", "은행"));
    }

    private String bearer() {
        return "Bearer " + tokens.createAccessToken(1L, "bank-test@example.com");
    }
}
