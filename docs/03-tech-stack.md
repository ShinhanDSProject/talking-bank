# 03. 기술 스택과 아키텍처

## 한눈에 보기

| 영역        | 선택                                              | 비고                                               |
| ----------- | ------------------------------------------------- | -------------------------------------------------- |
| 백엔드      | **Spring Boot 3.5.x (LTS)** · Java 21             | 아래 "버전 결정" 참고                              |
| 보안        | Spring Security 6 · JWT (HS256)                   | 정책은 [06-conventions.md](06-conventions.md)      |
| 데이터      | Spring Data JPA (Hibernate) · **MariaDB 11.4**    |                                                    |
| 캐시/토큰   | Redis (Refresh Token 저장소)                      | **미확정** — #14에서 인프라 담당 협의 중           |
| 배치        | Spring Batch                                      | **Phase 2부터** 도입. 자동이체·정산·결제·만기 처리 |
| 프론트엔드  | **React 19 · TypeScript · Vite**                  |                                                    |
| 라우팅/상태 | React Router · TanStack Query                     | 전역 상태 라이브러리는 필요해질 때 추가            |
| 테스트      | JUnit 5 + MockMvc (H2) · Vitest + Testing Library |                                                    |
| 코드 품질   | ESLint · Prettier                                 | 백엔드 포매터는 미정 (Spotless 등 검토)            |
| AI          | Python (LangChain / LangGraph / Dify 중 미정)     | 기능 확정 후 결정. `apps/ai`로 들어갈 예정         |
| 인프라      | Docker Compose                                    | 로컬: MariaDB(+Redis). 배포: 서버 1대              |
| 빌드        | Gradle 9 (멀티프로젝트) · npm workspaces          | 두 빌드는 결합하지 않는다                          |

## 모노레포 구조

```
bank-bank/
├── apps/
│   ├── api/          # Spring Boot — 계좌·송금·FDS 룰과 확장 도메인. 돈을 다루는 쪽
│   ├── web/          # React — 고객 화면 + 관리자 화면
│   └── ai/           # (예정) Python — LLM 기능. 설명·요약·검색만
├── packages/         # 앱 사이 공유 코드 (아직 비어 있음)
├── docs/             # 이 문서들
├── build.gradle      # 플러그인 버전만 선언
├── settings.gradle   # include 'apps:api'
├── package.json      # npm workspaces
└── docker-compose.yml
```

JVM 모듈은 Gradle이, 프론트엔드는 npm workspaces가 관리한다. Python 서비스가 들어오면 `apps/ai`에 자체 `pyproject.toml`을 두고 루트 `package.json` 스크립트에서 함께 띄운다.

확장 도메인(Phase 2~6)은 별도 앱이 아니라 **`apps/api` 안의 패키지**로 들어간다. 도메인마다 서비스를 쪼개면 트랜잭션이 서비스 경계를 넘게 되어(카드 승인 → 계좌 출금) 초심자 팀이 감당하기 어렵다. 하나의 DB, 하나의 트랜잭션 안에서 처리한다.

## 아키텍처

```
브라우저
  │
  ▼
apps/web (React, :5173)
  │  개발: Vite 프록시 /api → :8080   배포: VITE_API_BASE_URL로 직접 호출
  ▼
apps/api (Spring Boot, :8080)
  │
  │  Phase 1 — 은행 코어
  ├── auth         회원·JWT
  ├── account      계좌·잔액
  ├── transfer     송금 (트랜잭션·락)  ──▶ fds (룰 평가)
  ├── transaction  거래내역
  ├── admin        관리자 조회
  │
  │  Phase 2~6 — 확장 도메인 (모두 account·transfer를 호출한다)
  ├── product      예금·대출 상품            (Phase 2)
  ├── batch        Spring Batch Job들         (Phase 2~)
  ├── openbanking  OAuth 인가 서버·오픈 API   (Phase 3)
  ├── card         승인·매입·정산             (Phase 4)
  ├── securities   주문·체결·T+2              (Phase 5)
  └── insurance    청약·납입·만기             (Phase 6)
  │            │
  ▼            ▼
MariaDB     Redis (Refresh Token, 미확정)

apps/ai (Python, 예정) ◀── api가 HTTP로 호출. 타임아웃 시 설명 없이 진행
```

원칙 네 가지.

