# 개발 규칙 — 백엔드

> 공통 규칙(Git·이슈·API 계약·인증·시크릿)은 [06-conventions.md](../06-conventions.md)에 있다. 이 문서는 `apps/api` 코드에만 적용된다. 패키지 배치·계층 역할·네이밍의 상세는 착수하면서 이 문서에 보탠다.

## 패키지 구조

패키지는 **도메인별**로 나눈다. 계층별(`controller/`, `service/`)로 나누지 않는다. 지금 `account/`, `config/`가 이 방식이다.

```
com.example.talkingbank
├── auth/         User, AuthController, AuthService, JwtProvider ...     Phase 1
├── account/      Account, AccountController, AccountService, Repository Phase 1
├── transfer/     Transfer, TransferService, TransferController          Phase 1
├── transaction/  Transaction, TransactionRepository                     Phase 1
├── common/       예외, 에러 응답, 공통 설정                             Phase 1
├── recipient/    RecipientAlias, RecipientController                   Phase 2
├── fds/          출금 평가 훅 구현체, 규칙 2개, FdsAlert                 Phase 2
└── admin/        AdminController (AI 비서 대시보드)                     Phase 2
```

한 도메인 안은 `XxxController` → `XxxService` → `XxxRepository` 순으로 호출한다. 도메인끼리는 Service를 통해서만 연결한다 — 다른 도메인의 Repository를 직접 부르지 않는다.

AI 서비스(`apps/assistant`)는 별도 앱이다. 코어는 AI 서비스에 **비서 스코프 토큰**으로 열린 API만 제공하고, AI 서비스의 DB나 코드를 참조하지 않는다. 스코프 규칙은 [06-conventions.md](../06-conventions.md#ai-서비스-규칙).

## 코드

- 엔티티에 `@Setter`를 두지 않는다. 상태 변경은 의미 있는 메서드로 (`account.withdraw(amount)`).
- DTO는 `record`. 요청은 `XxxRequest`, 응답은 `XxxResponse`.
- `@Transactional`은 Service에. Controller와 Repository에는 두지 않는다.
- 금액은 `BigDecimal`. [04-domain.md 금액 규칙](../04-domain.md#금액-규칙).
- Lombok은 `@Getter`, `@Builder`, `@NoArgsConstructor(access = PROTECTED)` 정도만.
- 예외는 `common/`의 공통 예외를 상속하고, [에러 포맷](../06-conventions.md#에러-포맷)의 `errorCode`를 갖는다.
- 포매터: <!-- TODO: Spotless + Google Java Format 등 결정 -->

## DB

- 테이블·컬럼은 `snake_case`. 테이블은 단수(`account`, `transfer`) — 지금 `account`가 그렇다.
- PK는 `id BIGINT AUTO_INCREMENT`.
- 금액은 `DECIMAL(19,2)`. 시각은 `DATETIME(6)`.
- 로컬은 `ddl-auto: update`. 배포 서버는 `validate` + 스키마 SQL 수동 적용(마이그레이션 도구는 향후 후보).

## 테스트

| 대상               | 최소 기준                                                        |
| ------------------ | ---------------------------------------------------------------- |
| 송금               | 성공, 잔액 부족, 동일 계좌, 동시성, 롤백, 멱등성 — **전부 필수** |
| FDS 규칙 (Phase 2) | 규칙마다 걸리는 케이스 1 + 안 걸리는 케이스 1, fail-closed       |
| 스코프 (Phase 2)   | 비서 스코프 토큰으로 실행 API 호출 → 403                         |
| API                | 인증 없이 401, 남의 계좌 403, 정상 200                           |

- H2 인메모리로 돈다. MariaDB를 띄우지 않아도 `./gradlew test`가 통과해야 한다.
- 테스트 이름은 한국어 `@DisplayName`으로 무엇을 검증하는지 쓴다.
