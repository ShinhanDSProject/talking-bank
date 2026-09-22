# DESIGN.md — 디자인 시스템

> PRD가 "무엇을 만들지"를 정하듯, 이 파일은 "어떻게 보일지"를 정한다. Figma 변수, CSS 변수, AI 디자인 도구에 주는 프롬프트가 전부 이 값을 쓴다. 값을 바꾸면 여기를 먼저 고친다.

## 원칙

| 원칙                | 뜻                                                                     |
| ------------------- | ---------------------------------------------------------------------- |
| **숫자가 주인공**   | 잔액·금액은 화면에서 가장 크고 굵다. 장식은 숫자를 가리지 않는다       |
| **한 화면 한 행동** | 주 버튼(Fill)은 화면당 하나, 하단에 고정한다                           |
| **파랑 하나로**     | 브랜드 색은 신한 블루 `#0046FF` 하나. 행동을 이끄는 곳에만 쓴다        |
| **말은 짧게**       | 제목은 질문형("누구에게 보낼까요?"), 버튼은 동사형("송금하기"), 존댓말 |

기준 프레임 **412 × 917** (모바일 웹 우선). 서체는 Inter(숫자·영문) + Pretendard(한글 대체).

## 1. Foundation

### 1.1 Color

#### Palette

50 → 900, 숫자가 클수록 어둡다. 화면에서 직접 쓰지 않고 시맨틱 토큰이 가리킨다.

| 스텝  | blue      | gray      | red       | green     | amber     |
| ----- | --------- | --------- | --------- | --------- | --------- |
| `50`  | `#E8EEFF` | `#F3F5F9` | `#FEECEC` | `#E6F7F0` | `#FEF5E6` |
| `100` | `#C7D6FF` | `#EEF1F5` | `#FDD3D3` | `#C3EBD9` | `#FDE6BF` |
| `200` | `#9DB6FF` | `#E5E8EE` |           |           |           |
| `300` | `#6E92FF` | `#CBD2DC` | `#F58A8A` | `#6ED0A5` | `#F9C46B` |
| `400` | `#3D6BFF` | `#A3ADBB` |           |           |           |
| `500` | `#0046FF` | `#7B8694` | `#EF4444` | `#10B981` | `#F59E0B` |
| `600` | `#0036CC` | `#4E5968` | `#D23636` | `#0E9C6D` | `#D68609` |
| `700` | `#002A9E` | `#333D4B` | `#A82525` | `#0B7A55` | `#A86807` |
| `800` | `#001F73` | `#212A3A` |           |           |           |
| `900` | `#00154D` | `#191F28` |           |           |           |

`blue/500`이 신한금융그룹 CI의 신한 블루다. `overlay/dim` = `rgba(0,0,0,0.6)`.

#### Semantic

코드와 Figma는 이 이름만 쓴다. `bg-*`는 면, `text-*`는 글자, `border-*`는 선, `icon-*`은 아이콘.

