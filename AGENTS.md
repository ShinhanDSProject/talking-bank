# talking-bank

Shared instructions for AI coding tools. The YAML below is the whole rule set. `CLAUDE.md` and `GEMINI.md` only import this file, so edit here only.

<!-- prettier-ignore -->
```yaml
project:
  name: talking-bank
  summary: A bank that understands speech, but only a human confirms before money moves
  apps:
    api: { path: apps/api, stack: [Spring Boot 3.5, Java 21, JPA] }
    web: { path: apps/web, stack: [React 19, Vite, TypeScript] }

read_first:
  - { file: README.md, for: layout · run · commands }
  - { file: DESIGN.md, for: UI tokens }
  - { file: docs/, for: planning · requirements, status: being rewritten }

workflow:
  steps: [plan, human review, implement, npm test, npm run lint, npm run typecheck, PR]
  pr: one issue = one branch = one PR. Fill "확인한 것" in the template
  scope: touch only requested files. Out-of-scope improvements are proposals only

commands:
  dev: npm run dev # api 8080 · web 5173
  test: npm test # no infra needed
  lint: npm run lint
  typecheck: npm run typecheck
  api_test: cd apps/api && ./gradlew test # from root: ./gradlew :api:test

# Rule schema
#   rules.<scope>: all | api | web
#   id: <PREFIX>-<NN>. Never reuse a number; a removed rule stays with deprecated: true
#   target: <element>.<aspect> — element ∈ entity | dto | service | field | package | bean | web | git | env
#   use: do this · avoid: not this · except: exceptions. No rationale here (why: <link> if needed)
rules:
  all:
    - { id: REPO-01, target: env.secrets, use: root .env (git-ignored), avoid: [commit, hardcode] }
    - { id: REPO-02, target: git.commit-message, use: 'Korean, <type>: <summary>', types: [feat, fix, refactor, test, docs, chore] }
  api:
    - { id: STRUCT-01, target: package.layout, use: ['<domain>/{controller,service,repository,entity,dto,config}', 'common/{config,exception,response,entity}'], except: domain-specific subpackage when a concern fits none (e.g. auth/jwt) }
    - { id: STRUCT-02, target: bean.injection, use: final fields + @RequiredArgsConstructor, avoid: '@Autowired on fields', except: explicit constructor when it computes a value }
    - { id: DOMAIN-01, target: field.money, use: BigDecimal, avoid: [double, float] }
    - { id: DOMAIN-02, target: service.transaction, use: '@Transactional on Service', avoid: [Controller, Repository] }
    - { id: DOMAIN-03, target: entity.timestamps, use: extend BaseTimeEntity (JPA Auditing), avoid: [DB default, '@PrePersist'] }
    - { id: DOMAIN-04, target: entity.member-naming, use: user (User · users · /api/users), avoid: member }
    - { id: GEN-01, target: entity.construction, use: [static factory, '@Builder'], avoid: public constructor, except: [bean injection constructor, exception classes] }
    - { id: GEN-02, target: entity.no-arg-constructor, use: '@NoArgsConstructor(PROTECTED)', avoid: any other }
    - { id: GEN-03, target: dto.request, use: '@Builder + @Jacksonized' }
    - { id: GEN-04, target: dto.response, use: record + static from/of }
    - { id: ACC-01, target: field.accessors, use: Lombok @Getter · @Setter, avoid: handwritten }
    - { id: ACC-02, target: entity.state-change, use: intent-revealing method, avoid: '@Setter' }
    - { id: ACC-03, target: field.secret, use: '@ToString(exclude)', avoid: [logs, responses] }
  web:
    - { id: WEB-01, target: web.server-state, use: TanStack Query, avoid: useEffect + fetch }
    - { id: WEB-02, target: web.api-call, use: apiFetch in lib/api.ts, avoid: direct fetch }
    - { id: WEB-03, target: web.design-tokens, use: DESIGN.md tokens, avoid: hardcoded values }
```
