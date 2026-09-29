# talking-bank ERD 초안

> 기준: [MVP](./mvp.md). PRD가 아직 작성되지 않아 아래 테이블·컬럼·제약은 팀 검토용 설계 제안이다. DB 마이그레이션이나 구현을 확정하는 문서가 아니다.

## 1. 설계 범위와 공통 규칙

- 사용자와 로그인 수단을 분리하여 이메일·카카오·구글로 같은 계정에 접근한다.
- 가입자와 시연용 가상 인물은 동일한 계좌 소유자 구조를 사용하되, 가상 인물은 로그인하지 못한다.
- 은행·계좌·송금·결제·충전은 모두 프로젝트 내부의 가상 데이터다.
- 금융상품, 패스키, 생체 인증, 실제 금융기관 연동은 포함하지 않는다.
- PK는 `BIGINT`, 금액은 `DECIMAL(19,0)` 및 Java `BigDecimal`을 제안한다. MVP는 원화 정수 금액만 취급한다.
- 모든 테이블에 `id`, `created_at`, `updated_at`을 둔다. 시간 필드는 `BaseTimeEntity`와 JPA Auditing으로 관리하며 DB 기본값이나 `@PrePersist`를 사용하지 않는다.
- 업무 발생 시각인 `occurred_at`은 생성 시각과 구분한다. 샘플 거래는 과거 발생 시각을 가질 수 있다. 시각은 UTC로 저장하고 소비 기간은 한국 시간 기준으로 계산하는 방안을 제안한다.
- 아래 표의 `?`는 NULL 허용이다. 나머지는 NOT NULL이다. 문자열 길이와 DB별 자료형은 물리 설계 때 확정한다.
- 금융 기록이 연결된 사용자·계좌·가맹점·카테고리는 삭제를 제한한다. 상태 전환을 사용하고 금융 기록에 연쇄 삭제를 적용하지 않는다.

## 2. 관계도

```mermaid
erDiagram
    users ||--o{ login_identities : authenticates
    users ||--o| transfer_credentials : protects
    users ||--o{ accounts : owns
    banks ||--o{ accounts : provides
    users ||--o| user_preferences : configures
    accounts o|--o{ user_preferences : default_account
    users ||--o{ saved_recipients : saves
    accounts ||--o{ saved_recipients : recipient
    users ||--o{ money_operations : requests
    accounts o|--o{ money_operations : source
    accounts o|--o{ money_operations : destination
    merchants o|--o{ money_operations : payment_target
    money_operations ||--o{ account_entries : posts
    accounts ||--o{ account_entries : records
    account_entries ||--o| expense_classifications : categorizes
    spending_categories o|--o{ expense_classifications : selected_category
    spending_categories ||--o{ merchants : default_category
    users ||--o{ conversations : owns
    conversations ||--o{ messages : contains
    conversations o|--o{ transfer_drafts : holds
    users ||--o{ transfer_drafts : prepares
    accounts o|--o{ transfer_drafts : source
    accounts o|--o{ transfer_drafts : destination
    transfer_drafts o|--o| money_operations : executes
```

금융 작업 한 건(`money_operations`)과 계좌별 입출금 기록(`account_entries`)을 구분한다. 완료된 송금은 작업 한 건과 출금·입금 기록 두 건으로 표현한다. 관계도의 0개 이상 기록은 실행 중·실패 상태도 표현하기 위한 것이며, 완료 상태별 기록 개수는 5절에서 제한한다.

## 3. 사용자·인증·계좌

### users — 사용자와 가상 인물

| 컬럼 | 의미 / 제약 |
| --- | --- |
| display_name | 화면 표시 이름 |
| user_type | `REGISTERED`, `DEMO` |
| role | `USER`, `ADMIN` |
| status | `ACTIVE`, `BLOCKED` |

`DEMO`는 시연용 계좌 소유자이며 로그인 수단을 생성하지 않는다. 관리자도 별도 로그인 테이블 없이 권한으로 구분한다. 가상 인물 생성 시 관리자를 지정할 수 없도록 서버에서 제한한다.

### login_identities — 로그인 수단

| 컬럼 | 의미 / 제약 |
| --- | --- |
| user_id | FK → users |
| provider | `EMAIL`, `KAKAO`, `GOOGLE` |
| subject | 이메일은 정규화된 로그인 이메일, 소셜은 공급자의 고유 사용자 식별자 |
| password_hash ? | 이메일 로그인 비밀번호 해시. 소셜 로그인에서는 NULL |