| 토큰                                                           | 값                                             | 용도                                        |
| -------------------------------------------------------------- | ---------------------------------------------- | ------------------------------------------- |
| `bg-primary`                                                   | `white`                                        | 페이지 · 카드 · 시트                        |
| `bg-secondary`                                                 | `gray/50`                                      | 페이지 하단 영역 · 키패드 · 섹션 띠         |
| `bg-tertiary`                                                  | `gray/100`                                     | Weak Dark 버튼 · 스켈레톤                   |
| `bg-pressed`                                                   | `gray/100`                                     | 행을 누르는 동안                            |
| `bg-disabled`                                                  | `gray/100`                                     | 비활성 입력                                 |
| `bg-brand`                                                     | `blue/500`                                     | 주 버튼 · 선택 표시 · 스위치 on             |
| `bg-brand-hover`                                               | `blue/600`                                     | 주 버튼 hover                               |
| `bg-brand-pressed`                                             | `blue/700`                                     | 주 버튼 누르는 동안                         |
| `bg-brand-soft`                                                | `blue/50`                                      | Weak Primary 버튼 · 정보 배지 · 아이콘 배경 |
| `bg-dark`                                                      | `gray/800`                                     | 토스트 · Dark 버튼                          |
| `bg-dark-hover`                                                | `gray/900`                                     | Dark 버튼 hover                             |
| `bg-danger`                                                    | `red/500`                                      | Danger 버튼                                 |
| `bg-danger-hover`                                              | `red/600`                                      | Danger 버튼 hover                           |
| `bg-success-soft`                                              | `green/50`                                     | 완료 배지 · 성공 아이콘 배경                |
| `bg-warning-soft`                                              | `amber/50`                                     | 보류 배지                                   |
| `bg-danger-soft`                                               | `red/50`                                       | 차단 배지 · 실패 아이콘 배경                |
| `bg-dim`                                                       | `overlay/dim`                                  | 시트·다이얼로그 뒤 배경                     |
| `text-primary`                                                 | `gray/900`                                     | 본문 · 제목 · 금액                          |
| `text-secondary`                                               | `gray/600`                                     | 보조 설명 · 라벨                            |
| `text-tertiary`                                                | `gray/400`                                     | 플레이스홀더 · 계좌번호                     |
| `text-disabled`                                                | `gray/300`                                     | 비활성 텍스트                               |
| `text-inverse`                                                 | `white`                                        | Fill 버튼 · 토스트 위 텍스트                |
| `text-brand`                                                   | `blue/500`                                     | 링크 · Weak Primary 버튼 · 포커스 라벨      |
| `text-success`                                                 | `green/600`                                    | 입금 금액 · 완료                            |
| `text-warning`                                                 | `amber/600`                                    | 보류                                        |
| `text-danger`                                                  | `red/500`                                      | 오류 문구 · 차단                            |
| `border-default`                                               | `gray/200`                                     | 입력 테두리 · 행 구분선                     |
| `border-strong`                                                | `gray/300`                                     | 체크박스 · 시트 핸들 · 스위치 off           |
| `border-brand`                                                 | `blue/500`                                     | 포커스 테두리                               |
| `border-danger`                                                | `red/500`                                      | 오류 테두리                                 |
| `icon-primary`                                                 | `gray/900`                                     | 기본 아이콘                                 |
| `icon-secondary`                                               | `gray/500`                                     | 화살표 · 지우기                             |
| `icon-brand` / `icon-success` / `icon-danger` / `icon-inverse` | `blue/500` / `green/500` / `red/500` / `white` | 상태 아이콘                                 |

### 1.2 Typography

- 서체: `"Inter", "Pretendard", -apple-system, "Apple SD Gothic Neo", sans-serif`
- 숫자(금액·계좌번호): `font-variant-numeric: tabular-nums` — 자리수가 달라도 세로로 정렬된다
- 자간: 제목(h1 이상) `-0.02em`, 나머지 `0`

| 토큰          | 크기 / 굵기 / 행간 | 용도                             |
| ------------- | ------------------ | -------------------------------- |
| `display`     | 40px / 800 / 1.2   | 온보딩 등 큰 제목                |
| `h1`          | 22px / 800 / 1.25  | 화면 제목(Top) · 결과 제목       |
| `h2`          | 20px / 700 / 1.3   | 섹션 제목 · 시트·다이얼로그 제목 |
| `h3`          | 16px / 700 / 1.4   | 소제목 · 헤더 제목 · Line 입력값 |
| `body`        | 15px / 500 / 1.6   | 본문 · 행 제목 · 입력값          |
| `body-strong` | 15px / 600 / 1.6   | 버튼 · 탭 · 토스트               |
| `caption`     | 14px / 400 / 1.5   | 보조 설명 · 도움말 · 행 부제     |
| `small`       | 13px / 500 / 1.4   | 입력 라벨 · 배지 · 메타 정보     |
| `label`       | 12px / 500 / 1.4   | 팔레트 라벨 · 아주 작은 표기     |
| `amount`      | 20px / 700 / 1.3   | 행의 금액 (tabular)              |
| `amount-lg`   | 28px / 800 / 1.2   | 잔액 · 최종 금액 (tabular)       |
| `amount-xl`   | 32px / 800 / 1.2   | 금액 입력 hero (tabular)         |

### 1.3 Spacing · Layout

4px 기반.

| 토큰     | 값   | 용도                                     |
| -------- | ---- | ---------------------------------------- |
| `xs`     | 4px  | 라벨 ↔ 입력                              |
| `sm`     | 8px  | 버튼 사이 · 카드 안 행 사이              |
| `md`     | 16px | 화면 좌우 여백 · 컴포넌트 안 패딩        |
| `lg`     | 24px | 섹션 사이 · Top 위아래 · 다이얼로그 패딩 |
| `xl`     | 32px | 결과 화면 아이콘 ↔ 제목                  |
| `2xl`    | 48px | 결과 화면 위아래                         |
| `gutter` | 20px | 리스트 행 좌우(TDS 기준, 선택)           |

