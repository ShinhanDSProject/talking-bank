# Bank-Bank 백엔드 개발 규칙 — 코드 구조 상세안

> 팀 검토용 초안 v2 · 코드 구조 상세화
> Spring Boot·Java 백엔드 개발을 시작하기 전에 코드 구조와 작성 방식을 맞추기 위한 문서입니다. 팀 논의 후 공통 규칙으로 확정합니다.
> 개별 기능의 구현 방식, 업무 정책, 상세 API·DB 설계는 별도로 논의합니다.

## 1. 코드 구조

### 1.1 구조의 목적과 원칙

이 구조의 목적은 팀원별 작업 위치를 명확히 하고, 기능을 합칠 때 코드가 섞이는 일을 줄이는 것입니다.

기본 방식은 **도메인별 패키지 + 도메인 내부 계층 구조**입니다. 기능이 추가되면 관련 도메인을 먼저 찾고, 그 안에서 역할에 맞는 위치에 코드를 작성합니다.

- `member`, `account`처럼 업무 영역을 기준으로 코드를 모읍니다.
- 각 영역 안에서는 요청 처리, 업무 처리, DB 접근을 구분합니다.
- 각 기능이 함께 사용하는 코드만 `common`으로 분리합니다.
- 패키지와 클래스는 실제 필요할 때 생성합니다. 아래 트리는 목표 배치도이며 생성 목록이 아닙니다.
- 현재는 하나의 Spring Boot 애플리케이션으로 구성합니다. 도메인마다 별도 서버나 Gradle 모듈을 만들지 않습니다.

### 1.2 프로젝트 전체 구조

현재 Spring Boot 프로젝트가 저장소 루트에 있는 구성을 기준으로 합니다. `backend/` 폴더로 이동하는 작업은 전제하지 않습니다.

```text
bank-bank/
├── build.gradle
├── settings.gradle
├── gradlew
├── gradlew.bat
├── gradle/
├── src/
│   ├── main/
│   │   ├── java/com/example/bankbank/
│   │   │   ├── BankBankApplication.java
│   │   │   ├── common/
│   │   │   ├── auth/
│   │   │   ├── member/
│   │   │   ├── account/
│   │   │   ├── transfer/
│   │   │   ├── transaction/
│   │   │   ├── scheduledtransfer/
│   │   │   ├── fds/
│   │   │   ├── admin/
│   │   │   └── monitoring/
│   │   └── resources/
│   │       └── application.yaml
│   └── test/
│       ├── java/com/example/bankbank/
│       └── resources/
├── docs/                         # 합의한 개발 문서
└── README.md
```

기본 패키지는 현재 프로젝트의 `com.example.bankbank`를 유지한 예시입니다. 변경한다면 개발 시작 전에 팀이 한 번에 합의합니다.

`monitoring`은 MVP 포함 여부를 확인한 뒤 생성합니다. 검토 중인 주식 포트폴리오와 MVP에 없는 카드 기능은 현재 구조에 추가하지 않습니다.

### 1.3 MVP와 담당 패키지

| 패키지 | 담당 범위 | 경계 |
| --- | --- | --- |
| `auth` | 로그인, JWT, 인증·접근 제어 설정 | 회원가입과 회원 정보 관리는 `member` |
| `member` | 회원가입, 회원 정보 | 계좌 자체의 생성·관리는 `account` |
| `account` | 계좌 생성, 본인 계좌 조회, 계좌 상태 | 송금 업무 전체의 흐름은 `transfer` |
| `transfer` | 계좌 간 송금 요청·처리·결과 | 개별 계좌 입출금 내역은 `transaction` |
| `transaction` | 계좌별 입금·출금 기록과 조회 | 송금을 시작하는 기능은 아님 |
| `scheduledtransfer` | 자동이체 등록·조회·해지, 예약 실행 진입점 | 실제 송금 처리는 `transfer`와 공통으로 사용 |
| `fds` | AI 서비스 연동, FDS 판단 결과 관리 | Python 모델 구현은 별도 AI 프로젝트 |
| `admin` | 관리자 전용 회원·계좌·송금·FDS 조회 | 원본 데이터를 별도 Entity로 복제하지 않음 |
| `monitoring` | 관리자 시스템 지표 조회 및 Prometheus 연동 | 포함 범위 확정 후 생성 |
| `common` | 여러 도메인이 공유하는 설정·예외 처리·응답 형식 | 특정 기능 전용 로직은 넣지 않음 |

