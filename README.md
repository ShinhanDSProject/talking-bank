# talking-bank

**말하면 알아듣고, 돈은 사람이 확인해야 움직이는 은행.** Spring Boot API와 React 웹을 한 저장소에서 개발하는 풀스택 모노레포입니다.

## 구성

```
talking-bank/
├── apps/
│   ├── api/          # Spring Boot 3.5 · Java 21 · JPA — 독립 Gradle 프로젝트
│   └── web/          # Vite · React 19 · TypeScript · TanStack Query
├── packages/         # 앱 사이에서 공유할 코드 (아직 비어 있음)
├── docs/             # 기획·요구사항·개발 규칙
├── settings.gradle   # apps/api를 포함 빌드로 연결 (IDE에서 루트를 열 때용)
└── package.json      # npm workspaces
```

|            | 개발 서버               | 빌드 산출물                  |
| ---------- | ----------------------- | ---------------------------- |
| `apps/api` | `http://localhost:8080` | `apps/api/build/libs/*.jar`  |
| `apps/web` | `http://localhost:5173` | `apps/web/dist/` (정적 파일) |

## 시작하기

JDK 21+ (없으면 Gradle이 자동으로 내려받습니다), Node.js 20+ 가 필요합니다.

```bash
npm install
npm run dev          # API(8080) + 웹(5173) 동시 실행
```

브라우저에서 <http://localhost:5173> 을 엽니다. 개발 중 `/api` 요청은 Vite 프록시가 API 서버로 넘깁니다.

DB는 인메모리 H2입니다. 서버를 다시 올리면 예시 계좌 3건이 자동으로 들어갑니다(`AccountSeeder`).

IntelliJ는 루트 폴더를 열어도, `apps/api` 폴더만 열어도 됩니다.

## 명령

| 명령                                  | 설명                   |
| ------------------------------------- | ---------------------- |
| `npm run dev`                         | API와 웹을 동시에 실행 |
| `npm run dev:api` / `npm run dev:web` | 한쪽만 실행            |
| `npm run build`                       | 양쪽 모두 빌드         |
| `npm test`                            | 양쪽 테스트 실행       |
| `npm run lint` / `npm run typecheck`  | 프론트엔드 검사        |
| `npm run format`                      | Prettier 포맷 적용     |

Gradle을 직접 쓰려면 `cd apps/api && ./gradlew test`, 루트에서는 `./gradlew :api:test`.

## 문서

무엇을 만드는지, 범위, 요구사항, 개발 규칙은 [`docs/`](docs/01-overview.md)에 있습니다. 처음 합류했다면 이 순서로 읽으세요.

1. [01-overview](docs/01-overview.md) — 무엇을 만드는지
2. [02-scope](docs/02-scope.md) — 범위와 Phase
3. [requirements/](docs/requirements/01-core.md) — 화면 · 정책 수치 · 요구사항
4. [06-conventions](docs/06-conventions.md) — Git · 이슈 · API 계약 규칙, 그리고 맡은 쪽의 [backend](docs/conventions/backend.md) · [frontend](docs/conventions/frontend.md) 규칙
5. 구현할 Phase의 [domains/](docs/domains/01-core.md) 문서

AI 코딩 도구 공통 지침은 [AGENTS.md](AGENTS.md), 화면 규칙은 [DESIGN.md](DESIGN.md)입니다.
