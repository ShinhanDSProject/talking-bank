# ERD

```mermaid
erDiagram
    users {
        bigint id PK
        varchar255 email UK "정규화: trim · 소문자"
        varchar255 password "BCrypt 해시"
        varchar50 name
        varchar20 phone
        enum status "ACTIVE · LOCKED · WITHDRAWN"
        int login_fail_count "연속 실패 횟수"
        timestamp last_login_at "nullable"
        timestamp locked_until "nullable · 잠금 해제 시각"
    }

    refresh_token {
        bigint id PK
        bigint user_id UK "users.id — FK 제약 없음"
        varchar512 token
        timestamp expires_at
    }

    account {
        bigint id PK
        varchar30 account_number UK
        varchar50 owner_name "회원 연결 전이라 이름 문자열"
        varchar100 product_name
        decimal balance "19,2"
        varchar3 currency "KRW · USD"
        enum status "ACTIVE · DORMANT · CLOSED"
        date opened_at
    }

    users ||--o| refresh_token : "회원당 최대 1개"
```

스키마의 주인은 엔티티다. 바꿀 때는 아래 파일을 고치고 이 그림을 따라 고친다.

| 표                                    | 엔티티                                                                                                | enum                                                                                                 |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `users`                               | [User](../apps/api/src/main/java/com/example/talkingbank/user/entity/User.java)                       | [UserStatus](../apps/api/src/main/java/com/example/talkingbank/user/entity/UserStatus.java)          |
| `refresh_token`                       | [RefreshToken](../apps/api/src/main/java/com/example/talkingbank/auth/entity/RefreshToken.java)       |                                                                                                      |
| `account`                             | [Account](../apps/api/src/main/java/com/example/talkingbank/account/entity/Account.java)              | [AccountStatus](../apps/api/src/main/java/com/example/talkingbank/account/entity/AccountStatus.java) |
| 모든 표의 `created_at` · `updated_at` | [BaseTimeEntity](../apps/api/src/main/java/com/example/talkingbank/common/entity/BaseTimeEntity.java) |                                                                                                      |
