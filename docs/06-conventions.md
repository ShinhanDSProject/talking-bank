# 06. 개발 규칙

> 이 문서의 규칙은 초안이다. 팀이 확정하면 그대로 따르고, 바꾸면 이 문서를 먼저 고친다. 백엔드 코드 구조의 상세는 별도 문서로 두고 여기서는 링크한다.

## Git

### 브랜치

```
main                        항상 동작하는 상태. 직접 push 금지 (브랜치 보호 규칙으로 강제)
feature/XFER-03-transfer    기능. 작업 ID를 붙인다
fix/XFER-07-negative-balance 버그 수정
docs/schedule               문서만
```

- 브랜치는 **이슈 하나에 하나**. 이슈 없이 브랜치를 만들지 않는다.
- 하루 이상 main과 벌어지지 않게 한다. 매일 아침 `git pull origin main` 후 리베이스 또는 머지.
- 머지되면 브랜치를 지운다.

### 커밋 메시지

```
<type>: <한국어 요약>

<필요하면 본문 — 왜 바꿨는지>
```

| type       | 언제                     |
| ---------- | ------------------------ |
| `feat`     | 기능 추가                |
| `fix`      | 버그 수정                |
| `refactor` | 동작 변화 없는 구조 변경 |
| `test`     | 테스트만                 |
| `docs`     | 문서만                   |
| `chore`    | 빌드·설정·의존성         |

예: `feat: 송금 API에 멱등성 키 검증 추가`

- 요약은 50자 안팎. 마침표 없음.
- 한 커밋에 한 가지 일.

### PR

- [PR 템플릿](../.github/pull_request_template.md)을 채운다. 특히 **"확인한 것"** — 무엇을 실행해 봤는지.
- 리뷰어 **1명 이상 승인** 후 머지. 자기 PR은 자기가 머지하지 않는다.
- PR은 작게. 변경 파일 20개를 넘으면 쪼갤 수 없는지 먼저 생각한다.
- 머지 방식: **Squash merge**. main 이력이 이슈 단위로 남는다.
- 리뷰 요청 후 24시간 안에 응답.

### 리뷰에서 보는 것

1. 이 PR이 이슈의 수용 조건(AC)을 만족하는가
2. 테스트가 있는가. 없다면 왜 없어도 되는가
3. 금액을 `double`로 다루는 곳이 없는가
4. 트랜잭션 경계가 맞는가 (`@Transactional`이 Service에 있는가)
5. 다른 사람이 읽어서 이해되는가

## 이슈

### 템플릿과 라벨

[이슈 템플릿](../.github/ISSUE_TEMPLATE/) 4종을 쓴다. 빈 이슈는 만들 수 없다.

| 템플릿      | 제목 접두사  | 라벨          | 용도                              |
| ----------- | ------------ | ------------- | --------------------------------- |
| 버그 리포트 | `[Bug]`      | `bug`         | 동작하지 않는 것                  |
| 기능 제안   | `[Feat]`     | `enhancement` | 새로 만들었으면 하는 것           |
| 작업        | `[Task]`     | `task`        | 쪼개진 개발 작업. **대부분 이것** |
| 질문·논의   | `[Question]` | `question`    | 결정이 필요한 것                  |

영역 라벨 `area/api`, `area/web`, `area/infra`는 트리아지 때 붙인다.

### 작업 ID

`XFER-03`처럼 **도메인-번호** 형식을 쓴다. 제목에 `[BE][XFER-03]`처럼 영역과 함께 적는다.

| 도메인  | 범위                       | Phase |
| ------- | -------------------------- | ----- |
| `AUTH`  | 회원·인증                  | 1     |
| `ACCT`  | 계좌                       | 1     |
| `XFER`  | 송금                       | 1     |
| `TXN`   | 거래내역                   | 1     |
| `CMN`   | 공통 기반 (예외·에러·문서) | 1     |
| `INFRA` | 인프라·환경                | 1     |
| `WEB`   | 프론트 공통·디자인 시스템  | 1     |
| `FDS`   | 이상거래 탐지              | 2     |
| `ADMIN` | 관리자                     | 2     |