패키지 수가 곧 담당자 수를 의미하지는 않습니다. 한 사람이 관련된 여러 패키지를 맡을 수 있으며, 인원별 분담은 별도 표로 관리합니다.

### 1.4 도메인 내부의 표준 구조

```text
도메인/
├── controller/       # HTTP 요청·응답 처리
├── service/          # 업무 흐름과 규칙
├── repository/       # DB 조회·저장
├── entity/           # 영속 객체와 상태 변경
├── dto/
│   ├── request/      # API 요청 객체
│   └── response/     # API 응답 객체
├── exception/        # 도메인 전용 예외가 필요한 경우
└── client/           # 외부 서비스 호출이 필요한 경우
```

| 위치 | 작성할 코드 | 넣지 않을 코드 |
| --- | --- | --- |
| Controller | URL 매핑, 입력 형식 검증, 인증 사용자 전달, Service 호출 | 잔액 계산, 직접 DB 조회 |
| Service | 업무 조건 검증, 기능 흐름 조합, Repository·Client 호출 | HTTP 응답 객체를 조립하는 웹 처리 |
| Repository | Entity 조회·저장, 쿼리 | HTTP 요청 처리, 전체 업무 흐름 |
| Entity | DB 매핑과 해당 객체의 상태 변경 | Controller·Service 호출, 외부 API 호출 |
| DTO | 요청·응답에 필요한 필드 | DB 접근, 업무 실행 |
| Client | 외부 API 요청·응답 변환 | Controller 역할, 도메인 전체 업무 판단 |
| 도메인 Exception | 특정 업무에서 발생하는 오류 표현 | HTTP 오류 응답을 직접 작성하는 처리 |

기본 흐름은 `Controller → Service → Repository`입니다. Service는 필요에 따라 Entity의 상태 변경 메서드나 외부 연동 Client를 사용합니다.

DTO는 `request / response`로 구분하는 안을 제안합니다. 팀이 더 단순한 구성을 원하면 `dto` 한 곳으로 통일해도 되지만, 도메인마다 서로 다른 방식으로 섞지는 않습니다.

### 1.5 MVP 기준 상세 배치 예시

아래 클래스명은 팀원들이 작업 위치를 판단하기 위한 예시입니다. 메서드, API 목록, DB 스키마를 확정하는 내용은 아닙니다.

#### 인증과 회원

```text
auth/
├── controller/AuthController.java
├── service/AuthService.java
├── dto/
│   ├── request/LoginRequest.java
│   └── response/LoginResponse.java
├── config/SecurityConfig.java
├── jwt/
│   ├── JwtProvider.java
│   └── JwtAuthenticationFilter.java
└── security/
    └── LoginMember.java            # 인증된 사용자 표현이 필요한 경우

member/
├── controller/MemberController.java
├── service/MemberService.java
├── repository/MemberRepository.java
├── entity/Member.java
└── dto/
    ├── request/MemberCreateRequest.java
    └── response/MemberResponse.java
```

회원가입은 `member`, 로그인은 `auth`에 둡니다. 인증 관련 설정은 `auth/config`에 모아 `common/config`와 중복 관리하지 않습니다. Refresh Token 등 아직 범위가 정해지지 않은 기능의 클래스는 미리 만들지 않습니다.

#### 계좌·송금·거래 내역

```text
account/
├── controller/AccountController.java
├── service/AccountService.java
├── repository/AccountRepository.java
├── entity/Account.java
└── dto/response/AccountResponse.java

transfer/
├── controller/TransferController.java
├── service/TransferService.java
├── repository/TransferRepository.java
├── entity/Transfer.java
└── dto/
    ├── request/TransferCreateRequest.java
    └── response/TransferResponse.java

transaction/
├── controller/AccountTransactionController.java
├── service/AccountTransactionService.java
├── repository/AccountTransactionRepository.java
├── entity/AccountTransaction.java
└── dto/response/AccountTransactionResponse.java
```