- UNIQUE `(provider, subject)`: 하나의 로그인 수단이 서로 다른 사용자에게 연결되지 않는다.
- UNIQUE `(user_id, provider)`: 공급자별 하나의 계정 연결을 제안한다.
- 이메일 계정은 비밀번호 해시가 필요하고 소셜 계정은 비밀번호를 저장하지 않는다.
- 소셜에서 제공한 이메일 주소로 계정을 자동 연결하지 않는다. 기존 로그인과 새 공급자 인증을 모두 확인하고 연결한다.

### transfer_credentials — 송금용 간편 비밀번호

| 컬럼 | 의미 / 제약 |
| --- | --- |
| user_id | FK → users, UNIQUE |
| pin_hash | 6자리 간편 비밀번호의 단방향 해시 |
| failed_attempts | 실패 횟수, 0 이상 |
| locked_until ? | 잠금 만료 시각 |

간편 비밀번호 설정 전에는 행이 없을 수 있으며, 이 상태에서는 송금을 실행하지 않는다. 원문 비밀번호와 PIN은 로그·응답·대화에 저장하지 않는다. 실패 한도와 복구 정책은 PRD에서 결정한다.

### banks — 가상 은행

| 컬럼 | 의미 / 제약 |
| --- | --- |
| code | 내부 은행 코드, UNIQUE |
| name | 농협은행 등 표시 이름 |
| status | `ACTIVE`, `INACTIVE` |

### accounts — 가상 계좌

| 컬럼 | 의미 / 제약 |
| --- | --- |
| user_id | FK → users, 계좌 소유자 |
| bank_id | FK → banks |
| account_number | 계좌번호 문자열 |
| balance | 현재 잔액, 0 이상 |
| status | `ACTIVE`, `BLOCKED` |

UNIQUE `(bank_id, account_number)`. 계좌번호는 선행 0을 보존한다. 사용자당 계좌 개수는 제한하지 않는 초안이며 구체적 한도는 PRD에서 검토한다. 소유자는 거래 생성 이후 변경하지 않는다.

### user_preferences — 사용자 설정

| 컬럼 | 의미 / 제약 |
| --- | --- |
| user_id | FK → users, UNIQUE |
| default_account_id ? | FK → accounts, 기본 출금 계좌 |

기본 출금 계좌는 해당 사용자 소유의 사용 가능한 계좌여야 한다. 다른 사용자 계좌를 지정하지 못하도록 서비스에서 검증한다.

### saved_recipients — 저장한 수취 계좌와 별명

| 컬럼 | 의미 / 제약 |
| --- | --- |
| user_id | FK → users, 등록한 사용자 |
| account_id | FK → accounts, 수취 계좌 |
| nickname | 엄마·민수 등 사용자 전용 별명 |

UNIQUE `(user_id, account_id)`. 별명은 전역 고유값이 아니다. 중복 별명을 허용하고 챗봇에서 후보를 선택하게 하는 방안을 제안한다. 이름이나 별명이 같다는 이유로 수취 계좌를 임의 확정하지 않는다.

## 4. 금융 작업·소비·대화

### money_operations — 자금 이동 작업

| 컬럼 | 의미 / 제약 |
| --- | --- |
| requested_by | FK → users, 사용자 또는 시연 데이터를 생성한 관리자 |
| type | `TRANSFER`, `PAYMENT`, `TOP_UP`, `INITIAL_FUNDING` |
| source_account_id ? | FK → accounts, 출금 계좌 |
| destination_account_id ? | FK → accounts, 입금 계좌 |
| merchant_id ? | FK → merchants, 결제 가맹점 |
| transfer_draft_id ? | FK → transfer_drafts, UNIQUE, 송금 승인 대상 |
| amount | 0보다 큰 금액 |
| status | `PENDING`, `COMPLETED`, `FAILED` |
| idempotency_key | 중복 실행 방지 요청 키 |
| request_fingerprint | 동일 키로 다른 금액·계좌를 요청했는지 확인할 정규화된 요청 지문 |
| data_origin | `USER_ACTION`, `SAMPLE`, `SYSTEM` |
| occurred_at | 업무 발생 시각 |
| completed_at ? | 완료 시각 |
| failure_code ? | 실패 사유 코드. 민감한 원문 저장 금지 |

UNIQUE `(requested_by, idempotency_key)`. 같은 키·같은 요청은 기존 결과를 반환하고, 같은 키·다른 요청은 거절한다.

| 유형 | 필수 대상 | NULL 대상 |
| --- | --- | --- |
| TRANSFER | 출금 계좌, 입금 계좌 | 가맹점 |
| PAYMENT | 출금 계좌, 가맹점 | 입금 계좌, 송금 초안 |
| TOP_UP / INITIAL_FUNDING | 입금 계좌 | 출금 계좌, 가맹점, 송금 초안 |

