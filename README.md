# bank-bank

Spring Boot API와 React 웹을 한 저장소에서 개발하는 풀스택 모노레포입니다.

## 구성

```
bank-bank/
├── apps/
│   ├── api/                 # Spring Boot 4 · Java 21 · JPA · Security
│   └── web/                 # Vite · React 19 · TypeScript · TanStack Query
├── packages/                # 앱 사이에서 공유할 코드 (아직 비어 있음)
├── docs/                    # 기획·범위·스펙·일정·개발 규칙
├── build.gradle             # 루트: 플러그인 버전만 선언
├── settings.gradle          # Gradle 멀티프로젝트 (:apps:api)
├── package.json             # npm workspaces (apps/*, packages/*)
└── docker-compose.yml       # 로컬 개발용 MariaDB
```

JVM 모듈은 Gradle 멀티프로젝트가, 프론트엔드는 npm workspaces가 관리합니다.
두 빌드는 서로 결합되어 있지 않으며, **각각 따로 빌드·배포**합니다.

|            | 개발                    | 빌드 산출물                  |
| ---------- | ----------------------- | ---------------------------- |
| `apps/api` | `http://localhost:8080` | `apps/api/build/libs/*.jar`  |
| `apps/web` | `http://localhost:5173` | `apps/web/dist/` (정적 파일) |

## 프로젝트 문서

주제·범위·기술 스펙·일정·개발 규칙은 [`docs/`](docs/01-overview.md)에 있습니다. 처음 합류했다면 이 순서로 읽으세요.

1. [01-overview](docs/01-overview.md) — 무엇을 만드는지
2. [02-scope](docs/02-scope.md) — 범위와 **향후 확장 후보**
3. [06-conventions](docs/06-conventions.md) — 브랜치·커밋·PR·API 계약 등 공통 규칙, 그리고 맡은 쪽의 [backend](docs/conventions/backend.md) 또는 [frontend](docs/conventions/frontend.md) 규칙
4. 구현할 Phase의 [docs/domains/](docs/domains/) 문서 — 그 도메인의 범위·명세·모델·진행

루트의 [AGENTS.md](AGENTS.md)는 AI 코딩 도구(Claude Code · Codex · Cursor · Copilot · Antigravity · Gemini CLI) 공통 지침(문서 위치·작업 절차·절대 규칙), [DESIGN.md](DESIGN.md)는 화면 규칙(색·타이포·간격·컴포넌트)입니다. `CLAUDE.md`·`GEMINI.md`는 AGENTS.md를 불러오기만 합니다.

## 시작하기

사전 준비: JDK 21+ (없으면 Gradle이 자동으로 내려받습니다), Node.js 20+, Docker.

```bash
npm install          # 프론트엔드 의존성 설치 (workspace 전체)
npm run db:up        # MariaDB 컨테이너 기동 (호스트 포트 3308)
npm run dev          # API(8080) + 웹(5173) 동시 실행
```

브라우저에서 <http://localhost:5173> 을 열면 됩니다.
`local` 프로필로 처음 실행할 때 계좌가 비어 있으면 예시 데이터 3건이 자동으로 들어갑니다
(`AccountSeeder`).

> 호스트 포트 3308을 쓰는 이유는 로컬에 설치된 MariaDB(3306)나 다른 프로젝트 컨테이너와
> 겹치지 않게 하기 위해서입니다. 바꾸려면 `docker-compose.yml`과
> `apps/api/src/main/resources/application.yaml`의 `DB_URL` 기본값을 함께 수정하세요.

## 자주 쓰는 명령

루트에서 실행합니다.

| 명령                                  | 설명                       |
| ------------------------------------- | -------------------------- |
| `npm run dev`                         | API와 웹을 동시에 실행     |
| `npm run dev:api` / `npm run dev:web` | 한쪽만 실행                |
| `npm run build`                       | 양쪽 모두 빌드             |
| `npm test`                            | 양쪽 테스트 실행           |
| `npm run lint`                        | 프론트엔드 ESLint          |
| `npm run typecheck`                   | 프론트엔드 타입 검사       |
| `npm run format`                      | Prettier 포맷 적용         |
| `npm run db:up` / `npm run db:down`   | MariaDB 컨테이너 기동/정리 |

Gradle을 직접 쓸 수도 있습니다.

```bash
./gradlew :apps:api:bootRun
./gradlew :apps:api:test
./gradlew :apps:api:bootJar
```

## 개발 중 API 호출 흐름

브라우저 → `http://localhost:5173/api/...` → (Vite 프록시) → `http://localhost:8080/api/...`

프록시를 거치므로 개발 중에는 CORS가 필요 없습니다. 프록시 대상은
`VITE_API_PROXY_TARGET`으로 바꿀 수 있습니다(`apps/web/.env.example` 참고).

## 배포

프론트와 API를 따로 배포하는 구성입니다.

**apps/web** — `npm run build:web`으로 만든 `apps/web/dist/`를 정적 호스팅(S3/CDN/Nginx)에 올립니다.
빌드 시 `VITE_API_BASE_URL`에 API 주소를 넣으면 그 주소로 직접 호출합니다.

```bash
VITE_API_BASE_URL=https://api.example.com npm run build:web
```

**apps/api** — `./gradlew :apps:api:bootJar`로 만든 JAR을 실행합니다.
프론트가 다른 도메인에 있으므로 허용 출처를 반드시 지정해야 합니다.

```bash
CORS_ALLOWED_ORIGINS=https://bank-bank.example.com \
DB_URL=jdbc:mariadb://db.example.com:3306/bankbank \
DB_USERNAME=... DB_PASSWORD=... \
JPA_DDL_AUTO=validate \
java -jar apps/api/build/libs/api-0.0.1-SNAPSHOT.jar
```

## 알아둘 점

- **보안**: 현재 `/api/**`는 인증 없이 열려 있습니다(`SecurityConfig`). 인증 체계를 붙일 때
  이 부분을 먼저 좁혀야 합니다.
- **스키마**: 로컬은 `ddl-auto: update`입니다. 운영에서는 `JPA_DDL_AUTO=validate`로 두고
  마이그레이션 도구(Flyway 등)를 쓰는 것을 권합니다.
- **타입 공유**: 지금은 서버의 `AccountResponse`와 웹의 `Account` 타입을 손으로 맞추고 있습니다.
  공유가 늘어나면 `packages/`에 타입 패키지를 두거나 OpenAPI 기반 생성을 검토하세요.
