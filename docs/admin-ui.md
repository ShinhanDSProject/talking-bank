# 관리자 UI

이슈 [#119](https://github.com/ShinhanDSProject/talking-bank/issues/119)의 관리자 UI 구현 기준 문서다.

## Figma

- [신한DS2 — 관리자 UI](https://www.figma.com/design/xTFWH5j0VuKV9g4amg6aPD/%EC%8B%A0%ED%95%9CDS2?node-id=0-1&t=3MZoCW8JexOiJDQD-1)
- 관리자 화면: `01. 관리자 로그인` ~ `24. HTTP 오류 현황`
- 주요 공통 컴포넌트: Button, Input Field, Select, Checkbox, Badge, Card, Modal, Toast, Transaction Table, Pagination, Sidebar Navigation, Top Header, Admin Status Card
- 디자인 토큰: `Banking / Primitives`, `Banking / Semantics`, `Banking / Layout`

## React 라우트

| 화면            | 경로                     |
| --------------- | ------------------------ |
| 관리자 대시보드 | `/admin`                 |
| 관리자 로그인   | `/admin/login`           |
| 로그인 실패     | `/admin/login-error`     |
| 권한 없음       | `/admin/forbidden`       |
| 세션 만료       | `/admin/session-expired` |
| 회원 관리       | `/admin/members`         |
| 계좌 관리       | `/admin/accounts`        |
| 거래 관리       | `/admin/transactions`    |
| 이상 거래 관리  | `/admin/fds`             |
| 시스템 상태     | `/admin/system`          |

현재 화면 데이터는 `apps/web/src/features/admin/mockData.ts`에 분리되어 있다. 관리자 API가 준비되면 UI 컴포넌트를 유지한 채 TanStack Query 기반 데이터 계층으로 교체한다.
