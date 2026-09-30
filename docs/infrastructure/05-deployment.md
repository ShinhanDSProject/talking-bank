# Talking Bank 빌드 및 배포

> 상태: 목표 절차 초안. 현재 저장소에는 Dockerfile과 GitHub Actions가 없다.

## 1. 배포 대상

| 대상 | 빌드 결과 | 제안 배포 위치 |
| --- | --- | --- |
| React Web | `apps/web/dist/` | S3 + CloudFront |
| Spring Boot API | 실행 JAR → Docker Image | ECR + ECS Fargate |
| DB Schema | Flyway SQL | RDS MariaDB |

## 2. 로컬 검증

프로젝트 루트에서 다음 검사를 모두 통과해야 한다.

```powershell
npm ci
npm test
npm run lint
npm run typecheck
npm run build
```

백엔드만 확인할 때:

```powershell
cd apps\api
.\gradlew.bat test
.\gradlew.bat bootJar
```

## 3. 브랜치 흐름 제안

```text
feature/*
  └─ Pull Request
       └─ 자동 검증
            └─ 승인 및 main 병합
                 └─ dev 자동 배포
                      └─ 검증
                           └─ prod 승인 배포
```

브랜치 전략은 팀 규칙이 우선이며 이 문서는 인프라 관점의 제안이다.

## 4. CI 단계

Pull Request에서 수행한다.

1. 소스 체크아웃
2. JDK 21 설정
3. Node.js LTS 설정
4. `npm ci`
5. 백엔드 테스트
6. 프론트엔드 테스트
7. lint와 typecheck
8. 백엔드와 프론트엔드 build
9. 필요 시 의존성·이미지 취약점 검사

## 5. API CD 단계

1. 검증된 커밋에서 Spring Boot JAR을 만든다.
2. Docker Image를 만든다.
3. 이미지에 Git commit SHA 태그를 붙인다.
4. ECR에 push한다.
5. 새 ECS Task Definition Revision을 등록한다.
6. ECS Service를 갱신한다.
7. ALB Health Check가 성공할 때까지 기다린다.
8. 오류율과 로그를 확인한다.

## 6. Web CD 단계

1. 환경별 공개 설정을 주입해 React를 build한다.
2. `apps/web/dist/`를 환경별 S3 Bucket에 업로드한다.
3. 오래된 해시형 asset은 캐시하고 `index.html`은 짧게 캐시한다.
4. 필요할 때만 CloudFront invalidation을 수행한다.
5. 웹 접속과 핵심 API 호출을 Smoke Test한다.

`Smoke Test`는 배포 직후 로그인 화면, Health Check, 핵심 조회처럼 서비스가 기본적으로 살아 있는지 빠르게 확인하는 검사다.

## 7. 환경 변수

| 변수 | 용도 | 비밀 여부 |
| --- | --- | --- |
| `SPRING_PROFILES_ACTIVE` | `prod` 등 프로필 선택 | 아니오 |
| `DB_URL` | MariaDB 접속 주소 | 제한 정보 |
| `DB_USERNAME` | DB 사용자 | 제한 정보 |
| `DB_PASSWORD` | DB 비밀번호 | 예 |
| `JWT_SECRET` | JWT 서명 키 | 예 |
| `VITE_API_BASE_URL` | 브라우저가 호출할 API 주소 | 아니오 |

비밀값은 GitHub Repository Variable이나 소스 코드에 직접 기록하지 않는다. GitHub OIDC와 AWS Secrets Manager 사용을 우선 검토한다.

## 8. DB 마이그레이션

- 운영에서 Hibernate `ddl-auto=update`를 사용하지 않는다.
- 운영은 `validate`를 사용하고 변경은 Flyway로 수행하는 방식을 제안한다.
- 파괴적 변경은 데이터 백업과 되돌리기 계획을 먼저 작성한다.
- 애플리케이션 이전·이후 버전 모두와 호환되는 단계적 변경을 우선한다.

## 9. 롤백

### API

1. 배포 자동 중단 조건을 확인한다.
2. 직전 정상 ECR Image와 Task Definition Revision을 선택한다.
3. ECS Service를 직전 Revision으로 되돌린다.
4. Health Check와 오류율을 확인한다.

### Web

1. 직전 정상 빌드 Artifact를 S3에 다시 배포한다.
2. 필요한 경우 CloudFront 캐시를 무효화한다.
3. 화면과 API 연동을 확인한다.

DB Schema는 단순 코드 롤백으로 되돌릴 수 없을 수 있으므로 배포 전 호환성 전략이 필요하다.

## 10. 배포 완료 기준

- [ ] 모든 CI 검사가 성공했다.
- [ ] ALB의 새 Task가 Healthy다.
- [ ] 핵심 API Smoke Test가 성공했다.
- [ ] 웹 페이지가 정상 로딩된다.
- [ ] 5xx와 응답시간이 기준 이내다.
- [ ] 배포 버전과 담당자가 기록됐다.
