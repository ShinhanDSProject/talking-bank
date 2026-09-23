# talking-bank

AI 코딩 도구 공통 지침. 규칙은 아래 YAML이 전부다. `CLAUDE.md` · `GEMINI.md`는 이 파일을 불러올 뿐이니 여기만 고친다.

<!-- prettier-ignore -->
```yaml
project:
  name: talking-bank
  summary: 말하면 알아듣고, 돈은 사람이 확인해야 움직이는 은행
  apps:
    api: { path: apps/api, stack: [Spring Boot 3.5, Java 21, JPA] }
    web: { path: apps/web, stack: [React 19, Vite, TypeScript] }

read_first:
  - { file: README.md, for: 구성 · 실행 }
  - { file: DESIGN.md, for: 화면 토큰 }
  - { file: docs/, for: 기획 · 요구사항, status: 재작성 중 }

workflow:
  steps: [계획, 사람 검토, 구현, npm test, npm run lint, npm run typecheck, PR]
  pr: 이슈 = 브랜치 = PR. 템플릿 "확인한 것" 필수
  scope: 시키지 않은 파일 금지. 범위 밖 개선은 제안만

commands:
  dev: npm run dev # api 8080 · web 5173
  test: npm test # 인프라 없이 돈다
  lint: npm run lint
  typecheck: npm run typecheck
  api_test: cd apps/api && ./gradlew test # 루트에서는 ./gradlew :api:test

# 규칙 스키마 — rules.<scope>: all | api | web. id: <영역>-<번호>(번호 재사용 금지, 지운 규칙은 deprecated: true)
#   target: 대상 · use: 이렇게 · avoid: 이렇게는 안 됨 · except: 예외. 이유는 쓰지 않는다(필요하면 why: <링크>).
rules:
  all:
    - { id: REPO-01, target: 시크릿, use: 루트 .env(Git 제외), avoid: [커밋, 코드 하드코딩] }
    - { id: REPO-02, target: 커밋 · PR 메시지, use: '한국어 <type>: <요약>', types: [feat, fix, refactor, test, docs, chore] }
  api:
    - { id: STRUCT-01, target: 패키지, use: ['<domain>/{controller,service,repository,entity,dto}', 'common/{config,exception,response,entity}'] }
    - { id: STRUCT-02, target: 의존성 주입, use: final 필드 + @RequiredArgsConstructor, avoid: '@Autowired 필드 주입', except: 생성자에서 값을 계산하면 직접 생성자 }
    - { id: DOMAIN-01, target: 금액, use: BigDecimal, avoid: [double, float] }
    - { id: DOMAIN-02, target: '@Transactional', use: Service, avoid: [Controller, Repository] }
    - { id: DOMAIN-03, target: createdAt · updatedAt, use: BaseTimeEntity 상속(JPA Auditing), avoid: [DB 기본값, '@PrePersist'] }
    - { id: DOMAIN-04, target: 회원, use: user (User · users · /api/users), avoid: member }
    - { id: GEN-01, target: Entity · DTO 생성, use: [static 팩토리, '@Builder'], avoid: public 생성자, except: [Bean 주입 생성자, 예외 클래스] }
    - { id: GEN-02, target: Entity 기본 생성자, use: '@NoArgsConstructor(PROTECTED)', avoid: 그 외 기본 생성자 }
    - { id: GEN-03, target: 요청 DTO, use: '@Builder + @Jacksonized' }
    - { id: GEN-04, target: 응답 DTO, use: record + static from/of }
    - { id: ACC-01, target: getter · setter, use: Lombok @Getter · @Setter, avoid: 직접 작성 }
    - { id: ACC-02, target: Entity 상태 변경, use: 의도가 드러나는 메서드, avoid: '@Setter' }
    - { id: ACC-03, target: 비밀 필드(password 등), use: '@ToString(exclude)', avoid: 로그 · 응답 노출 }
  web:
    - { id: WEB-01, target: 서버 상태, use: TanStack Query, avoid: useEffect + fetch }
    - { id: WEB-02, target: API 호출, use: lib/api.ts의 apiFetch, avoid: fetch 직접 호출 }
    - { id: WEB-03, target: 색 · 간격 · 폰트, use: DESIGN.md 토큰, avoid: 하드코딩 값 }
```
