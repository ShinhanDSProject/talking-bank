# Talking Bank 네트워크 설계

> 상태: CIDR과 계정 구조는 제안이며 구축 전에 충돌 여부와 비용을 검토한다.

## 1. 용어

| 용어 | 의미 |
| --- | --- |
| VPC | AWS 안에 만드는 서비스 전용 가상 네트워크 |
| CIDR | 네트워크가 사용할 IP 주소 범위를 표현하는 표기 |
| Subnet | VPC를 용도와 가용 영역별로 나눈 작은 네트워크 |
| AZ | 물리적으로 분리된 가용 영역 |
| Route Table | 트래픽이 이동할 다음 경로를 정하는 규칙표 |
| Internet Gateway | Public Subnet과 인터넷을 연결하는 관문 |
| NAT Gateway | Private 자원이 외부로 나가되 외부에서 직접 들어오지 못하게 하는 관문 |
| Security Group | 인스턴스나 서비스에 적용하는 상태 저장 방식 방화벽 |

## 2. 제안 주소 계획

```text
VPC: 10.0.0.0/16

AZ-a
  Public Subnet:      10.0.1.0/24
  Private App Subnet: 10.0.11.0/24
  Private DB Subnet:  10.0.21.0/24

AZ-c
  Public Subnet:      10.0.2.0/24
  Private App Subnet: 10.0.12.0/24
  Private DB Subnet:  10.0.22.0/24
```

`/24`는 일반적으로 256개 주소 범위를 뜻하며 AWS 예약 주소를 제외한 수를 사용할 수 있다.

## 3. 자원 배치

| 계층 | Subnet | 인터넷 직접 접근 | 자원 |
| --- | --- | --- | --- |
| 진입 | Public | 허용 | ALB, 필요 시 NAT Gateway |
| 애플리케이션 | Private App | 차단 | ECS Fargate Task |
| 데이터 | Private DB | 차단 | RDS MariaDB |

S3, CloudFront, Route 53은 VPC Subnet 안에 배치하는 일반 서버가 아닌 AWS 관리형 서비스다.

## 4. 통신 허용표

| 출발지 | 목적지 | 포트 | 용도 | 허용 여부 |
| --- | --- | --- | --- | --- |
| 인터넷 | CloudFront/ALB | TCP 443 | HTTPS | 허용 |
| ALB 보안 그룹 | ECS 보안 그룹 | TCP 8080 | Spring Boot API | 허용 |
| ECS 보안 그룹 | RDS 보안 그룹 | TCP 3306 | MariaDB | 허용 |
| 인터넷 | ECS | 모든 포트 | 직접 접근 | 차단 |
| 인터넷 | RDS | 모든 포트 | 직접 접근 | 차단 |
| 개발자 개인 IP | RDS | TCP 3306 | 직접 DB 접근 | 기본 차단 |

보안 그룹 규칙은 IP 주소보다 다른 보안 그룹을 출발지로 참조하는 방식을 우선한다.

## 5. 라우팅 제안

- Public Route Table: `0.0.0.0/0`을 Internet Gateway로 보낸다.
- Private App Route Table: 외부 접속이 필요하면 `0.0.0.0/0`을 NAT Gateway로 보낸다.
- Private DB Route Table: 인터넷 기본 경로를 두지 않는 것을 우선한다.
- S3/ECR/CloudWatch 접근 비용과 보안을 위해 VPC Endpoint를 검토한다.

## 6. DNS와 TLS

- Route 53 Hosted Zone에서 도메인을 관리한다.
- ACM에서 인증서를 발급한다.
- 외부 사용자는 HTTP가 아닌 HTTPS만 사용한다.
- HTTP 80을 열 경우 HTTPS 443으로 리다이렉트만 수행한다.

## 7. 개발자 접근

운영 DB를 인터넷에 공개하지 않는다. DB 점검이 필요하면 다음 순서로 검토한다.

1. CloudWatch와 애플리케이션 관리 기능으로 해결
2. SSM Session Manager 기반의 제한된 관리 경로
3. 시간 제한, 사용자 제한, 감사 로그가 있는 접근

공용 Bastion 서버와 고정 SSH 키는 기본 선택으로 두지 않는다.

## 8. 검증 항목

- 외부에서 ECS Task IP로 직접 접속할 수 없어야 한다.
- 외부에서 RDS 주소의 3306 포트에 접속할 수 없어야 한다.
- ALB만 ECS 8080 포트에 접근할 수 있어야 한다.
- ECS만 RDS 3306 포트에 접근할 수 있어야 한다.
- 각 AZ 장애 시 남은 AZ가 요청을 처리할 수 있는지 검증한다.