- 회원가입 과정에서 계좌를 생성하더라도 계좌 생성 코드는 `account`가 담당합니다. 별도의 사용자 계좌 생성 Controller를 반드시 만드는 것은 아닙니다.
- `Transfer`는 송금 한 건을, `AccountTransaction`은 계좌별 입금·출금 기록을 표현합니다.
- Java 클래스명은 DB 트랜잭션과 혼동하지 않도록 `Transaction` 단독 사용을 피합니다.
- 내 계좌 화면에서 최근 거래를 함께 보여주더라도 거래 내역 Entity를 `account`에 다시 만들지 않습니다.

#### 자동이체

```text
scheduledtransfer/
├── controller/ScheduledTransferController.java
├── service/ScheduledTransferService.java
├── scheduler/ScheduledTransferScheduler.java
├── repository/ScheduledTransferRepository.java
├── entity/ScheduledTransfer.java
└── dto/
    ├── request/ScheduledTransferCreateRequest.java
    └── response/ScheduledTransferResponse.java
```

Scheduler는 정해진 실행 시점에 Service를 호출하는 진입점입니다. Scheduler 안에 송금 로직을 작성하지 않습니다. 실행 이력을 별도 객체로 설계한다면 관련 Entity·Repository를 이 도메인에 추가합니다. 주기·재시도·실행 이력 스키마는 별도 설계에서 결정합니다.

#### FDS 연동

```text
fds/
├── service/FdsService.java
├── client/
│   ├── FdsClient.java
│   └── dto/
│       ├── FdsEvaluateRequest.java
│       └── FdsEvaluateResponse.java
├── repository/FdsAssessmentRepository.java
└── entity/FdsAssessment.java
```

외부 AI 통신용 DTO는 `client/dto`에 둡니다. 사용자·관리자에게 반환할 API DTO와 구분하기 위해서입니다. 사용자에게 직접 제공하는 FDS API가 없다면 `FdsController`는 만들지 않습니다.

#### 관리자와 모니터링

```text
admin/
├── controller/
│   ├── AdminMemberController.java
│   ├── AdminAccountController.java
│   ├── AdminTransferController.java
│   ├── AdminFdsController.java
│   └── AdminTransactionController.java
├── service/
│   ├── AdminMemberQueryService.java
│   ├── AdminAccountQueryService.java
│   ├── AdminTransferQueryService.java
│   ├── AdminFdsQueryService.java
│   └── AdminTransactionQueryService.java
└── dto/response/
    ├── AdminMemberResponse.java
    ├── AdminAccountResponse.java
    ├── AdminTransferResponse.java
    ├── AdminFdsAssessmentResponse.java
    └── AdminTransactionResponse.java

monitoring/                              # MVP 포함 확정 시
├── controller/AdminMonitoringController.java
├── service/MonitoringService.java
├── client/PrometheusClient.java
└── dto/response/SystemMetricsResponse.java
```

관리자 영역은 관련 기능이 많아질 수 있으므로 하나의 `AdminService`에 모두 넣지 않는 배치를 제안합니다. 초기에 필요한 조회부터 작성하며, 단순한 기능은 클래스 수를 줄여 시작할 수 있습니다.

`admin`에는 `AdminMember`, `AdminAccount` 같은 원본 데이터 복제 Entity를 만들지 않습니다. 관리자 응답 DTO와 조회 흐름을 분리하고 기존 도메인의 데이터를 사용합니다. 모니터링도 관리자 기능이지만 외부 지표 연동이라는 역할이 있어 별도 패키지에 둡니다.

### 1.6 공통 코드의 범위

```text
common/
├── config/                         # 앱 전체 공통 설정
├── exception/
│   └── GlobalExceptionHandler.java
└── response/
    └── ErrorResponse.java
```