레이아웃

- 세로 구성: StatusBar 44 → Header 56 → (Top) → 콘텐츠 → BottomCTA(위 `sm`, 아래 `lg` + safe area)
- 좌우 여백 `md` → 콘텐츠 폭 **380px**
- 키보드·키패드가 열리면 BottomCTA는 그 위에 붙는다
- 스크롤 영역은 콘텐츠만. 헤더와 CTA는 고정

### 1.4 Radius · Elevation · Icon · Motion

| 종류      | 토큰    | 값                             | 용도                         |
| --------- | ------- | ------------------------------ | ---------------------------- |
| Radius    | `sm`    | 8px                            | 체크박스 · 작은 칩           |
|           | `md`    | 12px                           | 버튼 · 입력                  |
|           | `lg`    | 16px                           | 카드 · 다이얼로그 · 토스트   |
|           | `xl`    | 24px                           | 하단 시트 위쪽               |
|           | `full`  | 9999px                         | 배지 · 스위치 · 아이콘 버튼  |
| Elevation | `card`  | `0 1px 3px rgba(0,0,0,0.06)`   | 카드                         |
|           | `sheet` | `0 -4px 16px rgba(0,0,0,0.08)` | 하단 시트 · 하단 CTA         |
| Icon      | `sm`    | 16px                           | 토스트 · 배지 안             |
|           | `md`    | 24px                           | 헤더 · 행 우측 · 입력 지우기 |
|           | 터치    | 44px                           | 아이콘 버튼 최소 영역        |
| Motion    | `fast`  | 150ms ease-out                 | 버튼 pressed · 스위치        |
|           | `base`  | 250ms ease-out                 | 시트 · 토스트 등장           |
|           | `slow`  | 400ms ease-in-out              | 결과 화면 아이콘             |

## 2. Components

각 항목은 **구조 → 옵션 → 상태 → 규칙** 순서다. Figma 컴포넌트 이름·속성과 같다.

### Button

- 구조: 텍스트 하나. 높이 고정, 좌우 패딩 `md`, radius `md`, 텍스트 `body-strong`
- 옵션: `Variant` Fill / Weak · `Color` Primary / Dark / Danger · `Size` LG 52px / MD 44px / SM 36px

| Variant × Color | 배경             | 글자           |
| --------------- | ---------------- | -------------- |
| Fill Primary    | `bg-brand`       | `text-inverse` |
| Fill Dark       | `bg-dark`        | `text-inverse` |
| Fill Danger     | `bg-danger`      | `text-inverse` |
| Weak Primary    | `bg-brand-soft`  | `text-brand`   |
| Weak Dark       | `bg-tertiary`    | `text-primary` |
| Weak Danger     | `bg-danger-soft` | `text-danger`  |

- 상태: Default · Hover(`*-hover`) · Pressed(`*-pressed`, scale 0.98) · Disabled(opacity 0.4) · Loading(텍스트 대신 스피너, 폭 유지)
- 규칙: Fill Primary는 화면당 하나, 하단 CTA. Danger는 해지·삭제처럼 되돌리기 어려운 행동에만. LG는 폭 채움, MD/SM은 내용 폭

### TextButton · IconButton

- TextButton: 배경 없음 · `Color` Primary(`text-brand`) / Neutral(`text-secondary`) · `Size` MD 36px(`body-strong`) / SM 28px(`small`). 섹션 헤더 우측 "전체 보기", 카드 하단 보조 링크
- IconButton: 44×44 터치 영역 · 아이콘 24 · radius `full` · pressed `bg-pressed`. 헤더 우측, 입력 지우기

### TextField

- 구조: 라벨(`small`) → 필드(52px) → 도움말(`caption`), 세로 간격 `xs`
- 옵션: `Variant` Box(테두리 박스, radius `md`, 패딩 `md`) / Line(밑줄만, 값은 `h3`)
- 상태

| 상태     | 테두리               | 라벨             | 값                                  | 도움말                  |
| -------- | -------------------- | ---------------- | ----------------------------------- | ----------------------- |
| Default  | `border-default` 1px | `text-secondary` | 플레이스홀더 `text-tertiary`        | `text-secondary`        |
| Focused  | `border-brand` 2px   | `text-brand`     | 커서                                | 유지                    |
| Filled   | `border-default` 1px | `text-secondary` | `text-primary` + 지우기 ×           | 유지                    |
| Error    | `border-danger` 2px  | `text-danger`    | `text-primary` + 지우기 ×           | `text-danger` 오류 문구 |
| Disabled | `border-default` 1px | `text-secondary` | `text-disabled`, 배경 `bg-disabled` | 유지                    |

