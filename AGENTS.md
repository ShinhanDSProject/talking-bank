# talking-bank

AI 코딩 도구 공통 지침. 규칙은 아래 YAML이 전부다. `CLAUDE.md`와 `GEMINI.md`는 이 파일을 불러올 뿐이니 여기만 고친다.

<!-- prettier-ignore -->
```yaml
project:
  name: talking-bank
  summary: 말하면 알아듣고, 돈은 사람이 확인해야 움직이는 은행
  apps:
    api: { path: apps/api, stack: [Spring Boot 3.5, Java 21, JPA] }
    web: { path: apps/web, stack: [React 19, Vite, TypeScript] }

read_first:
  - { file: README.md, for: 구성 · 실행 · 명령 }
  - { file: DESIGN.md, for: 화면 토큰 }
  - { file: docs/, for: 기획 · 요구사항, status: 다시 쓰는 중 }

workflow:
  steps: [계획, 사람 검토, 구현, npm test, npm run lint, npm run typecheck, PR]
  pr: 이슈 하나 = 브랜치 하나 = PR 하나. 템플릿의 "확인한 것"을 채운다
  scope: 시키지 않은 파일은 건드리지 않는다. 범위 밖 개선은 제안만 한다

commands:
  dev: npm run dev # api 8080 · web 5173
  test: npm test # 인프라 없이 돈다
  lint: npm run lint
  typecheck: npm run typecheck
  api_test: cd apps/api && ./gradlew test # 루트에서는 ./gradlew :api:test

# 규칙 스키마
#   rules.<scope>: all | api | web
#   id: <접두사>-<번호>. 번호는 재사용하지 않고, 지운 규칙은 deprecated: true 로 남긴다
#   target: <요소>.<측면> — 요소 ∈ entity | dto | service | field | package | bean | web | git | env
#   use: 이렇게 · avoid: 이렇게는 안 됨 · except: 예외. 이유는 쓰지 않는다(필요하면 why: <링크>)
rules:
  all:
    - { id: REPO-01, target: env.secrets, use: 루트 .env (Git 제외), avoid: [커밋, 하드코딩] }
    - { id: REPO-02, target: git.commit-message, use: '한국어, <type>: <요약>', types: [feat, fix, refactor, test, docs, chore] }
  api:
    - { id: STRUCT-01, target: package.layout, use: ['<domain>/{controller,service,repository,entity,dto,config}', 'common/{config,exception,response,entity}'], except: 어디에도 맞지 않는 관심사는 도메인 전용 하위 패키지 (예 auth/jwt) }
    - { id: STRUCT-02, target: bean.injection, use: final 필드 + @RequiredArgsConstructor, avoid: '필드 @Autowired', except: 생성자에서 값을 계산할 때는 직접 생성자 }
    - { id: DOMAIN-01, target: field.money, use: BigDecimal, avoid: [double, float] }
    - { id: DOMAIN-02, target: service.transaction, use: 'Service의 @Transactional', avoid: [Controller, Repository] }
    - { id: DOMAIN-03, target: entity.timestamps, use: BaseTimeEntity 상속 (JPA Auditing), avoid: [DB 기본값, '@PrePersist'] }
    - { id: DOMAIN-04, target: entity.member-naming, use: user (User · users · /api/users), avoid: member }
    - { id: GEN-01, target: entity.construction, use: [static 팩토리, '@Builder'], avoid: public 생성자, except: [Bean 주입 생성자, 예외 클래스] }
    - { id: GEN-02, target: entity.no-arg-constructor, use: '@NoArgsConstructor(PROTECTED)', avoid: 그 외 기본 생성자 }
    - { id: GEN-03, target: dto.request, use: '@Builder + @Jacksonized' }
    - { id: GEN-04, target: dto.response, use: record + static from/of }
    - { id: ACC-01, target: field.accessors, use: Lombok @Getter · @Setter, avoid: 직접 작성 }
    - { id: ACC-02, target: entity.state-change, use: 의도가 드러나는 메서드, avoid: '@Setter' }
    - { id: ACC-03, target: field.secret, use: '@ToString(exclude)', avoid: [로그, 응답] }
  web:
    - { id: WEB-01, target: web.server-state, use: TanStack Query, avoid: useEffect + fetch }
    - { id: WEB-02, target: web.api-call, use: lib/api.ts의 apiFetch, avoid: fetch 직접 호출 }
    - { id: WEB-03, target: web.design-tokens, use: DESIGN.md 토큰, avoid: 하드코딩 값 }
```