사용자 송금은 승인된 송금 초안이 필수다. 관리자 샘플 송금은 초안 없이 허용하되 관리자 권한과 `SAMPLE` 출처를 검증한다. 샘플 송금도 양쪽 계좌 기록이 필요하다. 결제는 외부 상점 계좌까지 모델링하지 않고 가맹점을 대상으로 한 출금으로 표현한다.

### account_entries — 계좌별 입출금 기록

| 컬럼 | 의미 / 제약 |
| --- | --- |
| operation_id | FK → money_operations |
| account_id | FK → accounts |
| direction | `DEBIT`, `CREDIT` |
| amount | 0보다 큰 금액 |
| balance_after | 반영 직후 계좌 잔액, 0 이상 |
| entry_sequence | 계좌별 증가 순번 |

UNIQUE `(operation_id, account_id)`, UNIQUE `(account_id, entry_sequence)`. 금액은 양수로 저장하고 입출금 방향으로 부호를 구분한다. 발생 시각은 작업의 `occurred_at`을 사용한다. 순번은 같은 계좌의 동시 거래 순서와 잔액 검증에 사용한다.

### spending_categories — 소비 카테고리

| 컬럼 | 의미 / 제약 |
| --- | --- |
| code | `FOOD`, `TRANSPORT` 등 내부 코드, UNIQUE |
| name | 식비·교통 등 표시 이름 |
| active | 신규 분류 사용 여부 |

카테고리 목록은 PRD에서 확정한다. 미분류는 별도 카테고리 대신 아래 분류 행의 NULL로 표현한다.

### merchants — 가상 가맹점

| 컬럼 | 의미 / 제약 |
| --- | --- |
| name | 가맹점 이름 |
| industry_code | 프로젝트 내부 업종 코드. 실제 MCC와 동일하다고 가정하지 않음 |
| default_category_id | FK → spending_categories |
| active | 신규 결제 가능 여부 |

### expense_classifications — 소비 대상 및 거래별 분류

| 컬럼 | 의미 / 제약 |
| --- | --- |
| account_entry_id | FK → account_entries, UNIQUE |
| category_id ? | FK → spending_categories, NULL이면 미분류 |
| classification_source | `AUTO`, `MANUAL`, `UNCLASSIFIED` |

분류 행은 결제 출금과 타인 송금 출금에만 생성한다. 본인 이체·충전·입금에는 생성하지 않는다. 이 행의 존재로 소비 포함 여부를 표현하며, NULL 카테고리도 총소비에 합산한다. 소유 사용자가 분류를 수정하면 `MANUAL`로 기록한다. 기본 카테고리는 결제 시 복사하고 가맹점 설정 변경으로 과거 거래를 재분류하지 않는다.

### conversations / messages — 대화

| 테이블 | 컬럼 | 의미 / 제약 |
| --- | --- | --- |
| conversations | user_id | FK → users |
| conversations | title | 대화 제목 |
| messages | conversation_id | FK → conversations |
| messages | role | `USER`, `ASSISTANT` |
| messages | input_type ? | 사용자 입력 `TEXT`, `VOICE`; AI 답변은 NULL |
| messages | content | 사용자 입력 또는 답변 텍스트 |
| messages | sequence | 대화 내 순서 |

UNIQUE `(conversation_id, sequence)`. 음성 원본 저장은 현재 범위에 넣지 않고 STT 결과 텍스트를 저장하는 방안을 제안한다. 차트 등 구조화된 응답 저장 형식과 보존 기간은 PRD에서 결정한다.

### transfer_drafts — 송금 대화와 확인 대상

| 컬럼 | 의미 / 제약 |
| --- | --- |
| user_id | FK → users, 요청자 |
| conversation_id ? | FK → conversations, 일반 화면에서는 NULL |
| source_account_id ? | FK → accounts |
| destination_account_id ? | FK → accounts |
| amount ? | 입력된 송금액, 값이 있으면 0보다 큼 |
| status | `COLLECTING`, `READY`, `EXECUTED`, `CANCELLED`, `EXPIRED` |
| revision | 확인 내용 변경 시 증가하는 버전 |
| expires_at | 유효기한 |
| confirmed_at ? | 사용자가 해당 버전 내용을 확인한 시각 |

은행·수취인은 선택된 계좌로부터 조회한다. 정보가 부족한 동안 계좌와 금액은 NULL일 수 있다. 일반 화면도 동일한 확인 절차를 사용한다. AI 대화의 “확인했어요”만으로 실행 권한을 부여하지 않는다.