- 전역 예외 응답 변환은 `GlobalExceptionHandler`, 오류 응답 형식은 `ErrorResponse`에서 공통 관리합니다.
- JWT 코드는 `auth`, AI 통신 코드는 `fds`, Prometheus 연동은 `monitoring`에 둡니다.
- 설정 클래스라는 이유만으로 전부 `common/config`에 모으지 않습니다.
- 실제 공통 응답 형식이 합의되기 전에는 모든 응답을 감싸는 `ApiResponse`를 의무적으로 만들지 않습니다.
- `CommonService`, `CommonUtils`처럼 목적이 모호한 클래스를 피합니다. 유틸리티가 필요하면 역할이 드러나는 이름을 사용합니다.
- 공통화 여부가 애매하면 우선 해당 도메인에 두고, 실제로 공유할 필요가 생겼을 때 옮깁니다.

### 1.7 도메인 사이의 연결 기준

도메인을 나누더라도 회원가입과 계좌 생성처럼 여러 영역이 함께 처리하는 기능이 있습니다. 이 경우 전체 업무를 시작하는 Service가 흐름을 조합합니다.

```text
회원가입 요청 → MemberService → AccountService
일반 송금 요청 → TransferService → 계좌·거래 내역·FDS 관련 기능
자동이체 실행 → ScheduledTransferService → 공통 송금 기능
관리자 조회 → 관리자 QueryService → 필요한 도메인 데이터
```

화살표는 협업 관계를 설명하며, 정확한 호출 순서나 트랜잭션 경계를 정의하지 않습니다.

- 다른 도메인의 상태를 바꾸는 기능은 그 도메인이 제공하는 Service·Entity 규칙을 통해 처리합니다. 같은 업무 규칙을 여러 패키지에 복사하지 않습니다.
- 단순 조회는 해당 도메인의 조회 Service 또는 Repository를 재사용할 수 있습니다. 관리자 전용 복합 조회는 필요할 때 조회 전용 코드를 추가합니다.
- 다른 Controller를 호출해서 내부 기능을 재사용하지 않습니다.
- Service끼리 서로 호출하는 순환 구조가 생기면 책임과 흐름을 다시 나눕니다.
- 사용자용 Controller DTO를 내부 공통 계약으로 무조건 재사용하지 않습니다. 내부 전달 객체가 필요할 때만 목적에 맞게 추가합니다.
- 아직 필요하지 않은 interface·mapper·facade 계층을 모든 도메인에 일괄 생성하지 않습니다.

### 1.8 테스트·설정·문서 배치

| 종류 | 위치 | 기준 |
| --- | --- | --- |
| 테스트 코드 | `src/test/java` | 대상 클래스의 패키지 경로를 따라 배치 |
| 테스트 전용 자원 | `src/test/resources` | 테스트에서 사용하는 설정·fixture |
| 애플리케이션 설정 | `src/main/resources` | 공통 설정과 필요한 환경별 설정 |
| 개발 규칙 | `docs/CONVENTION.md` | 팀 합의 후 프로젝트에 반영할 위치 제안 |
| API 명세·ERD | `docs/` 또는 합의한 문서 도구 | 코드 컨벤션과 별도로 관리 |

환경별 설정 파일은 필요한 환경이 정해진 후 추가합니다. 비밀값은 설정 파일에 직접 넣지 않습니다. 테스트 클래스 이름은 `대상클래스명 + Test`로 작성합니다.

### 1.9 팀 작업을 나누는 기준

담당자는 파일 한 개가 아니라 기능 흐름을 맡습니다. 예를 들어 계좌 담당자는 관련 Controller·Service·Repository·DTO·테스트를 함께 관리합니다.

| 작업 묶음 예시 | 관련 패키지 | 먼저 맞출 협업 지점 |
| --- | --- | --- |
| 회원·인증 | `member`, `auth` | 인증 사용자 표현, 회원가입과 계좌 생성의 연결 |
| 계좌·거래 조회 | `account`, `transaction` | 계좌 조회와 송금 기능에서 사용할 공통 코드 |
| 송금·자동이체 | `transfer`, `scheduledtransfer` | 일반 송금과 예약 실행의 공통 진입점 |
| FDS 연동 | `fds` | AI 요청·응답 계약, 송금 담당자와의 호출 경계 |
| 관리자 | `admin` | 각 도메인의 조회 데이터와 관리자 응답 |
| 공통 기반 | `common`, 설정·빌드 파일 | 공통 예외·포맷·설정 변경 공유 |