1. **돈은 `account`·`transfer` 패키지에서만 움직인다.** 카드 출금, 예수금 이체, 보험료 납입은 전부 `transfer`의 이체 로직을 호출한다. 각 도메인이 잔액을 직접 고치지 않는다.
2. **AI 서비스는 읽기만 하고, 죽어도 송금은 되어야 한다.**
3. **프론트와 API는 따로 배포한다.** 그래서 CORS 설정(`app.cors.allowed-origins`)이 있다. 개발 중에는 Vite 프록시를 타서 CORS가 필요 없다.
4. **테스트는 인프라 없이 돈다.** 백엔드 테스트는 H2 인메모리, 프론트 테스트는 `fetch` 목킹. `npm test` 한 번으로 양쪽이 돈다.

## 포트와 환경

| 서비스  | 개발 포트 | 환경 변수                                                                      |
| ------- | --------- | ------------------------------------------------------------------------------ |
| web     | 5173      | `VITE_API_BASE_URL`, `VITE_API_PROXY_TARGET`                                   |
| api     | 8080      | `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `CORS_ALLOWED_ORIGINS`, `JPA_DDL_AUTO` |
| MariaDB | **3308**  | 호스트 3306·3307이 다른 서비스와 겹쳐서 3308                                   |
| Redis   | 6379      | 도입 확정 시                                                                   |

JWT 시크릿 등 인증 관련 변수는 `AUTH-00`(#14)에서 정한다. 시크릿은 저장소에 커밋하지 않는다 — 공유 경로도 #14에서 결정.

## 버전 결정: Spring Boot 3.5.x

저장소는 Spring Boot **4.1.1**로 시작했지만 **3.5.x LTS로 내렸다.** (2026-09-22 결정, PR #28)

이유: Boot 4 / Security 7은 최신이라 **검색해서 나오는 자료와 튜토리얼이 거의 Boot 3 기준**이다. 실제로 저장소를 세팅하면서 `@AutoConfigureMockMvc`의 패키지 경로가 바뀌어 테스트 컴파일이 실패했고, 스타터 이름(`spring-boot-starter-webmvc`)도 달랐다. 초심자가 JWT 로그인을 붙이다가 검색한 코드가 동작하지 않을 때, 그것이 버전 차이인지 자기 실수인지 구분하지 못하면 하루가 날아간다. 검색 자료가 그대로 동작하는 가치가 최신 버전보다 크다.

전환으로 바뀐 것:

| 항목             | 4.1.1                                                | 3.5.x                                                     |
| ---------------- | ---------------------------------------------------- | --------------------------------------------------------- |
| 웹 스타터        | `spring-boot-starter-webmvc`                         | `spring-boot-starter-web`                                 |
| 테스트 스타터    | `*-test` 스타터가 모듈별로 분리                      | `spring-boot-starter-test` 하나                           |
| MockMvc 자동설정 | `org.springframework.boot.webmvc.test.autoconfigure` | `org.springframework.boot.test.autoconfigure.web.servlet` |
| Spring Security  | 7.x                                                  | 6.x                                                       |
| Hibernate        | 7.x                                                  | 6.x                                                       |

같은 PR에서 **Gradle 데몬 JVM을 21로 고정**했다(`gradle/gradle-daemon-jvm.properties`). 팀원이 어떤 JDK를 깔았든 Gradle이 JDK 21을 스스로 받아 빌드한다.

## 선택하지 않은 것

| 후보                    | 안 쓴 이유                                                                                        |
| ----------------------- | ------------------------------------------------------------------------------------------------- |
| Next.js                 | SSR이 필요 없다. API 서버가 따로 있어 SPA가 단순하다                                              |
| 단일 JAR에 프론트 포함  | 분리 배포가 각자 빌드·배포하기 쉽고 역할 경계가 분명하다                                          |
| 도메인별 마이크로서비스 | 카드 승인 → 계좌 출금 같은 흐름이 서비스 경계를 넘으면 분산 트랜잭션이 필요해진다. 한 앱으로 간다 |
| Drools 룰 엔진          | 규칙 3~4개에 룰 엔진은 과하다. 평범한 Java 클래스로 충분                                          |
| Testcontainers          | Docker 의존이 생긴다. H2로 충분하다                                                               |
| Kotlin                  | 팀이 Java에 익숙하다                                                                              |
