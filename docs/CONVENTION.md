# Bank-Bank 개발 컨벤션

> 검토용 초안 · 2026-09-18
> 이전에 논의한 Spring Boot·Java 백엔드 규칙을 정리한 문서입니다. 팀 검토 후 공용 규칙으로 확정합니다.

## 1. 코드 구조

도메인별로 패키지를 나누고, 각 도메인 안에서 계층별로 코드를 관리합니다.

```text
com.example.bankbank
├── BankBankApplication.java
├── common
│   ├── config
│   ├── exception
│   └── response
├── member
│   ├── controller
│   ├── service
│   ├── repository
│   ├── entity
│   └── dto
├── account
│   ├── controller
│   ├── service
│   ├── repository
│   ├── entity
│   └── dto
├── transfer
│   ├── controller
│   ├── service
│   ├── repository
│   ├── entity
│   └── dto
└── card
    └── ...
```

현재 프로젝트의 기본 패키지인 `com.example.bankbank`를 기준으로 작성했습니다. 이전 설명의 `com.bankbank`는 예시이며, 기본 패키지 변경 여부는 별도로 결정합니다. 위 도메인들은 구조 예시이며 필요한 기능부터 생성합니다.

### 계층별 역할

| 패키지 | 역할 |
| --- | --- |
| `controller` | HTTP 요청 수신, 요청값 검증, 서비스 호출 및 응답 반환 |
| `service` | 업무 로직과 트랜잭션 처리 |
| `repository` | 데이터베이스 조회 및 저장 |
| `entity` | 데이터베이스에 매핑되는 도메인 객체 |
| `dto` | API 요청·응답 데이터 전달 |
| `common/config` | 공통 설정 |
| `common/exception` | 공통 예외 및 예외 처리 |
| `common/response` | 공통 응답 형식을 사용할 경우 관련 객체 관리 |

- Controller에 잔액 계산, 이체 처리 등 업무 로직을 작성하지 않습니다.
- Controller는 Service를 통해 업무를 처리합니다.
- API 요청·응답에는 DTO를 사용하고 Entity를 직접 노출하지 않습니다.
- 특정 도메인에서만 사용하는 코드는 해당 도메인에 둡니다.
- 여러 도메인에서 사용하는 공통 기능만 `common`에 둡니다.

### 이체 도메인 예시

```text
transfer
├── controller/TransferController.java
├── service/TransferService.java
├── repository/TransferRepository.java
├── entity/Transfer.java
└── dto
    ├── TransferRequest.java
    └── TransferResponse.java
```

## 2. 코드 작성 규칙

### 기본 형식

- 들여쓰기는 탭 대신 스페이스 4칸을 사용합니다.
- 여는 중괄호는 선언문과 같은 줄에 작성합니다.
- 조건문과 반복문은 본문이 한 줄이어도 중괄호를 사용합니다.
- 사용하지 않는 import와 주석 처리된 불필요한 코드는 제거합니다.
- `var` 대신 명시적인 타입을 사용합니다.

```java
public void validateAmount(Long amount) {
    if (amount == null || amount <= 0) {
        throw new IllegalArgumentException("이체 금액은 0보다 커야 합니다.");
    }
}
```

위 코드는 작성 형식 예시입니다. 실제 API 예외 응답은 팀에서 정한 공통 예외 처리 방식에 맞춥니다.

### 메서드와 주석

- 메서드는 이름으로 설명할 수 있는 하나의 책임을 갖도록 작성합니다.
- 복잡한 검증이나 반복되는 로직은 의미 있는 이름의 메서드로 분리합니다.
- 서비스 메서드는 하나의 업무를 위해 여러 단계를 조합할 수 있습니다. 예를 들어 이체 서비스가 계좌 조회, 검증, 출금, 입금, 거래내역 저장을 조합하는 것은 가능합니다.
- 주석에는 코드만으로 알기 어려운 업무 조건이나 선택 이유를 작성합니다.

### 의존성 주입과 Lombok

