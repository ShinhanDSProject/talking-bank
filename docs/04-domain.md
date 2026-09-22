# 04. 도메인 모델

> 코드를 쓰기 전에 팀 전원이 같은 단어로 같은 것을 가리키게 하는 문서. 엔티티 이름과 상태값은 여기 적힌 것을 쓴다.

## 용어

| 용어          | 정의                                                                     | 코드           |
| ------------- | ------------------------------------------------------------------------ | -------------- |
| 회원          | 가입해서 로그인하는 사람. 계좌를 여러 개 가질 수 있다                    | `User`         |
| 계좌          | 돈이 들어 있는 단위. 계좌번호로 식별. 회원 한 명에 속한다                | `Account`      |
| 잔액          | 계좌에 지금 있는 돈. 음수가 될 수 없다                                   | `balance`      |
| 거래          | 계좌 하나의 잔액이 바뀐 기록. 입금 아니면 출금. **한 번 쓰면 안 바꾼다** | `Transaction`  |
| 이체(송금)    | 한 계좌에서 다른 계좌로 돈을 옮기는 요청. 성공하면 거래 2건이 생긴다     | `Transfer`     |
| 이상거래 판정 | FDS 규칙이 이체를 평가한 결과                                            | `FdsAlert`     |
| 자동이체      | (P2) 정해진 날에 반복 실행되는 이체 예약                                 | `AutoTransfer` |

"거래"와 "이체"를 섞어 쓰지 않는다. **이체는 요청이고, 거래는 결과다.**

## 엔티티와 관계

```
User 1 ──── N Account 1 ──── N Transaction
                │                   ▲
                │                   │ 이체 1건 = 출금 거래 1 + 입금 거래 1
                │                   │
                └──── N Transfer ───┘
                          │
                          └──── 0..1 FdsAlert
```

### User

| 필드      | 타입     | 비고                      |
| --------- | -------- | ------------------------- |
| id        | Long     |                           |
| email     | String   | unique, 로그인 ID         |
| password  | String   | BCrypt 해시               |
| name      | String   | 수취인 확인 화면에 보여줌 |
| phone     | String   | unique                    |
| role      | enum     | `USER`, `ADMIN`           |
| createdAt | DateTime |                           |

