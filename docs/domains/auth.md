# 인증

가입시키고, 로그인시키고, 토큰을 발급·재발급·폐기한다. **회원 정보 조회는 [회원](user.md)이 한다.**

- 상태: 구현됨 (PR #54)
- 코드: [`auth/`](../../apps/api/src/main/java/com/example/talkingbank/auth)

## 경계

| 한다                                     | 하지 않는다                      |
| ---------------------------------------- | -------------------------------- |
| 이메일 중복 확인                         | 이메일 인증 메일 발송            |
| 가입 (이메일 · 비밀번호 · 이름 · 휴대폰) | 소셜 로그인                      |
| 로그인과 실패 잠금                       | 비밀번호 찾기 · 변경             |
| Access · Refresh Token 발급과 재발급     | 권한(role) 관리                  |
| 로그아웃 (Refresh Token 폐기)            | 회원 정보 조회 → [회원](user.md) |

## API

`/api/auth`

| 메서드 | 경로                  | 인증         | 요청                                                                                              | 응답                                                                                                                 | 오류                                   |
| ------ | --------------------- | ------------ | ------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| GET    | `/check-email?email=` | 불필요       | 쿼리                                                                                              | `{ available }`                                                                                                      | `COMMON_001`                           |
| POST   | `/signup`             | 불필요       | [SignupRequest](../../apps/api/src/main/java/com/example/talkingbank/auth/dto/SignupRequest.java) | 201 [SignupResponse](../../apps/api/src/main/java/com/example/talkingbank/auth/dto/SignupResponse.java)              | `AUTH_001` · `AUTH_002` · `COMMON_001` |
| POST   | `/login`              | 불필요       | [LoginRequest](../../apps/api/src/main/java/com/example/talkingbank/auth/dto/LoginRequest.java)   | 200 [TokenResponse](../../apps/api/src/main/java/com/example/talkingbank/auth/dto/TokenResponse.java) + `Set-Cookie` | `AUTH_003` · `AUTH_008`                |
| POST   | `/refresh`            | 쿠키         | `refresh_token` 쿠키                                                                              | 200 TokenResponse + 새 `Set-Cookie`                                                                                  | `AUTH_006` · `AUTH_008`                |
| POST   | `/logout`             | Access Token | —                                                                                                 | 204 + 쿠키 만료                                                                                                      | `AUTH_004`                             |

Access Token은 응답 body로, Refresh Token은 쿠키로만 나간다. body에 Refresh Token을 넣지 않는다.

## 규칙

| ID         | 규칙                                                                                                                         |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `AUTH-R01` | 이메일은 `trim` + 소문자로 정규화한다. 중복 확인과 가입이 **같은 정규화**를 쓴다                                             |
| `AUTH-R02` | 비밀번호는 8~20자, 영문 · 숫자 · 특수문자를 **모두** 포함한다. 어기면 `AUTH_002`                                             |
| `AUTH-R03` | 비밀번호 형식은 가입 · 변경에만 검사한다. **로그인에는 걸지 않는다** — 규칙이 바뀌어도 기존 가입자가 로그인할 수 있어야 한다 |
| `AUTH-R04` | 비밀번호는 BCrypt로 저장한다. 로그 · 응답 · `toString`에 원문이 남지 않는다                                                  |
| `AUTH-R05` | 중복 확인을 통과해도 저장은 DB unique 제약으로 한 번 더 막는다. 위반 시 500이 아니라 `AUTH_001`                              |
| `AUTH-R06` | 로그인 실패 사유를 구분해 알리지 않는다. 없는 이메일 · 탈퇴 회원 · 비밀번호 불일치 모두 `AUTH_003`                           |
| `AUTH-R07` | 이메일이 없을 때도 더미 해시와 비교한다. 응답 시간으로 계정 존재 여부를 알 수 없게 한다                                      |
| `AUTH-R08` | 연속 실패가 한도에 닿으면 잠근다. 잠금 중에는 올바른 비밀번호도 `AUTH_008`                                                   |
| `AUTH-R09` | 실패 횟수는 예외와 함께 롤백되지 않는다. 롤백되면 아무리 틀려도 잠기지 않는다                                                |
| `AUTH-R10` | 로그인에 성공하면 실패 횟수를 0으로 되돌린다                                                                                 |
| `AUTH-R11` | Refresh Token은 **회원당 하나**다. 재발급하면 값을 교체한다(rotation)                                                        |
| `AUTH-R12` | 서명은 맞는데 저장된 값과 다른 Refresh Token이 오면 탈취로 본다. 저장된 토큰을 지우고 `AUTH_006`                             |
| `AUTH-R13` | Refresh Token 쿠키는 `httpOnly` · `SameSite=Strict` · `path=/api/auth`. `Secure`는 프로필 설정을 따른다                      |
| `AUTH-R14` | Access Token 블랙리스트는 두지 않는다. **로그아웃 뒤에도 기존 Access Token은 만료까지 유효하다**                             |
| `AUTH-R15` | 만료된 토큰은 `AUTH_005`, 그 밖의 잘못된 토큰은 `AUTH_004`로 나눈다. 프론트가 "재발급"과 "재로그인"을 구분해야 한다          |

## 정책 수치

| 항목               | 값                      | 설정 키                                        |
| ------------------ | ----------------------- | ---------------------------------------------- |
| Access Token 만료  | 30분                    | `jwt.access-token-validity`                    |
| Refresh Token 만료 | 7일                     | `jwt.refresh-token-validity`                   |
| 로그인 실패 한도   | 5회                     | `auth.max-login-fail-count` (`MAX_LOGIN_FAIL`) |
| 잠금 시간          | 30분                    | `auth.lock-duration`                           |
| 쿠키 Secure        | 프로필별                | `auth.cookie-secure`                           |
| 서명               | HS256, 시크릿 32자 이상 | `jwt.secret` (`JWT_SECRET`)                    |

`local` 프로필은 시크릿을 비워 둘 수 있다. 그때는 기동마다 임시 키를 만들고 재시작하면 발급된 토큰이
모두 무효가 된다. `prod` 프로필은 기본값이 없어 환경 변수가 없으면 기동 자체가 실패한다.

## 데이터

- 표: [erd.md](../erd.md)의 `users` · `refresh_token`
- `refresh_token.user_id`는 unique다. `AUTH-R11`이 여기서 강제된다

## 열린 질문

- [ ] 비밀번호 변경 · 찾기를 어느 도메인이 맡는가
- [ ] 잠긴 회원을 푸는 방법 (시간 경과 외에 관리자 해제가 필요한가)
- [ ] 여러 기기 로그인을 허용하는가 — 지금은 `AUTH-R11` 때문에 마지막 로그인만 유지된다