이 표는 실제 인원 배정이 아닙니다. 팀 규모에 따라 묶거나 나눕니다. 여러 사람이 사용하는 클래스나 DTO를 바꿀 때에는 관련 담당자에게 변경 내용을 먼저 공유합니다.

### 1.10 개발 시작 전 합의 순서

1. 기본 패키지명과 도메인별 담당 범위를 정합니다.
2. Controller·Service·Repository·DTO 위치와 네이밍을 맞춥니다.
3. 여러 기능이 공유할 인증 사용자 표현과 오류 응답 형식을 합의합니다.
4. 각 담당자가 필요한 클래스만 생성해 기능 개발을 시작합니다.
5. 개발 중 구조 변경이 필요하면 관련 담당자와 논의하고 문서를 갱신합니다.

이 단계에서는 모든 Entity 필드나 메서드까지 정하지 않습니다. 그 내용은 API·DB·기능 설계에서 구체화합니다.

## 2. 코드 컨벤션

### 기본 형식

- 들여쓰기는 탭 대신 스페이스 4칸을 사용합니다.
- 여는 중괄호는 선언문과 같은 줄에 작성합니다.
- 조건문·반복문은 본문이 한 줄이어도 중괄호를 사용합니다.
- 메서드 사이에는 빈 줄을 둡니다.
- 사용하지 않는 import, 변수, 주석 처리된 코드는 제거합니다.
- wildcard import 대신 필요한 클래스를 명시적으로 import합니다.
- `var` 대신 타입을 명시합니다.

```java
public String normalizeEmail(String email) {
    if (email == null) {
        throw new IllegalArgumentException("이메일이 필요합니다.");
    }

    return email.trim();
}
```

위 코드는 형식 예시이며 실제 이메일 검증 정책을 정의하지 않습니다.

### 클래스·메서드

- 클래스와 메서드는 이름으로 역할을 알 수 있도록 작성합니다.
- 한 메서드에 서로 관련 없는 작업을 넣지 않습니다.
- 반복되거나 복잡한 로직은 의미 있는 이름의 메서드로 분리합니다.
- 한 업무의 여러 단계를 조합하는 Service 메서드는 허용합니다.
- 클래스 내부는 상수 → 필드 → 생성자 → 메서드 순서로 작성합니다.
- 접근 범위는 필요한 만큼만 공개합니다. 클래스 내부에서만 사용하는 메서드는 `private`으로 작성합니다.

### 의존성 주입

생성자 주입을 기본으로 사용합니다. 주입받는 필드는 `final`로 선언하고, Lombok의 `@RequiredArgsConstructor`를 사용할 수 있습니다.

```java
@Service
@RequiredArgsConstructor
public class AccountService {
    private final AccountRepository accountRepository;
}
```

필드에 `@Autowired`를 붙이는 방식은 사용하지 않습니다.

### Lombok·Entity

- 필요한 기능에 맞춰 `@Getter`, `@RequiredArgsConstructor` 등을 사용합니다.
- JPA Entity의 기본 생성자는 `@NoArgsConstructor(access = AccessLevel.PROTECTED)`로 작성합니다.
- Entity에는 `@Data`와 클래스 전체 `@Setter`를 사용하지 않습니다.
- 상태 변경은 `changePhoneNumber()`처럼 목적이 드러나는 메서드로 표현합니다.
- 모든 클래스에 같은 Lombok annotation을 일괄 적용하지 않습니다.

### DTO

- 요청 DTO와 응답 DTO를 분리합니다.
- DTO에는 해당 요청·응답에 필요한 필드만 포함합니다.
- 요청 입력 형식은 Validation annotation과 `@Valid`를 이용해 검증합니다.
- 업무 조건에 대한 검증은 Service 또는 해당 도메인에서 처리합니다.
- DTO를 일반 클래스와 `record` 중 무엇으로 작성할지는 팀에서 통일합니다.

