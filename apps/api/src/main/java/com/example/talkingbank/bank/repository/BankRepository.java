package com.example.talkingbank.bank.repository;

import com.example.talkingbank.bank.entity.Bank;
import com.example.talkingbank.bank.entity.BankStatus;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BankRepository extends JpaRepository<Bank, Long> {
    boolean existsByCode(String code);
    List<Bank> findAllByStatusOrderByCodeAsc(BankStatus status);
}
