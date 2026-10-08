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

## 공통 레이아웃

`AdminLayout.tsx`에서 관리자 화면의 공통 구조를 제공한다.

- `AdminLayout`: Sidebar, Header, 페이지 콘텐츠 영역 조합
- `AdminSidebar`: 메뉴 목록과 현재 경로의 Active 상태 표시
- `AdminHeader`: 관리자 센터 정보, 알림, 관리자 프로필 표시
- `adminMenus`: 관리자 메뉴 구성을 한 곳에서 관리

로그인, 로그인 실패, 권한 없음, 세션 만료 화면에는 관리자 공통 레이아웃을 적용하지 않는다.

## 대시보드

`dashboard/AdminDashboardPage.tsx`는 운영 요약, 최근 거래, 이상거래, 시스템 지표를 표시한다. Mock 데이터는 `dashboard/dashboardData.ts`에 분리되어 있으며 이후 통계 API 응답으로 교체할 수 있다. 페이지는 `ready`, `loading`, `empty`, `error` 상태 UI를 지원한다.

## 회원 관리

`members/AdminMembersPage.tsx`는 회원 목록 검색, 상태 표시, 페이지 이동, 상세 정보 모달을 제공한다. Mock 데이터와 타입은 `members/membersData.ts`에 분리했으며 회원 API 연결 시 페이지의 `data` 입력을 서버 응답으로 교체할 수 있다. 비밀번호와 인증 토큰 등 민감한 정보는 표시하지 않는다.

## 계좌 관리

`accounts/AdminAccountsPage.tsx`는 계좌 목록 검색, 상태 표시, 페이지 이동과 상세 정보 모달을 제공한다. 상세 화면은 소유 회원 정보와 최근 거래 내역을 함께 표시한다. Mock 데이터와 타입은 `accounts/accountsData.ts`에 분리했으며 계좌 비밀번호나 인증 정보는 표시하지 않는다.

## 거래 관리

`transactions/AdminTransactionsPage.tsx`는 거래 ID·계좌·회원 검색과 유형·상태·기간 필터를 제공한다. 상세 화면은 송금·수취 계좌와 회원, 거래 금액, 실패 사유 및 연결된 FDS 탐지 번호를 표시한다. Mock 데이터와 타입은 `transactions/transactionsData.ts`에 분리했으며 거래 정보는 조회만 가능하다.

## 이상 거래 관리

`fds/AdminFdsPage.tsx`는 FDS 탐지 거래 검색, 위험도·처리 상태 필터, 위험 점수 시각화를 제공한다. 상세 화면은 복수 탐지 사유와 원본 거래의 계좌·회원·금액 정보를 표시한다. Mock 데이터와 타입은 `fds/fdsData.ts`에 분리했으며 원본 거래는 조회만 가능하다.