### 예외·주석

- 예외를 잡고 아무 처리 없이 무시하지 않습니다.
- API 예외 응답은 공통 예외 처리에서 일관되게 변환합니다.
- 주석은 코드 자체의 반복 설명보다 작성 이유나 주의할 조건을 설명합니다.
- 비밀번호·토큰 등 비밀값을 코드와 로그에 남기지 않습니다.

## 3. 네이밍 규칙

### Java 기본 이름

| 대상 | 규칙 | 예시 |
| --- | --- | --- |
| 클래스·인터페이스 | PascalCase | `AccountService`, `AccountRepository` |
| 메서드 | camelCase, 동사로 시작 | `findAccount()`, `createMember()` |
| 변수·필드 | camelCase | `accountNumber`, `memberId` |
| boolean 변수 | 의미가 드러나는 조건 표현 | `active`, `authenticated` |
| boolean 메서드 | is·has·can 등 | `isActive()`, `hasPermission()` |
| 상수·enum 값 | UPPER_SNAKE_CASE | `DEFAULT_PAGE_SIZE`, `ACTIVE` |
| 패키지 | 소문자 | `account`, `repository` |
| Java 파일 | 클래스명과 동일 | `AccountService.java` |

`data`, `temp`, `obj`처럼 의미가 불분명한 이름과 지나친 축약을 피합니다. 약어는 `FdsClient`, `JwtProvider`, `memberId`처럼 표기합니다.

### 역할별 클래스 이름

| 역할 | 이름 형식 | 예시 |
| --- | --- | --- |
| Controller | 도메인 + Controller | `AccountController` |
| Service | 도메인 + Service | `AccountService` |
| Repository | 도메인 + Repository | `AccountRepository` |
| Entity | 도메인 단수형 | `Account`, `Member` |
| 요청 DTO | 도메인 + 동작(필요 시) + Request | `MemberCreateRequest` |
| 응답 DTO | 도메인 + 동작(필요 시) + Response | `MemberResponse` |
| 외부 API 연동 | 대상 + Client | `FdsClient` |
| 테스트 클래스 | 대상 클래스 + Test | `AccountServiceTest` |

### 공통 용어

| 의미 | 사용할 단어 제안 |
| --- | --- |
| 회원 | `member` |
| 인증 | `auth` |
| 계좌 | `account` |
| 송금 | `transfer` |
| 이상 거래 탐지 | `fds` |
| 관리자 | `admin` |

같은 의미로 `member`, `user`, `customer`를 섞어 사용하지 않습니다. 추가 용어는 담당 기능을 나눌 때 합의합니다.

### API·DB 이름

| 대상 | 규칙 | 예시 |
| --- | --- | --- |
| API 경로 | 소문자·복수형 명사 중심 | `/api/accounts` |
| 복합 단어 경로 | kebab-case | `/api/scheduled-transfers` |
| JSON 필드·경로 변수 | camelCase | `accountNumber`, `{accountId}` |
| DB 테이블 | 복수형 snake_case | `members`, `accounts` |
| DB 컬럼 | snake_case | `account_number`, `created_at` |

API의 동작은 HTTP Method로 표현합니다. `/api/getAccount`처럼 URL에 동사를 중복해서 넣지 않습니다. 실제 API 목록과 테이블 설계는 별도 문서에서 정의합니다.

## 4. 팀 논의 후 확정할 내용

- 도메인별 패키지 구성·담당 범위와 공통 코드 경계
- DTO의 request/response 분리 방식
- 관리자 조회 구조와 모니터링의 MVP 포함 여부
- 기본 패키지명 유지 또는 변경 여부
- DTO를 일반 클래스와 `record` 중 어떤 방식으로 통일할지
- 팀 공용 IDE 포맷터와 import 정렬 설정
- 공통 용어와 네이밍에 수정·추가할 내용

초기에는 합의한 규칙을 문서와 코드 리뷰로 확인합니다. 규칙을 변경할 때에는 팀에 공유하고 문서도 함께 수정합니다.