## 5. 정합성과 실행 규칙

DB의 PK·FK·UNIQUE·금액 CHECK와, 여러 행을 다루는 서비스 트랜잭션 검증을 함께 사용한다.

1. 사용자 송금은 소유 출금 계좌, 사용 가능한 수취 계좌, 서로 다른 계좌, 양수 금액, 잔액, 초안 소유권·버전·유효기한을 검증한다.
2. 확인 화면의 버전과 서버 초안 버전이 같아야 하며 간편 비밀번호를 서버에서 검증한다. 계좌나 금액을 바꾸면 기존 확인을 무효화한다. PIN 검증은 해당 요청에만 유효하며 재사용 가능한 승인 플래그로 저장하지 않는다.
3. 서비스의 `@Transactional` 범위에서 계좌를 일정한 ID 순서로 잠그고 잔액 검증·변경, 금융 기록 생성, 초안 실행 완료를 함께 처리하는 방안을 제안한다.
4. 완료된 송금에는 같은 금액의 출금·입금 기록 두 건, 결제에는 출금 한 건, 충전·초기 자금에는 입금 한 건만 존재해야 한다. 기록의 계좌·방향·금액은 작업 유형과 일치해야 한다.
5. 실패 시 잔액과 기록을 함께 롤백한다. 실패 상태를 남기는 작업이 필요하면 금융 변경 롤백 후 별도 트랜잭션으로 기록한다. 동일 요청의 동시 실행은 요청 키와 초안 잠금·고유 제약으로 막는다.
6. 계좌 잔액은 전체 입금에서 출금을 뺀 금액과 일치해야 한다. 초기 자금도 입금 작업으로 남긴다. 샘플 과거 거래는 계좌 개설 시 시간 순서대로 생성해 마지막 잔액을 100만 원으로 맞춘다. 기존 계좌에 과거 기록을 추가할 때는 잔액·순서를 재검증하며 기존 금융 기록을 단순 덮어쓰지 않는다.
7. 소비 집계는 완료된 작업의 소비 분류 행만 대상으로 하고 출금 계좌 소유자 기준으로 조회한다. 본인 계좌 간 이동은 소유자 ID로 판단한다. 분류 변경은 금융 기록을 변경하지 않는다.
8. 대화 삭제 시 메시지를 삭제하고 송금 초안의 대화 참조는 NULL로 해제한다. 미실행 초안은 취소한다. 완료된 작업·계좌 기록·실행 초안은 유지한다. 금융 작업에서 대화로 이어지는 연쇄 삭제를 금지한다.
9. 가상 충전은 요청자 본인 계좌만 허용한다. 샘플 데이터 생성은 관리자 전용 경로에서 처리한다. 일반 사용자 요청이 `SAMPLE`이나 `SYSTEM` 출처를 지정해 인증을 우회할 수 없어야 한다.

## 6. 주요 조회 인덱스 제안

| 테이블 | 인덱스 | 목적 |
| --- | --- | --- |
| accounts | `(user_id, status)` | 본인 계좌 조회 |
| account_entries | `(account_id, entry_sequence)` UNIQUE | 거래 순서·잔액 검증 |
| money_operations | `(occurred_at, status)` | 기간별 완료 거래 조회 |
| expense_classifications | `(category_id, account_entry_id)` | 카테고리 집계 |
| conversations | `(user_id, updated_at)` | 사용자 대화 목록 |
| messages | `(conversation_id, sequence)` UNIQUE | 대화 순서 |

고유 제약에 의해 생성되는 인덱스를 중복 생성하지 않는다. 실제 조회 계획에 따라 복합 인덱스를 조정한다.

## 7. PRD·팀 검토에서 확정할 사항

- 로그인 세션·토큰 저장 방식, 이메일 검증·계정 복구·연결 해제 정책
- 간편 비밀번호 실패 횟수·잠금·재설정 정책
- 송금 초안 만료 시간, 이체·충전 한도, 수수료 정책
- 별명 중복 정책과 기본 출금 계좌 미설정 시 처리
- 소비 카테고리 목록과 비교 기간·이전 기간 소비가 0일 때 증감률 표시
- 샘플 거래 기간·생성량 및 기존 계좌에 샘플 추가 시점 정책
- 메시지의 구조화 응답 형식, 대화 보존·삭제 정책
- DB 제품·문자열 길이·상태 코드·잠금 방식과 개인정보 보존 정책

이 문서는 MVP 요구사항에 대한 설계 초안이다. 위 미정 사항과 PRD가 확정되면 컬럼·제약을 갱신한 뒤 마이그레이션과 엔티티를 구현한다.