세부 컬럼(생년월일, 약관 동의 등)은 [02-scope.md 미확정 스코프](02-scope.md#미확정-스코프--지금-결정해야-하는-것)에 따른다.

### Account

| 필드          | 타입           | 비고                                             |
| ------------- | -------------- | ------------------------------------------------ |
| id            | Long           |                                                  |
| accountNumber | String         | unique. 형식은 `110-123-456789` 같은 하이픈 포함 |
| user          | User           |                                                  |
| productName   | String         | "주거래 입출금통장" 등. 상품 마스터는 안 만든다  |
| balance       | **BigDecimal** | precision 19, scale 2. 음수 불가                 |
| currency      | String         | 항상 `KRW`. 컬럼만 유지                          |
| status        | enum           | `ACTIVE`, `DORMANT`, `CLOSED`                    |
| openedAt      | Date           |                                                  |

이미 `apps/api`에 구현되어 있다. `user` 연관만 추가하면 된다.

### Transaction (거래)

| 필드                      | 타입       | 비고                                                  |
| ------------------------- | ---------- | ----------------------------------------------------- |
| id                        | Long       |                                                       |
| account                   | Account    | 이 거래로 잔액이 바뀐 계좌                            |
| type                      | enum       | `DEPOSIT`(입금), `WITHDRAWAL`(출금)                   |
| amount                    | BigDecimal | 항상 양수. 방향은 `type`이 정한다                     |
| balanceAfter              | BigDecimal | 거래 직후 잔액. 내역 화면에 보여주고 정합성 검증에 씀 |
| counterpartyAccountNumber | String     | 상대 계좌번호                                         |
| transfer                  | Transfer   | 어느 이체에서 생긴 거래인지                           |
| memo                      | String     |                                                       |
| createdAt                 | DateTime   |                                                       |

**불변이다.** UPDATE·DELETE 하지 않는다. 잘못된 거래는 반대 거래를 추가해서 바로잡는다(취소 기능은 범위 밖이지만 원칙은 지킨다).

### Transfer (이체)

| 필드           | 타입       | 비고                                            |
| -------------- | ---------- | ----------------------------------------------- |
| id             | Long       |                                                 |
| idempotencyKey | String     | unique. 클라이언트가 생성(UUID). 중복 요청 방지 |
| fromAccount    | Account    |                                                 |
| toAccount      | Account    |                                                 |
| amount         | BigDecimal |                                                 |
| memo           | String     |                                                 |
| status         | enum       | 아래 상태 참고                                  |
| failureReason  | String     | 실패·차단 사유                                  |
| requestedAt    | DateTime   |                                                 |
| completedAt    | DateTime   |                                                 |

상태 전이:

```
REQUESTED ──▶ COMPLETED          정상 완료
    │
    ├──────▶ PENDING_AUTH ──▶ COMPLETED   FDS 보류 → 추가 인증 통과
    │              └────────▶ FAILED      추가 인증 실패 또는 만료
    ├──────▶ BLOCKED                      FDS 차단
    └──────▶ FAILED                       잔액 부족, 계좌 상태 이상 등
```

`COMPLETED`, `BLOCKED`, `FAILED`는 종료 상태다. 다시 바뀌지 않는다.

### FdsAlert (이상거래 판정)

| 필드      | 타입     | 비고                                        |
| --------- | -------- | ------------------------------------------- |
| id        | Long     |                                             |
| transfer  | Transfer |                                             |
| ruleName  | String   | 걸린 규칙. 여러 개면 가장 심각한 것         |
| score     | int      | 규칙별 점수 합. 임계값과 비교               |
| decision  | enum     | `ALLOW`, `HOLD`(보류), `BLOCK`(차단)        |
| detail    | String   | 판정 근거. (P2 AI가 붙으면 여기를 자연어로) |
| createdAt | DateTime |                                             |

`ALLOW`도 기록한다. 나중에 오탐/미탐 비율을 볼 수 있어야 한다.

## 금액 규칙

1. **`BigDecimal`만 쓴다. `double`·`float` 금지.** `0.1 + 0.2 != 0.3`이다. 스터디 자료 1팀도 이 점을 강조한다.
2. **KRW는 정수다.** 소수점 이하가 생기면 버그다. DB 컬럼은 `DECIMAL(19,2)`로 두되 로직에서는 `setScale(0)`을 검증한다.
3. **`BigDecimal` 비교는 `compareTo`로 한다.** `equals`는 `1.00`과 `1`을 다르다고 본다.
4. **잔액은 음수가 될 수 없다.** DB 제약(`CHECK balance >= 0`)과 코드 검증을 둘 다 둔다.
5. **잔액은 컬럼에 저장한다.** 매번 거래내역을 합산하지 않는다. 대신 `Transaction.balanceAfter`로 정합성을 검증하는 테스트를 둔다.

## 송금 규칙

송금은 하나의 `@Transactional` 안에서 아래 순서로 처리한다.

```
1. 멱등성 확인   idempotencyKey가 이미 있으면 그 결과를 그대로 반환
2. 검증          출금≠입금 계좌, 금액>0, 두 계좌 모두 ACTIVE
3. 잠금          두 계좌를 ID 오름차순으로 비관적 락 (SELECT ... FOR UPDATE)
4. 잔액 확인     출금 계좌 잔액 ≥ 금액. 아니면 FAILED
5. FDS 평가      ALLOW → 계속 / HOLD → PENDING_AUTH로 저장하고 종료 / BLOCK → BLOCKED로 저장하고 종료
6. 출금          fromAccount.balance -= amount, Transaction(WITHDRAWAL) 생성
7. 입금          toAccount.balance += amount, Transaction(DEPOSIT) 생성
8. 완료          Transfer.status = COMPLETED
```

6~8 중 어디서든 예외가 나면 전부 롤백된다. **"출금은 됐는데 입금이 안 된" 상태는 존재할 수 없다.** 이걸 테스트로 증명한다.

### 동시성

같은 계좌에 동시 출금이 들어오면, 락 없이는 둘 다 "잔액 충분"으로 읽고 둘 다 출금해 잔액이 음수가 된다.

- **비관적 락**(`@Lock(PESSIMISTIC_WRITE)`)을 쓴다. 초심자에게는 낙관적 락 + 재시도보다 단순하고, 은행처럼 충돌이 실제로 일어나는 곳에 맞다.
- **데드락 방지**: A→B 이체와 B→A 이체가 동시에 오면 서로 상대 락을 기다린다. 항상 **계좌 ID 오름차순**으로 잠근다.
- 검증: 스레드 N개가 같은 계좌에서 동시에 출금하는 테스트. 최종 잔액 = 초기 잔액 − 성공 건수 × 금액.

### 멱등성

버튼을 두 번 누르거나 네트워크 재시도로 같은 이체 요청이 두 번 올 수 있다.

- 클라이언트가 이체 화면 진입 시 UUID를 만들어 `idempotencyKey`로 보낸다.
- 서버는 같은 키가 이미 있으면 새로 처리하지 않고 기존 `Transfer` 결과를 돌려준다.
- `idempotencyKey`는 unique 제약이라 동시에 같은 키가 와도 하나만 INSERT된다.

## 계좌 상태

| 상태      | 조회 | 출금 | 입금 | 비고                    |
| --------- | ---- | ---- | ---- | ----------------------- |
| `ACTIVE`  | O    | O    | O    | 정상                    |
| `DORMANT` | O    | X    | O    | 휴면. 시연용으로만 존재 |
| `CLOSED`  | O    | X    | X    | 해지. 시연용으로만 존재 |

상태를 바꾸는 기능은 범위 밖이다. 시드 데이터로만 만든다.

## 이후 Phase를 위해 코어가 열어둘 자리

Phase 2~6의 도메인은 전부 `Account`·`Transfer`·`Transaction` 위에 올라간다. 코어를 만들 때 아래만 지키면 나중에 구조를 뜯지 않아도 된다.

| 코어 모델     | 열어둘 자리                                                                                                         | 어느 Phase가 쓰나 |
| ------------- | ------------------------------------------------------------------------------------------------------------------- | ----------------- |
| `Account`     | `accountType` 컬럼 — 지금은 `CHECKING`(입출금) 하나. 뒤에 `DEPOSIT`, `LOAN`, `SECURITIES` 추가                      | Phase 2, 5        |
| `Transaction` | `sourceType` 컬럼 — 이 거래가 어디서 왔는지. `TRANSFER`, `CARD`, `SECURITIES`, `INSURANCE`, `INTEREST`              | Phase 2, 4, 5, 6  |
| `Transfer`    | 이체 로직을 **서비스 메서드 하나**(`TransferService.execute`)로 노출. 카드 출금·예수금 이체·보험료 납입이 이걸 호출 | Phase 4, 5, 6     |
| `FdsRule`     | 평가 대상을 `Transfer`가 아니라 **"출금 요청" 인터페이스**로 받는다. 카드 승인도 같은 규칙을 탄다                   | Phase 4           |
| `User`        | 생년월일 컬럼 자리 — 대출 심사·보험 청약에서 필요                                                                   | Phase 2, 6        |

`accountType`과 `sourceType`은 Phase 1에서 값이 하나뿐이라도 **컬럼은 지금 만든다.** 나중에 컬럼을 추가하면 기존 거래내역 전체를 마이그레이션해야 한다.

## 시드 데이터

로컬 개발과 시연을 위해 `local` 프로필에서 자동 생성한다.

- 일반 회원 3명 (각 계좌 1~2개), 관리자 1명
- 계좌 잔액은 시연 시나리오가 돌아갈 만큼 (예: 1,000,000원)
- FDS 시연을 위한 고액 임계값보다 큰 잔액을 가진 계좌 하나

시드는 데이터가 하나도 없을 때만 넣는다. (`AccountSeeder` 방식)
