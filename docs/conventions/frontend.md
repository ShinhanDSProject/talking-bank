# 개발 규칙 — 프론트엔드

> 공통 규칙(Git·이슈·API 계약·인증·시크릿)은 [06-conventions.md](../06-conventions.md)에 있다. 이 문서는 `apps/web` 코드에만 적용된다.

## 폴더 구조

지금 `features/` 방식이 시작점이다.

```
src/
├── features/     기능별. accounts/, transfers/, auth/ ... 각각 api.ts + 화면 + 테스트
├── pages/        라우트에 붙는 페이지
├── components/   여러 기능이 쓰는 UI 컴포넌트 (디자인 시스템)
├── lib/          api 클라이언트, queryClient 등
└── test-utils.tsx
```

기능 하나는 `features/<기능>/` 안에서 API 호출·화면·테스트가 함께 산다. 두 기능이 같이 쓰는 컴포넌트만 `components/`로 올린다.

## 코드

- 서버 상태는 TanStack Query. `useEffect` + `fetch` 조합을 쓰지 않는다.
- API 호출은 `lib/api.ts`의 `apiFetch`만 쓴다. 컴포넌트에서 `fetch`를 직접 부르지 않는다.
- 타입은 서버 응답 DTO와 이름·필드를 맞춘다. (`AccountResponse` ↔ `Account`)
- 에러 처리는 [에러 포맷](../06-conventions.md#에러-포맷)의 `errorCode`로 분기한다. `message`는 그대로 보여줘도 된다.
- 금액 표시는 `Intl.NumberFormat('ko-KR')`. 문자열 연산으로 콤마를 넣지 않는다.
- ESLint·Prettier 설정은 저장소에 있다. PR 전에 `npm run lint`, `npm run typecheck`.

## Mock → API

- 백엔드 API가 준비되기 전에는 `features/<기능>/api.ts`가 mock 데이터를 돌려준다. 화면·상태·테스트를 먼저 만든다.
- API가 준비되면 `api.ts`만 실제 호출로 바꾼다. 컴포넌트는 손대지 않는다.
- mock의 응답 모양은 PRD 5절 API 표와 같아야 한다.

## 테스트

| 대상      | 최소 기준                                      |
| --------- | ---------------------------------------------- |
| 핵심 화면 | 로그인·송금·거래내역의 로딩·성공·에러 상태     |
| API 계층  | `apiFetch`가 에러 포맷을 `ApiError`로 바꾸는지 |

- `fetch`를 목킹해 서버 없이 돈다. `npm test`가 인프라 없이 통과해야 한다.
- 테스트 이름은 무엇을 검증하는지 한국어로 쓴다.
