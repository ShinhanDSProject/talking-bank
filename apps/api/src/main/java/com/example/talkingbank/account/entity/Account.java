package com.example.talkingbank.account.entity;

import com.example.talkingbank.common.entity.BaseTimeEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "account")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Account extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 30)
    private String accountNumber;

    @Column(nullable = false, length = 50)
    private String ownerName;

    @Column(nullable = false, length = 100)
    private String productName;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal balance;

    @Column(nullable = false, length = 3)
    private String currency;

    // Hibernate 6은 이 컬럼을 DB의 native ENUM 으로 만든다(length 20은 무시된다). enum 값을 추가하면 ALTER TABLE 이 필요하다.
    // VARCHAR 로 고정하려면 @JdbcTypeCode(SqlTypes.VARCHAR) 를 붙인다.
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AccountStatus status;

    @Column(nullable = false)
    private LocalDate openedAt;

    @Builder
    private Account(String accountNumber, String ownerName, String productName, BigDecimal balance, String currency,
            AccountStatus status, LocalDate openedAt) {
        this.accountNumber = accountNumber;
        this.ownerName = ownerName;
        this.productName = productName;
        this.balance = balance;
        this.currency = currency;
        this.status = status;
        this.openedAt = openedAt;
    }
}
