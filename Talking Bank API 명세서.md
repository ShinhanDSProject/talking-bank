# Talking Bank API 명세서

Sep 29, 2026 · @전민욱

API는 네 묶음입니다. 가장 중요한 점은 AI 도구 목록에 '이체 실행'이 없다는 것이고, 실행 API(`/confirm`)는 웹에서 PIN과 함께만 호출됩니다.

## 공통 규칙

- 인증: `Authorization: Bearer {accessToken}` (회원 기능의 JWT 그대로)
- 금액: 원 단위 정수 (`100000`), 날짜: `2026-10-05T14:30:00+09:00`
- 에러: 회원 기능과 같은 형식 `{ "errorCode", "message", "timestamp", "path" }`
- 새 에러코드: `TRF_001` 잔액 부족, `TRF_002` 한도 초과, `TRF_003` 만료된 이체, `TRF_004` PIN 불일치, `TRF_005` PIN 잠김, `TRF_006` 이미 처리된 이체

## 1. Core Banking API (Spring Boot)

| Method | URL | 하는 일 | 호출하는 쪽 |
| --- | --- | --- | --- |
| POST | `/api/users/me/pin` | PIN 등록·변경 | 웹 |
| GET | `/api/accounts` | 내 계좌 목록과 잔액 | 웹, AI |
| GET | `/api/accounts/{id}/transactions` | 거래내역 검색 (`from`, `to`, `type`, `keyword`, `minAmount`, `maxAmount`, `page`) | 웹, AI |
| GET | `/api/payees` | 수취인 별명 목록 | 웹 |
| POST | `/api/payees` | 별명 등록 | 웹 |
| DELETE | `/api/payees/{id}` | 별명 삭제 | 웹 |
| GET | `/api/payees/search?q=엄마` | 별명·이름·최근 수취인에서 후보 찾기 | AI |
| POST | `/api/transfers` | 확인 대기 이체 만들기 (돈은 안 움직임) | AI, 웹 |
| GET | `/api/transfers/{id}` | 이체 상태 조회 (확인 화면용) | 웹 |
| POST | `/api/transfers/{id}/confirm` | PIN 확인 후 실행 | **웹만** |
| POST | `/api/transfers/{id}/cancel` | 취소 | 웹 |
| GET | `/api/reports/spending?month=2026-10` | 카테고리별 소비 합계 | 웹, AI |
| POST | `/api/scheduled-transfers` | 예약·반복 이체 등록 요청 (확인 대기) | AI, 웹 |
| GET | `/api/scheduled-transfers` | 예약 이체 목록 | 웹, AI |
| DELETE | `/api/scheduled-transfers/{id}` | 예약 해지 | 웹 |

**핵심 API 예시: 확인 대기 이체 만들기**

```json
POST /api/transfers
{
  "fromAccountId": 1,
  "payeeId": 7,
  "amount": 100000,
  "source": "AI",
  "conversationId": 42
}

201 Created
{
  "transferId": 128,
  "status": "PENDING_CONFIRM",
  "toName": "이영희",
  "toBank": "가상은행",
  "toAccountMasked": "110-***-5678",
  "amount": 100000,
  "amountKorean": "십만 원",
  "riskLevel": "NORMAL",
  "expiresAt": "2026-10-05T14:35:00+09:00"
}
```

**핵심 API 예시: PIN 확인 후 실행**

```json
POST /api/transfers/128/confirm
Idempotency-Key: 5f1c...
{ "pin": "123456", "riskAcknowledged": false }

200 OK
{ "transferId": 128, "status": "COMPLETED", "balanceAfter": 1230000 }
```

## 2. AI 에이전트 API (Node.js)

| Method | URL | 하는 일 |
| --- | --- | --- |
| POST | `/api/chat` | 사용자 말 전달 → AI 답변 + 화면이 할 행동 |
| GET | `/api/chat/{conversationId}/messages` | 대화 기록 |
| POST | `/api/chat/messages/{messageId}/feedback` | '틀렸어요' 이의제기 |

```json
POST /api/chat
{ "conversationId": 42, "message": "딸한테 10만원 보내줘" }

200 OK
{
  "conversationId": 42,
  "reply": "이영희님께 십만 원을 보낼게요. 확인 후 PIN을 입력해 주세요.",
  "actions": [ { "type": "CONFIRM_TRANSFER", "transferId": 128 } ]
}
```

`actions.type`은 `CONFIRM_TRANSFER`(확인 화면 열기), `SELECT_PAYEE`(후보 중 선택), `NAVIGATE`(메뉴 이동), `SHOW_CHART`(소비 그래프) 네 가지입니다.

