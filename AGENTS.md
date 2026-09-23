# talking-bank

말하면 알아듣고, 돈은 사람이 확인해야 움직이는 은행. 풀스택 모노레포.
`apps/api` Spring Boot 3.5 · Java 21 · JPA — `apps/web` React 19 · Vite · TypeScript.

이 파일은 **AI 코딩 도구 공통 지침**이다. Codex · Cursor · GitHub Copilot · Antigravity는 `AGENTS.md`를 바로 읽고, Claude Code는 `CLAUDE.md`, Gemini CLI는 `GEMINI.md`가 이 파일을 불러온다. 지침을 바꿀 때는 이 파일만 고친다.

## 먼저 읽을 것

- `README.md` — 구성 · 실행 · 명령
- `DESIGN.md` — 화면 규칙(색 · 타이포 · 간격 · 컴포넌트)
- `docs/` — 기획 · 요구사항 · 개발 규칙. 지금 처음부터 다시 쌓는 중이라 비어 있다. 문서가 생기면 여기 표에 추가한다.

## 작업 절차

1. **코드를 쓰기 전에 계획을 세운다.** 단계별 작업 계획을 만들고, 사람이 검토한 뒤 구현한다.
2. 구현 → `npm test` · `npm run lint` · `npm run typecheck`.
3. 이슈 하나 = 브랜치 하나 = PR 하나. PR 템플릿의 "확인한 것"을 채운다.
4. 사람이 시키지 않은 파일은 건드리지 않는다. 범위 밖의 개선은 제안만 한다.

## 명령

```
npm run dev          api :8080 + web :5173
npm test             양쪽 테스트 (인프라 없이 돈다)
npm run lint · npm run typecheck
cd apps/api && ./gradlew test   (루트에서는 ./gradlew :api:test)
```

## 절대 규칙

- 금액은 `BigDecimal`. `double`·`float` 금지.
- `@Transactional`은 Service에.
- 서버 상태는 TanStack Query. API 호출은 `lib/api.ts`의 `apiFetch`만.
- 색 · 간격 · 폰트는 `DESIGN.md` 토큰만 쓴다.
- 시크릿은 커밋하지 않는다.
- 도메인 안은 `controller · service · repository · entity · dto`로 나눈다. 공통은 `common/config · exception · response`.
- 회원은 `user`(`User` 엔티티 · `users` 테이블 · `/api/users`). `member`와 혼용하지 않는다.
- 커밋 · PR 메시지는 한국어. `<type>: <요약>` 형식(feat · fix · refactor · test · docs · chore).