- 규칙: 오류 문구는 입력 아래 도움말 자리에, 무엇을 어떻게 고칠지 적는다("계좌번호 형식이 올바르지 않아요"). 접미(원, %)는 값 오른쪽 `text-secondary`

### AmountField

- 구조: 라벨(`small`) → 금액(`amount-xl`, 왼쪽 정렬, "원" 포함) → 도움말(잔액)
- 상태: Empty(`0원` `text-tertiary`) · Filled(`text-primary`) · Error(라벨·도움말 `text-danger`, "잔액이 부족해요 (잔액 350,000원)")
- 규칙: 콤마 자동, 소수 없음. 시스템 키보드 대신 Keypad. 한도 초과는 입력 중 즉시 Error

### Keypad

- 3×4, 키 높이 56, 배경 `bg-secondary`, 키 글자 `h2`. 마지막 행 `00` · `0` · `지움`
- 비밀번호 입력은 숫자 배열을 섞는다(보안 키패드)

### Checkbox · Switch

- Checkbox 24px radius `sm`: Checked `bg-brand` + 흰 체크 / Unchecked `border-strong` 1.5px. 약관 동의·다중 선택. 터치 영역은 행 전체
- Switch 48×28 radius `full`: On `bg-brand` / Off `border-strong`, 손잡이 24 흰색. 즉시 반영되는 설정(알림, 자동이체)에만. 저장 버튼이 따로 있으면 Checkbox

### Header · Top · Tab

- Header 56px: 좌 아이콘(`Type` Back ← / Close × / None) · 중앙 제목 `h3` · 우측 슬롯 24. Back은 이전 단계, Close는 흐름 종료(입력 중이면 Confirm Dialog)
- Top: 제목 `h1` + 부제 `caption`, 위아래 `lg`. 제목은 질문형으로 다음 행동을 안내
- Tab: `Size` LG 48px(`body-strong`) / SM 40px(`small`). 4개 이하 Fixed(폭 균등), 5개 이상 Fluid(가로 스크롤). 선택 = `text-primary` + 2px `bg-brand` 밑줄, 아래 `border-default` 1px

### Card · AccountCard

- Card: `bg-primary` · radius `lg` · 패딩 `md` · 그림자 `card` · 제목 `h3` + 본문 `body`, 행 간격 `sm`
- AccountCard: 패딩 `lg` · 계좌명 `body` `text-secondary` · 번호 `caption` `text-tertiary` · 잔액 `amount-lg` · 행동 2개(Weak "거래내역" + Fill "송금", MD, 1:1). 홈 상단의 주인공

### ListRow · TransactionRow

- ListRow 64px, 좌우 `md`: 좌 아이콘 40(`bg-brand-soft` 원) + 제목 `body` / 부제 `caption` · `Right` Arrow(› 이동) / Text(값 `amount`) / None. pressed `bg-pressed`
- TransactionRow 64px: 제목=상대방 `body`, 부제=일시 `caption`, 우측 금액 `amount`. `Type` Deposit `+1,250,000원` `text-success` / Withdrawal `-50,000원` `text-primary`. 행 사이 Divider Line
- 규칙: 한 행에 정보 3개까지(제목·부제·값). 더 필요하면 상세로

### Badge

- 24px · 좌우 `sm` · radius `full` · `small`
- `Status` Success(`bg-success-soft`/`text-success`) · Warning(`bg-warning-soft`/`text-warning`) · Danger(`bg-danger-soft`/`text-danger`) · Neutral(`bg-secondary`/`text-secondary`)
- 계좌: 정상 Success · 휴면 Warning · 해지 Neutral / 이체: 완료 Success · 보류 Warning · 차단·실패 Danger

### Divider · Skeleton

- Divider `Type` Line 1px `border-default`(행 사이) / Thick 8px `bg-secondary`(섹션 사이)
- Skeleton: 실제 콘텐츠와 같은 높이의 `bg-tertiary` 막대, radius 6, 1.2s shimmer. 목록은 행 3개까지만

### BottomCTA

