# talking-bank

말하면 알아듣고, 돈은 사람이 확인해야 움직이는 은행. 풀스택 모노레포.
`apps/api` Spring Boot 3.5 · Java 21 · JPA · MariaDB — `apps/web` React 19 · Vite · TypeScript — `apps/assistant` FastAPI · Python 3.12 · anthropic SDK (Phase 2).

이 파일은 **AI 코딩 도구 공통 지침**이다. Codex · Cursor · GitHub Copilot · Antigravity는 `AGENTS.md`를 바로 읽고, Claude Code는 `CLAUDE.md`, Gemini CLI는 `GEMINI.md`가 이 파일을 불러온다. 지침을 바꿀 때는 이 파일만 고친다.

## 먼저 읽을 것

| 알고 싶은 것           | 문서                                                                                             |
| ---------------------- | ------------------------------------------------------------------------------------------------ |
| 무엇을 만드는지        | `docs/01-overview.md`                                                                            |
| 범위와 Phase           | `docs/02-scope.md` · `docs/05-schedule.md`                                                       |
| 화면 · 정책 · 요구사항 | `docs/requirements/<phase>.md` — 화면 ID · 정책 수치(POL) · REQ · 제외 항목                      |
| 공통 규칙              | `docs/06-conventions.md` — Git · 이슈 · API 계약 · 인증 · 문서 간 이름 규칙                      |
| 코드 규칙              | `docs/conventions/backend.md` · `docs/conventions/frontend.md` · `docs/conventions/assistant.md` |
| 돈을 다루는 규칙       | `docs/04-domain.md` — 금액 · 송금 · 동시성 · 멱등성. **어기면 안 된다**                          |
| 화면 규칙              | `DESIGN.md`                                                                                      |
| 지금 만드는 기능       | `docs/domains/<phase>/<작업 ID 도메인>.md` (PRD)                                                 |

## 작업 절차

1. 작업 ID(예: `XFER-03`)와 그 기능의 PRD를 찾는다. PRD가 없으면 `docs/templates/prd.md`로 먼저 쓴다.
2. **코드를 쓰기 전에 계획을 세운다.** PRD를 기준으로 단계별 작업 계획을 만들고, 사람이 검토한 뒤 구현한다.
3. 구현 → `npm test` · `npm run lint` · `npm run typecheck` → 해당 기능의 시연 장면으로 확인한다.
4. 이슈 하나 = 브랜치 하나 = PR 하나. PR 템플릿의 "확인한 것"을 채운다.
5. 사람이 시키지 않은 파일은 건드리지 않는다. 범위 밖의 개선은 제안만 한다.

## 명령

```
npm run db:up        MariaDB (호스트 3308)
npm run dev          api :8080 + web :5173
npm test             양쪽 테스트 (인프라 없이 돈다)
npm run lint · npm run typecheck
./gradlew :apps:api:test
```

## 절대 규칙

- 금액은 `BigDecimal`. `double`·`float` 금지.
- 돈은 `TransferService`에서만 움직인다. 다른 도메인이 잔액을 직접 고치지 않는다.
- **AI 서비스는 이체를 실행하지 않는다.** 도구는 읽기와 초안(`DRAFT`)뿐이고, 코어는 비서 스코프 토큰으로만 부른다. 실행 도구를 만들지 않는다.
- `ANTHROPIC_API_KEY`는 `apps/assistant` 환경 변수에만. 프론트 · 코어 · 커밋에 없다.
- `@Transactional`은 Service에.
- 서버 상태는 TanStack Query. API 호출은 `lib/api.ts`의 `apiFetch`만.
- 화면 ID · 정책 수치 · 요구사항은 요구사항 정의서가, 필드명 · 에러 코드 · 작업 ID는 PRD가 주인이다. 새로 만들지 않는다.
- 색 · 간격 · 폰트는 `DESIGN.md` 토큰만 쓴다.
- 시크릿은 커밋하지 않는다.
- 커밋 · PR 메시지는 한국어, `docs/06-conventions.md`의 형식을 따른다.
