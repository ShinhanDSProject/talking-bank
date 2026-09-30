# Talking Bank 모니터링 및 알림

> 상태: 지표와 임계값 초안. 실제 정상 트래픽을 측정한 뒤 조정한다.

## 1. 목적

사용자가 신고하기 전에 장애를 발견하고, 원인을 추적하고, 성능 저하가 어느 계층에서 발생했는지 판단한다.

## 2. 관측성의 세 축

| 구분 | 의미 | 예시 |
| --- | --- | --- |
| Metrics | 시간에 따른 숫자 | CPU 75%, p95 420ms |
| Logs | 개별 사건의 상세 기록 | 인증 실패, DB timeout |
| Traces | 한 요청이 여러 구성요소를 지난 경로 | ALB→API→DB 소요시간 |

## 3. 핵심 서비스 지표

`Golden Signals`를 기본으로 사용한다.

- Latency: 응답시간
- Traffic: 요청량
- Errors: 오류율
- Saturation: CPU, 메모리, DB 연결처럼 자원 포화 정도

| 계층 | 수집 지표 |
| --- | --- |
| CloudFront | 요청 수, 오류율, 캐시 적중률 |
| ALB | RequestCount, TargetResponseTime, HTTP 4xx/5xx, HealthyHostCount |
| ECS | CPU, 메모리, Running Task 수, 재시작 |
| Spring Boot | 요청시간, JVM Heap, GC, Thread, DB Pool |
| RDS | CPU, FreeStorageSpace, DatabaseConnections, Read/WriteLatency |

## 4. 초기 알람 제안

| 알람 | 초기 조건 예시 | 우선 조치 |
| --- | --- | --- |
| Healthy Task 없음 | `HealthyHostCount < 1` 1분 | 배포·Task 로그 확인 |
| API 5xx 증가 | 5분 오류율 5% 초과 | 최근 배포와 예외 확인 |
| 응답 지연 | p95 1초 초과 5분 | API/DB 병목 분리 |
| ECS CPU | 80% 초과 10분 | 트래픽과 확장 상태 확인 |
| ECS Memory | 85% 초과 5분 | OOM 및 Heap 확인 |
| RDS 저장공간 | 여유 20% 미만 | 증설·로그/데이터 증가 확인 |
| DB 연결 포화 | 최대 연결의 80% 초과 | Connection Pool과 느린 쿼리 확인 |

임계값은 확정값이 아니다. 정상 부하의 기준선을 수집한 뒤 수정한다.

## 5. 로그 정책

- JSON 구조화 로그 사용을 검토한다.
- 공통 필드: timestamp, level, service, environment, requestId, path, status, durationMs.
- 비밀번호, 토큰, 쿠키, 전체 계좌번호를 기록하지 않는다.
- 동일 요청을 추적할 수 있도록 Request ID를 전달한다.
- 로그 보존 기간은 환경과 규제 요구에 따라 정한다.

## 6. 대시보드 제안

### 서비스 대시보드

- 분당 요청 수
- 성공률과 4xx/5xx
- p50, p95, p99 응답시간
- Healthy Task 수
- 최근 배포 버전

### API/JVM 대시보드

- Endpoint별 요청 수와 응답시간
- Heap 사용량과 GC 시간
- Thread 수
- DB Connection Pool 사용량

### DB 대시보드

- CPU와 메모리
- 활성 연결 수
- 읽기·쓰기 지연
- 느린 쿼리
- 저장공간 증가율

## 7. 장애 대응 흐름

```text
알람 발생
  → 사용자 영향 확인
  → 최근 배포 확인
  → ALB/ECS/RDS 계층 분리
  → 로그와 지표로 원인 후보 확인
  → 완화 또는 롤백
  → 정상화 확인
  → 사후 분석 작성
```

## 8. Runbook 연결

각 알람에는 다음 정보가 있어야 한다.

- 알람이 의미하는 사용자 영향
- 확인할 대시보드와 로그
- 정상 범위
- 첫 조치
- 롤백 방법
- 담당자와 연락 방법

## 9. 검증

- [ ] 의도적으로 테스트 오류를 발생시켰을 때 로그에서 찾을 수 있다.
- [ ] Task를 중지했을 때 ECS가 복구하고 알람이 동작한다.
- [ ] 배포 버전과 오류 증가 시점을 비교할 수 있다.
- [ ] 민감정보가 로그에 나타나지 않는다.