- 화면 하단 고정. 좌우 `md`, 위 `sm`, 아래 `lg` + safe area, 배경 `bg-primary`
- `Type` Single(Fill Primary LG 폭 채움) / Double(Weak Dark "취소" + Fill Primary, 1:1, 간격 `sm`)
- 키보드·키패드·토스트는 CTA 위에 쌓인다. 스크롤 콘텐츠는 CTA 높이만큼 아래 여백

### BottomSheet

- 구조: 핸들(40×4 `border-strong`, 위아래 `sm`) → 제목 `h2`(패딩 `md`) → 내용 → BottomCTA
- `bg-primary`, 위쪽 radius `xl`, 뒤 `bg-dim`, 등장 `base` slide-up. 최대 높이 화면의 90%
- 규칙: 페이지를 떠나지 않는 선택·확인(출금 계좌 선택, 약관 보기). 선택지 3개 이상이면 Dialog 대신 시트

### Dialog

- 폭 328 · 가운데 · 패딩 `lg` · radius `lg` · 뒤 `bg-dim` · 제목 `h2` + 설명 `body` `text-secondary`, 버튼 MD
- `Type` Alert(확인 1개) / Confirm(Weak Dark 취소 + Fill Primary 확인, 1:1)
- 규칙: Confirm은 되돌리기 어려운 행동 직전에만("송금을 그만둘까요?"). 확인 버튼 문구는 행동 그대로("그만두기"), "예/아니오" 금지

### Toast

- 48px · 좌우 `md` · radius `lg` · `bg-dark` · 텍스트 `body-strong` `text-inverse` · 좌 아이콘 16(`Type` Default 없음 / Success 초록 / Error 빨강)
- BottomCTA 위 `md`, 3초 후 사라짐, 한 줄. 드래그로 닫기
- 규칙: 행동이 필요 없는 짧은 피드백만("계좌번호를 복사했어요"). 사용자가 결정해야 하면 Dialog

### Result

- 흐름 종료 화면 상단: 아이콘 72(원 `bg-success-soft`/`bg-danger-soft` + 점 32) → 제목 `h1` → 설명 `body` `text-secondary`, 가운데 정렬, 위아래 `2xl`
- `Type` Success / Failure. 아래에 요약 Card(받는 분·금액·일시) + BottomCTA("확인")

## 3. 패턴 — 송금 흐름

| 화면        | 구성                                                                                    | CTA                                 |
| ----------- | --------------------------------------------------------------------------------------- | ----------------------------------- |
| 송금 입력   | Header(Back) · Top "누구에게 보낼까요?" · TextField 계좌 · AmountField · Keypad         | Single "다음" (금액 0이면 Disabled) |
| 수취인 확인 | Header(Back) · Top "이 내용으로 보낼까요?" · Card(받는 분·계좌·금액·수수료)             | Double "취소" / "송금하기"          |
| 송금 결과   | Header(Close) · Result · Card 요약                                                      | Single "확인"                       |
| 오류        | 잔액 부족 → AmountField Error 즉시 · 한도 초과 → Dialog Alert · 서버 오류 → Toast Error | —                                   |

## 4. 표시 형식

| 항목      | 형식                                                                 |
| --------- | -------------------------------------------------------------------- |
| 금액      | `1,250,000원` — `Intl.NumberFormat('ko-KR')`, 소수 없음              |
| 입출금    | 입금 `+1,250,000원` `text-success` · 출금 `-50,000원` `text-primary` |
| 계좌번호  | `110-123-456789` — 하이픈 포함, 마스킹 없음(Phase 1)                 |
| 날짜·시각 | `2026.09.22 14:05`                                                   |
| 제목      | 질문형 — "누구에게 보낼까요?"                                        |
| 버튼      | 동사형 — "송금하기", "확인"                                          |
| 오류      | 원인 + 다음 행동 — "잔액이 부족해요. 금액을 다시 확인해 주세요"      |

## 5. Figma

Figma 파일 **bank-bank Design** 이 이 문서의 구현이다.

- 변수: `Primitives`(팔레트, 숨김) → `Color`(시맨틱) · `Spacing`(간격·radius·size). 값은 프리미티브만 고치면 전체가 따라온다
- 텍스트 스타일 12개 · 이펙트 `Shadow/Card`
- 페이지: Foundations(스와치·팔레트·타이포) · Components(2절 전부) · Screens(3절 흐름)
- 컴포넌트 속성 이름(`Variant` · `Color` · `Size` · `State` · `Type` · `Right`)은 이 문서와 같다
