# Talking Bank 시스템 아키텍처

> 상태: 제안(Proposed). 현재 저장소에 AWS 구성은 구현되어 있지 않다.

## 1. 설계 원칙

- 프론트엔드 정적 파일과 백엔드 API 실행 환경을 분리한다.
- API와 DB는 인터넷에서 직접 접근할 수 없게 한다.
- 애플리케이션은 컨테이너로 동일하게 실행한다.
- 상태는 컨테이너가 아니라 DB 등 외부 저장소에 보관한다.
- 처음에는 단순하게 시작하고 실제 필요가 확인될 때 Redis 등을 추가한다.

## 2. 현재 로컬 구조

```text
Browser
  └─ http://localhost:5173
       React + Vite
          └─ /api 프록시
               Spring Boot :8080
                  └─ Spring Data JPA
                       └─ H2 인메모리 DB
```

H2는 현재 개발 편의를 위한 임시 DB다. API 프로세스가 종료되면 현재 설정의 데이터가 사라지므로 운영 DB로 사용하지 않는다.

## 3. 목표 운영 구조

```text
사용자
  │ HTTPS
  ▼
Route 53 ─ 도메인 이름 해석
  ▼
CloudFront ─ CDN, TLS 종료, 캐시
  ├─ 화면 요청 ──> S3 ─ React 정적 파일
  └─ /api 요청 ─> ALB ─> ECS Fargate ─> RDS MariaDB
                                │
                                ├─ Secrets Manager
                                └─ CloudWatch

GitHub ─> GitHub Actions ─> ECR ─> ECS
                       └───────> S3/CloudFront
```

## 4. 구성요소와 책임

| 구성요소 | 책임 | 저장소와의 관계 |
| --- | --- | --- |
| Route 53 | 도메인을 서비스 주소로 연결 | 신규 제안 |
| ACM | HTTPS 인증서 발급·갱신 | 신규 제안 |
| CloudFront | 정적 파일 전달, 캐시, HTTPS 진입점 | 신규 제안 |
| S3 | `apps/web/dist` 정적 파일 저장 | 신규 제안 |
| ALB | API 요청 분산과 Health Check | 신규 제안 |
| ECS Fargate | Spring Boot Docker 컨테이너 실행 | 신규 제안 |
| ECR | API Docker Image 보관 | 신규 제안 |
| RDS MariaDB | 운영 관계형 데이터 영구 저장 | H2 대체 제안 |
| Secrets Manager | DB 비밀번호와 JWT 키 보관 | 신규 제안 |
| CloudWatch | 로그, 지표, 알람 | Actuator와 연계 제안 |
| GitHub Actions | 테스트·빌드·배포 자동화 | 현재 워크플로 없음 |

## 5. 요청 처리 흐름

### 화면 요청

1. 사용자가 서비스 도메인에 접속한다.
2. Route 53이 CloudFront 주소를 알려 준다.
3. CloudFront가 캐시를 확인한다.
4. 캐시에 없으면 S3에서 React 파일을 가져온다.
5. 사용자의 브라우저가 React를 실행한다.

### API 요청

1. React가 `/api/accounts` 같은 API를 호출한다.
2. CloudFront가 API 요청을 ALB로 전달한다.
3. ALB가 정상 상태인 ECS Task 하나를 선택한다.
4. Spring Boot의 Controller, Service, Repository 순서로 처리한다.
5. Repository가 RDS MariaDB를 조회한다.
6. JSON 응답이 반대 방향으로 사용자에게 돌아간다.

## 6. 상태와 확장

ECS Task는 언제든 교체될 수 있으므로 사용자 데이터나 업로드 파일을 컨테이너 내부에 영구 저장하지 않는다.

`수평 확장`은 더 큰 서버 한 대로 바꾸는 대신 같은 서버를 여러 대 추가하는 방식이다.

```text
ALB
 ├─ ECS Task A
 ├─ ECS Task B
 └─ ECS Task C  ← 트래픽 증가 시 추가
```

## 7. Redis 도입 기준

초기 구조에서는 제외한다. 다음 중 실제 요구가 생길 때 ADR을 작성하고 추가한다.

- 여러 API Task가 공유할 세션이 필요하다.
- 반복 조회 캐시가 DB 병목을 줄인다는 측정 결과가 있다.
- 로그인 시도 제한 등 빠른 카운터가 필요하다.
- 분산 환경에서 잠금이 필요하고 DB 잠금만으로 부족하다.

## 8. 미결정 사항

- CloudFront 단일 도메인에서 `/api`를 분기할지, `api.example.com`을 사용할지
- ECS Task CPU·메모리 시작 사양
- 개발 환경에서 NAT Gateway 비용을 감수할지
- RDS Multi-AZ를 개발 환경에도 적용할지
- WAF 적용 시기와 규칙
