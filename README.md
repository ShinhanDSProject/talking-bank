# talking-bank

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

```bash
npm install
npm run dev          # API(8080) + 웹(5173) 동시 실행
```

## 명령

| 명령                                  |
| ------------------------------------- |
| `npm run dev`                         |
| `npm run dev:api` / `npm run dev:web` |
| `npm run build`                       |
| `npm test`                            |
| `npm run lint` / `npm run typecheck`  |
| `npm run format`                      |
