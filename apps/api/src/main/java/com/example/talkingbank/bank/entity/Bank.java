package com.example.talkingbank.bank.entity;

import com.example.talkingbank.common.entity.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "banks", uniqueConstraints = @UniqueConstraint(name = "uk_banks_code", columnNames = "code"))
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Bank extends BaseTimeEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 30)
    private String code;

    @Column(nullable = false, length = 50)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private BankStatus status;

    public static Bank create(String code, String name) {
        if (code == null || !code.matches("[A-Z][A-Z0-9_]{0,29}")) {
            throw new IllegalArgumentException("은행 코드는 30자 이내의 영문 대문자·숫자·밑줄이어야 합니다.");
        }
        if (name == null || name.isBlank() || name.strip().length() > 50) {
            throw new IllegalArgumentException("은행 이름은 1~50자여야 합니다.");
        }
        Bank bank = new Bank();
        bank.code = code;
        bank.name = name.strip();
        bank.status = BankStatus.ACTIVE;
        return bank;
    }

    public void deactivate() {
        this.status = BankStatus.INACTIVE;
    }
}
