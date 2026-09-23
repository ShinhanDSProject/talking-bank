# talking-bank

AI 코딩 도구 공통 지침. 규칙은 아래 YAML이 전부다. `CLAUDE.md` · `GEMINI.md`는 이 파일을 불러올 뿐이니 여기만 고친다.

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

# id: <영역>-<번호>. 번호는 재사용하지 않고, 지운 규칙은 deprecated: true 로 남긴다.
# scope: api | web | all. 이유는 rule 에 쓰지 않고 필요하면 why: <링크> 한 줄.
rules:
  - { id: MONEY-01, scope: api, rule: 금액은 BigDecimal. double · float 금지 }
  - {
      id: PKG-01,
      scope: api,
      rule: '<domain>/controller · service · repository · entity · dto. 공통은 common/config · exception · response · entity',
    }
  - { id: TX-01, scope: api, rule: '@Transactional은 Service에만' }
  - {
      id: DI-01,
      scope: api,
      rule: final 필드 + @RequiredArgsConstructor. 필드 주입 금지. 생성자에서 값을 계산할 때만 직접 작성,
    }
  - {
      id: GEN-01,
      scope: api,
      rule: Entity · DTO는 static 팩토리 또는 @Builder. public 생성자 금지(Bean 주입 생성자 · 예외 클래스 제외),
    }
  - { id: GEN-02, scope: api, rule: Entity 기본 생성자는 @NoArgsConstructor(PROTECTED) 하나만 }
  - {
      id: GEN-03,
      scope: api,
      rule: 요청 DTO는 @Builder + @Jacksonized,
      응답 DTO는 record + static from/of,
    }
  - {
      id: ACC-01,
      scope: api,
      rule: getter · setter는 Lombok. Entity에 @Setter 금지,
      상태 변경은 메서드. 비밀 필드는 @ToString(exclude),
    }
  - {
      id: TIME-01,
      scope: api,
      rule: 생성 · 수정 시각은 BaseTimeEntity 상속(JPA Auditing). DB 기본값 · @PrePersist 금지,
    }
  - { id: NAME-01, scope: api, rule: '회원 = user (User · users · /api/users). member 금지' }
  - { id: WEB-01, scope: web, rule: 서버 상태는 TanStack Query }
  - { id: WEB-02, scope: web, rule: API 호출은 lib/api.ts의 apiFetch만 }
  - { id: WEB-03, scope: web, rule: 색 · 간격 · 폰트는 DESIGN.md 토큰만 }
  - { id: SEC-01, scope: all, rule: 시크릿 커밋 금지. 환경 변수는 루트 .env(Git 제외) }
  - {
      id: GIT-01,
      scope: all,
      rule: '커밋 · PR 메시지는 한국어, <type>: <요약> (feat · fix · refactor · test · docs · chore)',
    }
```