- 의존성은 생성자로 주입합니다.
- 주입받는 필드는 `final`로 선언합니다.
- 필요한 경우 `@RequiredArgsConstructor`로 생성자를 생성합니다.
- 조회가 필요한 필드에는 `@Getter`를 사용합니다.
- JPA Entity의 기본 생성자는 `@NoArgsConstructor(access = AccessLevel.PROTECTED)`로 제한합니다.
- Entity에는 `@Data`와 클래스 전체 `@Setter`를 사용하지 않습니다.
- 상태 변경은 `withdraw()`, `deposit()`처럼 의도가 드러나는 메서드로 표현합니다.

```java
@Service
@RequiredArgsConstructor
public class TransferService {
    private final AccountRepository accountRepository;
    private final TransferRepository transferRepository;
}
```

## 3. Java 네이밍 규칙

| 대상 | 규칙 | 예시 |
| --- | --- | --- |
| 클래스·인터페이스 | PascalCase | `AccountService`, `TransferRepository` |
| 메서드 | camelCase, 동사로 시작 | `createAccount()`, `transferMoney()` |
| 변수·필드 | camelCase | `accountNumber`, `transferAmount` |
| 상수 | UPPER_SNAKE_CASE | `MAX_TRANSFER_AMOUNT` |
| 패키지 | 소문자 | `account`, `transfer`, `repository` |
| Java 파일 | public 클래스명과 동일 | `AccountService.java` |

- `data`, `temp`, `obj`처럼 의미가 불분명한 이름을 피합니다.
- `accNo`보다 `accountNumber`처럼 뜻을 알 수 있는 이름을 사용합니다.
- 같은 개념에는 같은 이름을 사용합니다. 회원을 `member`로 정했다면 같은 의미로 `user`와 혼용하지 않습니다.
- 출금 계좌와 입금 계좌는 각각 `senderAccount`, `receiverAccount`로 구분합니다.

### 계층별 클래스명

| 역할 | 형식 | 예시 |
| --- | --- | --- |
| Controller | 도메인 + Controller | `TransferController` |
| Service | 도메인 + Service | `TransferService` |
| Repository | 도메인 + Repository | `TransferRepository` |
| Entity | 도메인 단수형 | `Account`, `Transfer` |

## 4. DTO 네이밍 규칙

- 요청 DTO는 `Request`, 응답 DTO는 `Response`로 끝납니다.
- 기능 구분이 필요하면 도메인 뒤에 동작을 붙입니다.
- 요청과 응답에 같은 DTO를 재사용하지 않습니다.

| 용도 | 예시 |
| --- | --- |
| 이체 요청·응답 | `TransferRequest`, `TransferResponse` |
| 계좌 생성 요청 | `AccountCreateRequest` |
| 계좌 수정 요청 | `AccountUpdateRequest` |
| 계좌 조회 응답 | `AccountResponse` |
| 로그인 요청·응답 | `LoginRequest`, `LoginResponse` |

```java
@Getter
@NoArgsConstructor
public class TransferRequest {
    private Long senderAccountId;
    private Long receiverAccountId;
    private Long amount;
}
```

위 DTO는 네이밍 예시입니다. 실제 구현에는 입력값 검증을 추가합니다. `Long amount`는 원 단위 정수 금액을 가정한 예시이며, 소수 금액이 필요하면 금액 타입과 정밀도를 별도로 합의합니다.

## 5. API URL 네이밍 규칙

- 기본 경로는 `/api`를 사용합니다.
- 경로는 소문자와 명사를 중심으로 작성합니다.
- 자원 목록은 복수형을 사용합니다.
- 여러 단어로 이루어진 경로는 `kebab-case`를 사용합니다.
- 조회·생성·수정·삭제 동작은 HTTP Method로 구분합니다.
- 경로 변수는 `accountId`, `transferId`처럼 의미를 명확하게 작성합니다.

