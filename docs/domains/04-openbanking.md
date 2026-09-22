# Phase 4 — 오픈뱅킹

우리 은행이 **제공자**다. 외부 앱(가상)이 OAuth 2.0으로 사용자 동의를 받고 우리 계좌를 조회·이체한다.

- 진입 조건: [Phase 1](01-core.md) 완료. 배치 의존이 없어 Phase 1 뒤 어디에 두어도 된다.
- 코어와의 연결점: 계좌 조회 API와 [송금 규칙](../04-domain.md#송금-규칙)을 외부 앱에 연다. 코어 AUTH의 JWT와 별개의 인가 서버 역할이 필요하다.
- 배치: 동의 만료 관리 (Phase 3 인프라가 있으면 배치, 없으면 스케줄러).

## 핵심 흐름

외부 앱 등록 → 사용자 동의(OAuth 2.0) → Access Token 발급 → 계좌 조회·이체 API 호출 → 동의 만료 알림.

- 스코프: `account:read`, `transfer:write`.
- Access Token / Refresh Token, 동의 이력, 동의 만료 알림.
- Spring Authorization Server 검토.

## 새 모델 후보

`OAuthClient`, `UserConsent`, `OAuthToken`.

## 완료 조건

가상 외부 앱이 OAuth로 동의를 받아 계좌를 조회하고 이체한다.

## 착수 시 채울 것

<!-- 이 Phase에 착수하는 팀이 채운다. 틀은 01-core.md, 02-risk.md와 같게 -->

- 범위 (P0 / P1 / P2, 두지 않는 것)
- 기능 명세 (AC)
- 도메인 모델 (엔티티 표, 상태 전이)
- 시드 데이터
- 진행 (Step, 완료 조건)
- 시연 장면