## 3. AI 도구(tool) 목록

Claude가 대화 중에 부를 수 있는 기능의 전부입니다. 여기에 없는 일은 AI가 할 수 없습니다.

| 도구 이름 | 하는 일 | 부르는 Core API | 돈이 움직이나 |
| --- | --- | --- | --- |
| `get_accounts` | 계좌·잔액 조회 | `GET /api/accounts` | 아니오 |
| `search_transactions` | 조건으로 거래내역 검색 | `GET /api/accounts/{id}/transactions` | 아니오 |
| `find_payee` | "엄마" → 수취인 후보 | `GET /api/payees/search` | 아니오 |
| `create_transfer_request` | 확인 대기 이체 만들기 | `POST /api/transfers` | 아니오 (대기만) |
| `get_spending_report` | 월별 소비 요약 | `GET /api/reports/spending` | 아니오 |
| `create_scheduled_transfer_request` | 예약 이체 등록 요청 | `POST /api/scheduled-transfers` | 아니오 (대기만) |
| `navigate` | 메뉴 이동 지시 | 없음 (화면 행동만 반환) | 아니오 |

## 4. Mock 오픈뱅킹 API (Node.js)

금융결제원 오픈뱅킹의 경로·필드 이름을 본떠 만든 가상 타행 서버입니다. 실제 필드는 [금융결제원 개발자 사이트](https://developers.kftc.or.kr)에서 확인하고 담당자가 맞춥니다.

| Method | URL | 하는 일 |
| --- | --- | --- |
| POST | `/oauth/2.0/token` | 이용기관(Core Banking) 토큰 발급 |
| POST | `/v2.0/inquiry/real_name` | 받는 계좌의 예금주 이름 확인 |
| POST | `/v2.0/transfer/deposit` | 타행 계좌로 입금 |
| GET | `/v2.0/account/balance` | 타행 계좌 잔액 (여유 시) |

응답에는 실제 스펙처럼 `rsp_code`(예: `A0000` 성공)와 `api_tran_id`(거래 고유번호)를 넣습니다.

## 5. 인증 전달과 보안·동시성 규칙

AI 서버의 인증, PIN 처리, 동시 이체 세 가지는 담당자마다 다르게 만들기 쉽워서 명세로 고정합니다. 팀 확정 전 제안입니다.

### 5-1. AI 서버가 Core Banking을 부를 때

- 웹이 `/api/chat`을 호출할 때 보낸 `Authorization` 헤더의 사용자 JWT를 AI 서버가 그대로 Core Banking API에 전달한다
- AI 서버 전용 키나 관리자 토큰은 만들지 않는다. AI가 볼 수 있는 데이터는 로그인한 사용자 본인 것뿐이다
- JWT가 만료되면 Core Banking이 401을 주고, AI 서버는 그 오류를 그대로 웹에 돌려준다. 웹이 토큰을 재발급받은 뒤 같은 요청을 다시 보낸다

### 5-2. PIN 처리

- PIN은 확인 화면의 전용 키패드에서만 입력받고, `POST /api/transfers/{id}/confirm`으로 웹에서 Core Banking에 직접 보낸다
- `/api/chat`과 AI 도구 어디에도 PIN 필드가 없다
- 사용자가 말이나 채팅으로 PIN을 알려주면, AI 서버가 Claude API로 보내기 전에 숫자를 `******`로 바꾸고 AI는 "PIN은 화면 키패드에 입력해 주세요"라고 안내한다
- 마스킹 기준은 '원'이 붙지 않은 6자리 숫자다. 금액(100000원)과 겹치는 오탐은 담당자가 테스트로 조정한다
- 대화 기록(`messages.content`)에도 마스킹된 값만 저장한다

### 5-3. 동시 이체

- `/confirm` 실행 시 출금 계좌 행을 잠그고(예: `SELECT ... FOR UPDATE`) 잔액 검사, 차감, 거래내역 기록을 한 트랜잭션으로 처리한다
- 같은 계좌에 이체 두 건이 동시에 오면 뒤 건은 앞 건이 끝난 뒤 잔액을 다시 검사하고, 부족하면 `TRF_001`을 돌려준다
- 같은 `Idempotency-Key`로 다시 요청하면 새로 실행하지 않고 앞선 결과를 그대로 돌려준다
- 타행 이체에서 Mock 오픈뱅킹 호출이 실패하면 차감을 되돌리고 이체 상태를 `FAILED`로 기록한다