| 기능 | Method | URL |
| --- | --- | --- |
| 계좌 목록 조회 | GET | `/api/accounts` |
| 계좌 상세 조회 | GET | `/api/accounts/{accountId}` |
| 계좌 생성 | POST | `/api/accounts` |
| 계좌 정보 일부 수정 | PATCH | `/api/accounts/{accountId}` |
| 이체 실행 | POST | `/api/transfers` |
| 이체 상세 조회 | GET | `/api/transfers/{transferId}` |

복합 단어 경로 예시: `/api/transfer-history`

`/api/getAccount`, `/api/createAccount`처럼 동작을 URL에 중복해서 넣지 않습니다.

## 6. DB 네이밍 규칙

- 테이블명과 컬럼명은 소문자 `snake_case`를 사용합니다.
- 테이블명은 `members`, `accounts`, `transfers`처럼 복수형을 기본으로 합니다.
- 이력처럼 집합 의미를 가진 이름은 `transaction_history`처럼 작성할 수 있습니다.
- Java 필드는 camelCase, 대응하는 DB 컬럼은 snake_case로 구분합니다.

| 의미 | Java 필드 | DB 컬럼 |
| --- | --- | --- |
| 계좌 식별자 | `accountId` | `account_id` |
| 계좌번호 | `accountNumber` | `account_number` |
| 이체 금액 | `transferAmount` | `transfer_amount` |
| 생성 시각 | `createdAt` | `created_at` |
| 수정 시각 | `updatedAt` | `updated_at` |

실제 테이블명·컬럼명은 ERD와 일치시키며, 예시만 보고 기존 스키마를 변경하지 않습니다.

## 7. Git 협업 규칙

이전에 함께 논의한 Git 규칙을 포함합니다. 아래 브랜치 구성은 팀 적용을 위한 제안입니다.

### 브랜치

| 브랜치 | 용도 |
| --- | --- |
| `main` | 배포 가능한 안정 버전 |
| `develop` | 개발 내용 통합 |
| `feature/*` | 기능 개발 |
| `fix/*` | 버그 수정 |

```text
feature/account
feature/transfer
feature/login
fix/transfer-balance
```

브랜치명은 소문자로 작성하고, 여러 단어는 하이픈으로 연결합니다.

### 커밋 메시지

형식: `타입: 작업 내용`

| 타입 | 용도 |
| --- | --- |
| `feat` | 새로운 기능 |
| `fix` | 버그 수정 |
| `refactor` | 기능 변경 없는 코드 구조 개선 |
| `test` | 테스트 추가·수정 |
| `docs` | 문서 작성·수정 |
| `chore` | 빌드·설정 등 기타 작업 |

```text
feat: 계좌이체 기능 구현
fix: 잔액 검증 오류 수정
refactor: 이체 검증 로직 분리
test: 이체 실패 시 롤백 테스트 추가
docs: 개발 컨벤션 문서 작성
chore: 프로젝트 설정 변경
```

### 작업 흐름

1. Issue에 작업 목적과 범위를 작성합니다.
2. 작업 브랜치를 생성합니다.
3. 구현 및 테스트 후 커밋합니다.
4. PR에 변경 내용, 테스트 결과, 관련 Issue를 작성합니다.
5. 팀원 리뷰 후 통합 브랜치에 병합합니다.

## 8. 리뷰 체크리스트

- [ ] 코드가 담당 도메인과 계층에 맞게 배치되어 있는가?
- [ ] 클래스·메서드·변수명이 규칙을 따르고 역할을 설명하는가?
- [ ] 요청·응답 DTO가 구분되어 있는가?
- [ ] Controller와 Service의 역할이 분리되어 있는가?
- [ ] Entity 상태 변경의 의도가 메서드명에 드러나는가?
- [ ] API 및 DB 이름이 합의한 규칙을 따르는가?
- [ ] 변경 기능의 정상 동작과 주요 예외 상황을 확인했는가?

초기에는 이 문서와 PR 리뷰로 규칙을 확인합니다. 자동 포맷터나 Checkstyle 도입은 팀이 필요할 때 별도로 결정합니다.