Phase 3 이후의 도메인(`PRODUCT`, `OPENBANK`, `CARD`, `SEC`, `INS`)은 그 Phase에 착수할 때 추가한다.

GitHub 이슈 번호(#N)와 작업 ID는 다르다. 문서와 대화에서는 작업 ID를, 링크는 #N을 쓴다.

### 이슈 하나의 크기

**하루 안에 끝나는 크기**로 쪼갠다. 3일 넘게 열려 있는 Task는 쪼개거나 막힌 이유를 댓글로 남긴다.

## API

### URL

```
/api/auth/signup                 POST
/api/auth/login                  POST
/api/auth/refresh                POST
/api/auth/logout                 POST
/api/accounts                    GET     내 계좌 목록
/api/accounts/{id}               GET
/api/accounts/{id}/transactions  GET     거래내역
/api/transfers                   POST    송금
/api/transfers/{id}              GET
/api/transfers/{id}/confirm      POST    보류 건 추가 인증        (Phase 2)
/api/admin/fds-alerts            GET                              (Phase 2)
/api/admin/transactions          GET                              (Phase 2)
```

- 복수형 명사, kebab-case. 동사는 쓰지 않는다 (`/confirm` 같은 상태 전이는 예외).
- 관리자 API는 `/api/admin/` 아래. 인가는 URL 패턴으로 한 번에 건다.

### 응답 포맷

두 가지 중 **하나로 고정**한다. 첫 API를 만들기 전에 결정한다 — 나중에 바꾸면 전 API와 프론트를 전부 고쳐야 한다.

| 옵션                | 형태                                 | 장점                                           | 단점                     |
| ------------------- | ------------------------------------ | ---------------------------------------------- | ------------------------ |
| A. 래퍼 없음 (권장) | `{ "id": 1, "email": "..." }`        | HTTP 상태코드를 그대로 활용. Swagger 문서 단순 | 응답 구조가 API마다 다름 |
| B. 공통 래퍼        | `{ "success": true, "data": {...} }` | 프론트 처리 일관                               | 상태코드가 형식화됨      |

A를 권장한다. 에러 응답만 통일(아래)하면 성공 응답은 래퍼 없이도 프론트가 일관되게 처리할 수 있다.

<!-- TODO: 확정되면 이 표를 결론 한 줄로 바꾼다 -->

### 에러 포맷

```json
{
  "errorCode": "XFER_002",
  "message": "잔액이 부족합니다",
  "timestamp": "2026-10-01T10:00:00+09:00"
}
```

- `errorCode`는 `도메인_번호`. 프론트는 이 코드로 분기하고, `message`는 그대로 보여줘도 되는 문장으로 쓴다.
- HTTP 상태코드는 의미대로: 400 검증 실패, 401 미인증, 403 권한 없음, 404 없음, 409 충돌(중복 이메일, 멱등 키 충돌), 422 비즈니스 규칙 위반(잔액 부족).

### 타임존

서버·DB·API 응답 모두 **`Asia/Seoul`** 로 통일한다. ISO 8601에 오프셋 포함(`+09:00`).

## 인증 정책

| 항목                 | 정책                                                         |
| -------------------- | ------------------------------------------------------------ |
| Access Token 만료    | 30분                                                         |
| Refresh Token 만료   | 7일                                                          |
| Refresh Token 저장소 | Redis (TTL 자동 만료). **미확정** — RDB 테이블도 가능        |
| 클라이언트 저장      | Access는 메모리, Refresh는 httpOnly + Secure + SameSite 쿠키 |
| 로그아웃             | Refresh Token 삭제. Access 블랙리스트는 **도입하지 않음**    |
| 서명                 | HS256, 시크릿 32자 이상, 환경 변수 주입                      |
| 시크릿 공유          | <!-- TODO: 결정 -->                                          |

## 코드

### 백엔드 (Java)

패키지는 **도메인별**로 나눈다. 계층별(`controller/`, `service/`)로 나누지 않는다. 지금 `account/`, `config/`가 이 방식이다.

```
com.example.bankbank
├── auth/         User, AuthController, AuthService, JwtProvider ...     Phase 1
├── account/      Account, AccountController, AccountService, Repository Phase 1
├── transfer/     Transfer, TransferService, TransferController          Phase 1
├── transaction/  Transaction, TransactionRepository                     Phase 1
├── common/       예외, 에러 응답, 공통 설정                             Phase 1
├── fds/          출금 평가 훅 구현체, 규칙들, FdsAlert                  Phase 2
└── admin/        AdminController                                        Phase 2
```

- 엔티티에 `@Setter`를 두지 않는다. 상태 변경은 의미 있는 메서드로 (`account.withdraw(amount)`).
- DTO는 `record`. 요청은 `XxxRequest`, 응답은 `XxxResponse`.
- `@Transactional`은 Service에. Controller와 Repository에는 두지 않는다.
- 금액은 `BigDecimal`. [04-domain.md 금액 규칙](04-domain.md#금액-규칙).
- Lombok은 `@Getter`, `@Builder`, `@NoArgsConstructor(access = PROTECTED)` 정도만.
- 포매터: <!-- TODO: Spotless + Google Java Format 등 결정 -->

코드 구조·네이밍의 상세는 <!-- TODO: 백엔드 컨벤션 문서 링크 -->.

### 프론트엔드 (TypeScript)

지금 `features/` 방식이 시작점이다.

```
src/
├── features/     기능별. accounts/, transfers/, auth/ ... 각각 api.ts + 화면 + 테스트
├── pages/        라우트에 붙는 페이지
├── components/   여러 기능이 쓰는 UI 컴포넌트 (디자인 시스템)
├── lib/          api 클라이언트, queryClient 등
└── test-utils.tsx
```

- 서버 상태는 TanStack Query. `useEffect` + `fetch` 조합을 쓰지 않는다.
- API 호출은 `lib/api.ts`의 `apiFetch`만 쓴다. 컴포넌트에서 `fetch`를 직접 부르지 않는다.
- 타입은 서버 응답 DTO와 이름·필드를 맞춘다. (`AccountResponse` ↔ `Account`)
- ESLint·Prettier 설정은 저장소에 있다. PR 전에 `npm run lint`, `npm run typecheck`.
- 금액 표시는 `Intl.NumberFormat('ko-KR')`. 문자열 연산으로 콤마를 넣지 않는다.

### DB

- 테이블·컬럼은 `snake_case`. 테이블은 단수(`account`, `transfer`) — 지금 `account`가 그렇다.
- PK는 `id BIGINT AUTO_INCREMENT`.
- 금액은 `DECIMAL(19,2)`. 시각은 `DATETIME(6)`.
- 로컬은 `ddl-auto: update`. 배포 서버는 `validate` + 스키마 SQL 수동 적용(마이그레이션 도구는 향후 후보).

## 테스트

| 대상               | 최소 기준                                                        |
| ------------------ | ---------------------------------------------------------------- |
| 송금               | 성공, 잔액 부족, 동일 계좌, 동시성, 롤백, 멱등성 — **전부 필수** |
| FDS 규칙 (Phase 2) | 규칙마다 걸리는 케이스 1 + 안 걸리는 케이스 1                    |
| API                | 인증 없이 401, 남의 계좌 403, 정상 200                           |
| 프론트             | 핵심 화면(로그인·송금·거래내역)의 로딩·성공·에러 상태            |

- 백엔드 테스트는 H2로 돈다. MariaDB를 띄우지 않아도 `npm test`가 통과해야 한다.
- 테스트 이름은 한국어 `@DisplayName`으로 무엇을 검증하는지 쓴다.

## 시크릿과 환경 변수

- `.env`, JWT 시크릿, DB 비밀번호는 **커밋하지 않는다**. `.gitignore`에 있다.
- 필요한 변수 목록은 `.env.example`에 값 없이 적어둔다.
- 공유 경로: <!-- TODO: 결정 -->
