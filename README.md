# talking-bank

**말하면 알아듣고, 돈은 사람이 확인해야 움직이는 은행.** Spring Boot API, React 웹, FastAPI AI 서비스를 한 저장소에서 개발하는 풀스택 모노레포입니다.

## 구성

```
talking-bank/
├── apps/
│   ├── api/                 # Spring Boot 3.5 · Java 21 · JPA
│   ├── web/                 # Vite · React 19 · TypeScript · TanStack Query
│   └── assistant/           # FastAPI · anthropic SDK — AI 비서 (Phase 2, 아직 없음)
├── packages/                # 앱 사이에서 공유할 코드 (아직 비어 있음)
├── docs/                    # 기획·범위·스펙·일정·개발 규칙
└── package.json             # npm workspaces (apps/*, packages/*)
```

`apps/api`는 독립 Gradle 프로젝트(`apps/api/build.gradle`)이고, 프론트엔드는 npm workspaces가 관리합니다.
두 빌드는 서로 결합되어 있지 않으며, **각각 따로 빌드·배포**합니다.

|                  | 개발                    | 빌드 산출물                  |
| ---------------- | ----------------------- | ---------------------------- |
| `apps/api`       | `http://localhost:8080` | `apps/api/build/libs/*.jar`  |
| `apps/web`       | `http://localhost:5173` | `apps/web/dist/` (정적 파일) |
| `apps/assistant` | `http://localhost:8000` | 컨테이너 이미지 (Phase 2)    |

## 프로젝트 문서

주제·범위·기술 스펙·일정·개발 규칙은 [`docs/`](docs/01-overview.md)에 있습니다. 처음 합류했다면 이 순서로 읽으세요.

1. [01-overview](docs/01-overview.md) — 무엇을 만드는지
2. [02-scope](docs/02-scope.md) — 범위와 **향후 확장 후보**
3. [requirements/](docs/requirements/01-core.md) — 화면 · 정책 수치 · 요구사항의 단일 출처
4. [06-conventions](docs/06-conventions.md) — 브랜치·커밋·PR·API 계약·AI 서비스 규칙, 그리고 맡은 쪽의 [backend](docs/conventions/backend.md) · [frontend](docs/conventions/frontend.md) · [assistant](docs/conventions/assistant.md) 규칙
5. 구현할 Phase의 [docs/domains/](docs/domains/) 문서 — 그 도메인의 범위·명세·모델·진행

루트의 [AGENTS.md](AGENTS.md)는 AI 코딩 도구(Claude Code · Codex · Cursor · Copilot · Antigravity · Gemini CLI) 공통 지침(문서 위치·작업 절차·절대 규칙), [DESIGN.md](DESIGN.md)는 화면 규칙(색·타이포·간격·컴포넌트)입니다. `CLAUDE.md`·`GEMINI.md`는 AGENTS.md를 불러오기만 합니다.

## 시작하기

사전 준비: JDK 21+ (없으면 Gradle이 자동으로 내려받습니다), Node.js 20+. Docker는 아직 필요 없습니다.

```bash
npm install          # 프론트엔드 의존성 설치 (workspace 전체)
npm run dev          # API(8080) + 웹(5173) 동시 실행
```

브라우저에서 <http://localhost:5173> 을 열면 됩니다.

DB는 **인메모리 H2**입니다. 서버를 내리면 데이터가 사라지고, 다시 올리면 `AccountSeeder`가
예시 계좌 3건을 넣습니다. MariaDB·Docker·Spring Security 같은 인프라 설정은 일부러 빼 두었고,
Step 1-1의 `AUTH-01`·`AUTH-03` 이슈에서 팀이 함께 붙입니다.

## 자주 쓰는 명령

루트에서 실행합니다.

| 명령                                  | 설명                   |
| ------------------------------------- | ---------------------- |
| `npm run dev`                         | API와 웹을 동시에 실행 |
| `npm run dev:api` / `npm run dev:web` | 한쪽만 실행            |
| `npm run build`                       | 양쪽 모두 빌드         |
| `npm test`                            | 양쪽 테스트 실행       |
| `npm run lint`                        | 프론트엔드 ESLint      |
| `npm run typecheck`                   | 프론트엔드 타입 검사   |
| `npm run format`                      | Prettier 포맷 적용     |

Gradle을 직접 쓸 수도 있습니다.

```bash
cd apps/api
./gradlew bootRun
./gradlew test
./gradlew bootJar
```

IntelliJ에서는 `apps/api` 폴더를 프로젝트로 열면 됩니다.

## 개발 중 API 호출 흐름

브라우저 → `http://localhost:5173/api/...` → (Vite 프록시) → `http://localhost:8080/api/...`

프록시를 거치므로 개발 중에는 CORS가 필요 없습니다. 프록시 대상은
`VITE_API_PROXY_TARGET`으로 바꿀 수 있습니다(`apps/web/.env.example` 참고).

## 배포

프론트와 API를 따로 배포하는 구성입니다. `npm run build:web`은 `apps/web/dist/`(정적 파일)를,
`npm run build:api`는 `apps/api/build/libs/*.jar`를 만듭니다.
배포 환경(DB · CORS · 환경 변수 · 서버)은 Step 1-1 인프라 이슈에서 정하고 여기에 적습니다.

## 아직 없는 것

일부러 최소 구성으로 시작했습니다. 아래는 Step 1-1에서 이슈로 붙입니다.

| 없는 것                      | 붙이는 이슈           | 지금 상태                                                                 |
| ---------------------------- | --------------------- | ------------------------------------------------------------------------- |
| MariaDB · Docker Compose     | `AUTH-01`             | 인메모리 H2. 재시작하면 데이터가 사라진다                                 |
| Spring Security · CORS · JWT | `AUTH-03`             | `/api/**`가 인증 없이 열려 있다. 개발 중엔 Vite 프록시라 CORS도 필요 없다 |
| 공통 에러 응답 · Swagger     | `AUTH-10` · `AUTH-11` | 없음                                                                      |
| 타입 공유(`packages/`)       | 필요해질 때           | 서버 `AccountResponse`와 웹 `Account`를 손으로 맞춘다                     |
