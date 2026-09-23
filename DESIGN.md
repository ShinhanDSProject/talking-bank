# DESIGN.md — 디자인 시스템

> PRD가 "무엇을 만들지"를 정하듯, 이 파일은 "어떻게 보일지"를 정한다. Figma 변수, CSS 변수, AI 디자인 도구에 주는 프롬프트가 전부 이 값을 쓴다. 값을 바꾸면 여기를 먼저 고친다.

## 원칙

| 원칙                | 뜻                                                                     |
| ------------------- | ---------------------------------------------------------------------- |
| **숫자가 주인공**   | 잔액·금액은 화면에서 가장 크고 굵다. 장식은 숫자를 가리지 않는다       |
| **한 화면 한 행동** | 주 버튼(Fill)은 화면당 하나, 폼 하단에 둔다                            |
| **파랑 하나로**     | 브랜드 색은 신한 블루 `#0046FF` 하나. 행동을 이끄는 곳에만 쓴다        |
| **말은 짧게**       | 제목은 질문형("누구에게 보낼까요?"), 버튼은 동사형("송금하기"), 존댓말 |

**웹사이트**다. 기준 프레임 **1440 × 1024**(데스크톱), 콘텐츠 최대 폭 1200, 768 미만은 한 열로 접힌다. 서체는 Inter(숫자·영문) + Pretendard(한글 대체).

정보구조·절차(메뉴 체계, 이체 3단계, 조회 조건, 비밀번호 확인)는 **기존 은행 인터넷뱅킹**을 따르고, 색·컴포넌트·말투는 이 문서를 따른다.

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

| 토큰                                                           | 값                                             | 용도                                          |
| -------------------------------------------------------------- | ---------------------------------------------- | --------------------------------------------- |
| `bg-primary`                                                   | `white`                                        | 카드 · 표 · 다이얼로그 · GNB                  |
| `bg-secondary`                                                 | `gray/50`                                      | 페이지 배경 · 표 머리글                       |
| `bg-tertiary`                                                  | `gray/100`                                     | Weak Dark 버튼 · 스켈레톤                     |
| `bg-pressed`                                                   | `gray/100`                                     | 행 hover · 누르는 동안                        |
| `bg-disabled`                                                  | `gray/100`                                     | 비활성 입력                                   |
| `bg-brand`                                                     | `blue/500`                                     | 주 버튼 · 선택 표시 · 스위치 on               |
| `bg-brand-hover`                                               | `blue/600`                                     | 주 버튼 hover                                 |
| `bg-brand-pressed`                                             | `blue/700`                                     | 주 버튼 누르는 동안                           |
| `bg-brand-soft`                                                | `blue/50`                                      | Weak Primary 버튼 · 현재 페이지 · 아이콘 배경 |
| `bg-dark`                                                      | `gray/800`                                     | 토스트 · Dark 버튼                            |
| `bg-dark-hover`                                                | `gray/900`                                     | Dark 버튼 hover                               |
| `bg-danger`                                                    | `red/500`                                      | Danger 버튼                                   |
| `bg-danger-hover`                                              | `red/600`                                      | Danger 버튼 hover                             |
| `bg-success-soft`                                              | `green/50`                                     | 완료 배지 · 성공 아이콘 배경                  |
| `bg-warning-soft`                                              | `amber/50`                                     | 보류 배지                                     |
| `bg-danger-soft`                                               | `red/50`                                       | 차단 배지 · 실패 아이콘 배경                  |
| `bg-dim`                                                       | `overlay/dim`                                  | 다이얼로그 뒤 배경                            |
| `text-primary`                                                 | `gray/900`                                     | 본문 · 제목 · 금액                            |
| `text-secondary`                                               | `gray/600`                                     | 보조 설명 · 라벨 · 비활성 메뉴                |
| `text-tertiary`                                                | `gray/400`                                     | 플레이스홀더 · 계좌번호                       |
| `text-disabled`                                                | `gray/300`                                     | 비활성 텍스트                                 |
| `text-inverse`                                                 | `white`                                        | Fill 버튼 · 토스트 위 텍스트                  |
| `text-brand`                                                   | `blue/500`                                     | 로고 · 링크 · Weak Primary 버튼 · 포커스 라벨 |
| `text-success`                                                 | `green/600`                                    | 입금 금액 · 완료                              |
| `text-warning`                                                 | `amber/600`                                    | 보류                                          |
| `text-danger`                                                  | `red/500`                                      | 오류 문구 · 차단                              |
| `border-default`                                               | `gray/200`                                     | 입력 테두리 · 행 구분선 · GNB 아래선          |
| `border-strong`                                                | `gray/300`                                     | 체크박스 · 스위치 off                         |
| `border-brand`                                                 | `blue/500`                                     | 포커스 테두리                                 |
| `border-danger`                                                | `red/500`                                      | 오류 테두리                                   |
| `icon-primary`                                                 | `gray/900`                                     | 기본 아이콘                                   |
| `icon-secondary`                                               | `gray/500`                                     | 화살표 · 지우기                               |
| `icon-brand` / `icon-success` / `icon-danger` / `icon-inverse` | `blue/500` / `green/500` / `red/500` / `white` | 상태 아이콘                                   |

### 1.2 Typography

- 서체: `"Inter", "Pretendard", -apple-system, "Apple SD Gothic Neo", sans-serif`
- 숫자(금액·계좌번호): `font-variant-numeric: tabular-nums` — 자리수가 달라도 세로로 정렬된다
- 자간: 제목(h1 이상) `-0.02em`, 나머지 `0`

| 토큰          | 크기 / 굵기 / 행간 | 용도                                       |
| ------------- | ------------------ | ------------------------------------------ |
| `display`     | 40px / 800 / 1.2   | 랜딩 · 온보딩 큰 제목                      |
| `h1`          | 22px / 800 / 1.25  | 페이지 제목(PageHeader) · 결과 제목        |
| `h2`          | 20px / 700 / 1.3   | 로고 · 섹션 제목 · 다이얼로그 제목         |
| `h3`          | 16px / 700 / 1.4   | 소제목 · Line 입력값                       |
| `body`        | 15px / 500 / 1.6   | 본문 · 행 제목 · 입력값 · 표 셀            |
| `body-strong` | 15px / 600 / 1.6   | 버튼 · 메뉴 · 탭 · 토스트 · 표 금액        |
| `caption`     | 14px / 400 / 1.5   | 보조 설명 · 도움말 · 행 부제               |
| `small`       | 13px / 500 / 1.4   | 입력 라벨 · 배지 · 표 머리글 · 페이지 번호 |
| `label`       | 12px / 500 / 1.4   | 팔레트 라벨 · 아주 작은 표기               |
| `amount`      | 20px / 700 / 1.3   | 행의 금액 · 금액 입력값 (tabular)          |
| `amount-lg`   | 28px / 800 / 1.2   | 잔액 · 최종 금액 (tabular)                 |
| `amount-xl`   | 32px / 800 / 1.2   | 총 자산 등 hero 숫자 (tabular)             |

### 1.3 Spacing · Layout

4px 기반.

| 토큰  | 값   | 용도                                          |
| ----- | ---- | --------------------------------------------- |
| `xs`  | 4px  | 라벨 ↔ 입력 · 페이지 번호 사이                |
| `sm`  | 8px  | 버튼 사이 · 카드 안 행 사이                   |
| `md`  | 16px | 컴포넌트 안 패딩 · 표 셀 사이                 |
| `lg`  | 24px | 섹션 사이 · 폼 요소 사이 · 표 좌우            |
| `xl`  | 32px | 폼 카드 패딩 · GNB 메뉴 사이 · FormActions 위 |
| `2xl` | 48px | 페이지 위아래 · 로고 ↔ 메뉴                   |

레이아웃

| 브레이크포인트 | 폭         | 구성                                                          |
| -------------- | ---------- | ------------------------------------------------------------- |
| `desktop`      | ≥ 1024px   | GNB 64 → 페이지(위아래 `2xl`) → 컨테이너 1200 가운데 → Footer |
| `tablet`       | 768 ~ 1023 | 컨테이너 폭 100% − 좌우 `lg`, LNB는 드롭다운, 카드 2열 → 1열  |
| `mobile`       | < 768      | 좌우 `md`, 모든 열이 한 열, 표는 목록(TransactionRow)으로     |

- 컨테이너 1200 = **LNB 220 + 간격 `xl` + 콘텐츠 948**. 로그인처럼 LNB가 없는 페이지는 콘텐츠를 가운데 둔다
- 콘텐츠 세로 순서: Breadcrumb → PageHeader → (StepIndicator) → 본체 → Notice
- 페이지 배경 `bg-secondary`, 그 위에 흰 카드(`bg-primary`, radius `lg`, 그림자 `card`)
- 폼(이체·가입)은 **폼 카드 560px**, 콘텐츠 왼쪽 정렬. 안쪽 패딩 `xl`, 요소 간격 `lg`
- 표·조회 조건은 콘텐츠 폭 948을 채운다
- 스크롤은 페이지 전체. GNB는 상단 고정

### 1.4 Radius · Elevation · Icon · Motion

| 종류      | 토큰    | 값                            | 용도                            |
| --------- | ------- | ----------------------------- | ------------------------------- |
| Radius    | `sm`    | 8px                           | 체크박스 · 페이지 번호 칸       |
|           | `md`    | 12px                          | 버튼 · 입력                     |
|           | `lg`    | 16px                          | 카드 · 표 · 다이얼로그 · 토스트 |
|           | `xl`    | 24px                          | 큰 프로모션 카드                |
|           | `full`  | 9999px                        | 배지 · 스위치 · 아이콘 버튼     |
| Elevation | `card`  | `0 1px 3px rgba(0,0,0,0.06)`  | 카드                            |
|           | `modal` | `0 8px 24px rgba(0,0,0,0.12)` | 다이얼로그 · 드롭다운           |
| Icon      | `sm`    | 16px                          | 토스트 · 배지 안                |
|           | `md`    | 24px                          | 행 우측 · 입력 지우기           |
|           | 터치    | 44px                          | 아이콘 버튼 최소 영역           |
| Motion    | `fast`  | 150ms ease-out                | 버튼 hover/pressed · 스위치     |
|           | `base`  | 250ms ease-out                | 다이얼로그 · 토스트 등장        |
|           | `slow`  | 400ms ease-in-out             | 결과 화면 아이콘                |

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

- 상태: Default · Hover(`*-hover`) · Pressed(`*-pressed`, scale 0.98) · Disabled(opacity 0.4) · Loading(텍스트 대신 스피너, 폭 유지) · Focus(`border-brand` 2px 아웃라인, 키보드만)
- 규칙: Fill Primary는 화면당 하나, 폼 하단 FormActions. Danger는 해지·삭제처럼 되돌리기 어려운 행동에만. LG는 폼 폭 채움, MD/SM은 내용 폭

### TextButton · IconButton

- TextButton: 배경 없음 · `Color` Primary(`text-brand`) / Neutral(`text-secondary`) · `Size` MD 36px(`body-strong`) / SM 28px(`small`). 섹션 헤더 우측 "전체 보기", GNB "로그아웃", 카드 하단 보조 링크. hover 밑줄
- IconButton: 44×44 터치 영역 · 아이콘 24 · radius `full` · hover `bg-pressed`. 입력 지우기, 표 행 메뉴

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

- 규칙: 오류 문구는 입력 아래 도움말 자리에, 무엇을 어떻게 고칠지 적는다("계좌번호 형식이 올바르지 않아요"). 접미(원, %)는 값 오른쪽 `text-secondary`. 폼 안에서는 폭 채움

### AmountField

- 구조: 라벨(`small`) → 필드(52px, 값 오른쪽 정렬 `amount` + 접미 "원" `body` `text-secondary`) → 도움말(잔액)
- 상태: Empty(`0` `text-tertiary`) · Filled(`text-primary`) · Error(`border-danger` 2px, 라벨·도움말 `text-danger`, "잔액이 부족해요 (잔액 350,000원)") · Disabled
- 규칙: 콤마 자동, 소수 없음. 잔액·한도 초과는 입력 중 즉시 Error. 필드 아래 Chip 행(+1만 · +10만 · +100만 · 전액)으로 더한다

### Select · PinField

- Select 52px: TextField Box와 같은 틀 + 우측 chevron 24 `icon-secondary`. `State` Default(플레이스홀더) / Filled / Error / Disabled. 열리면 아래 목록(ListRow 44px, 최대 6개 스크롤, 선택 항목 `bg-brand-soft`). 출금계좌는 "계좌명 계좌번호 (잔액 n원)" 한 줄, 입금은행은 은행명, 조회 조건은 거래구분·정렬
- PinField: 라벨 → 칸 4개(56×52, 간격 `sm`, radius `md`) → 도움말. `State` Empty / Filled(칸마다 ● `body-strong`) / Error(`border-danger` 2px, "비밀번호가 맞지 않아요 (2/5회)"). 이체 확인 단계에서 이체 비밀번호. 5회 오류 잠금은 Dialog Alert

### Notice · FilterBar

- Notice: `bg-secondary` · radius `md` · 패딩 `md` · 줄마다 "※ " + `caption` `text-secondary`. 폼·표 아래, 한 상자 3줄까지. 한도·수수료·되돌리기 어려움 같은 사실만 적는다
- FilterBar(콘텐츠 폭): `bg-secondary` · radius `lg` · 패딩 `lg`. 1행 조회기간 Chip 5개 + 시작 ~ 종료 날짜(TextField 150), 2행 거래구분 Select 160 · 정렬 Select 160 · 우측 "조회" Button MD. 기본값 1개월 · 전체 · 최신순

### Checkbox · Switch

- Checkbox 24px radius `sm`: Checked `bg-brand` + 흰 체크 / Unchecked `border-strong` 1.5px. 약관 동의·표 행 선택. 클릭 영역은 라벨까지
- Switch 48×28 radius `full`: On `bg-brand` / Off `border-strong`, 손잡이 24 흰색. 즉시 반영되는 설정(알림, 자동이체)에만. 저장 버튼이 따로 있으면 Checkbox

### GNB · LNB · Breadcrumb · PageHeader · Footer

- GNB 64px, 아래 `border-default` 1px, 상단 고정: 로고 `h2` `text-brand` · 1depth 메뉴 8개(`body-strong`, 현재 `text-primary`, 나머지 `text-secondary`) · 우측 "인증센터" "고객센터" TextButton SM + 사용자명 + "로그아웃". `State` Open = hover 시 **메가메뉴**(컨테이너 폭, 1depth마다 한 열, 2depth `caption`, 아래 radius `lg`, 그림자 `modal`). 768 미만은 햄버거
- LNB 220px: 머리글(1depth `h3`, 아래 선) + 2depth 항목 44px `body`. 현재 항목 `bg-brand-soft` + `text-brand` `body-strong`, hover `bg-pressed`. 카드 모양(radius `lg`, 그림자 `card`)
- Breadcrumb: `small`, "홈 › 1depth › 2depth", 구분자 `text-tertiary`, 마지막만 `text-primary`. PageHeader 위 `sm`
- PageHeader: 제목 `h1` + 부제 `caption`, 우측 슬롯(보조 버튼). 콘텐츠 폭, 아래 `lg`
- Footer: 위 `border-default` 1px, 위아래 `lg`. 링크(이용약관 · 개인정보처리방침 · 보안센터 · 고객센터 1599-8000 · 사이트맵) `small` `text-secondary` + 저작권 `label` `text-tertiary`

### Tab · StepIndicator · Pagination · Chip

- Tab: `Size` LG 48px(`body-strong`) / SM 40px(`small`). 선택 = `text-primary` + 2px `bg-brand` 밑줄, 아래 `border-default` 1px. 4개 이하 폭 균등
- StepIndicator: `Step` 1 / 2 / 3 = 입력 → 확인 → 완료. 원 28 + 라벨, 사이 선 1px. 현재 `bg-brand`/`text-inverse` + 라벨 `body-strong`, 지난 단계 `bg-brand-soft`/`text-brand` + 선 `bg-brand`, 다음 단계 `bg-tertiary`/`text-secondary`. 폼 카드 맨 위
- Pagination: 32px 칸, 간격 `xs`, 현재 `bg-brand-soft`/`text-brand`, 나머지 `text-secondary`. 표 아래 가운데. 한 페이지 20행
- Chip 32px: 좌우 `md`, radius `full`, `small`. `State` Default(`bg-primary` + `border-default`) / Selected(`bg-brand-soft` + `border-brand` + `text-brand`). 금액 단위(+1만 · +10만 · +100만 · 전액), 조회기간(오늘 · 1주일 · 1개월 · 3개월 · 직접입력)

### Card · AccountCard

- Card: `bg-primary` · radius `lg` · 패딩 `md` · 그림자 `card` · 제목 `h3` + 본문 `body`, 행 간격 `sm`
- AccountCard: 패딩 `lg` · 계좌명 `body` `text-secondary` · 번호 `caption` `text-tertiary` · 잔액 `amount-lg` · 행동 2개(Weak "거래내역" + Fill "송금", MD, 1:1). 홈에서 2열, 768 미만 1열
- 폼 카드: 폭 560 · 패딩 `xl` · 요소 간격 `lg`. 입력·확인·결과 화면의 본체

### AccountTable · Table · ListRow · TransactionRow

- AccountTable(콘텐츠 폭): 머리글 44px · 행 60px. 열: 계좌명(나머지) · 계좌번호 180 `text-secondary` · 잔액 160(우, `body-strong`) · 출금가능금액 160(우) · 관리 150("거래내역" Neutral · "이체" Primary TextButton SM). 계좌 종류별 섹션은 Divider Thick
- Table(컨테이너 폭): 머리글 44px `bg-secondary` `small` `text-secondary` · 행 52px · 좌우 `lg` · 행 사이 `border-default` 1px · 바깥 radius `lg` + 테두리. 열: 일시 200 · 내용(나머지) · 구분 120 · 금액 200(우) · 잔액 200(우). 금액 열 `body-strong` tabular, 입금 `text-success`. 행 hover `bg-pressed`, 빈 상태는 가운데 `caption` "거래가 없어요"
- ListRow 64px, 좌우 `md`: 좌 아이콘 40(`bg-brand-soft` 원) + 제목 `body` / 부제 `caption` · `Right` Arrow(› 이동) / Text(값) / None. 확인·결과 화면의 요약 행(아이콘·부제 숨김, 제목 `text-secondary`, 값 `body-strong`)과 설정 메뉴에 쓴다
- TransactionRow 64px: 768 미만에서 Table 대신. 제목=상대방, 부제=일시, 우측 금액 `amount` — `Type` Deposit `+1,250,000원` `text-success` / Withdrawal `-50,000원` `text-primary`
- 규칙: 한 행에 정보 3개까지. 더 필요하면 상세로

### Badge

- 24px · 좌우 `sm` · radius `full` · `small`
- `Status` Success(`bg-success-soft`/`text-success`) · Warning(`bg-warning-soft`/`text-warning`) · Danger(`bg-danger-soft`/`text-danger`) · Neutral(`bg-secondary`/`text-secondary`)
- 계좌: 정상 Success · 휴면 Warning · 해지 Neutral / 이체: 완료 Success · 보류 Warning · 차단·실패 Danger

### Divider · Skeleton

- Divider `Type` Line 1px `border-default`(행 사이) / Thick 8px `bg-secondary`(섹션 사이, 모바일)
- Skeleton: 실제 콘텐츠와 같은 높이의 `bg-tertiary` 막대, radius 6, 1.2s shimmer. 표는 행 5개까지만

### FormActions

- 폼 카드 하단, 위 `xl` 간격, 폼 폭 채움
- `Type` Single(Fill Primary LG) / Double(Weak Dark "취소" + Fill Primary, 1:1, 간격 `sm`)
- 규칙: 확인 버튼은 항상 오른쪽. 취소는 입력값이 있으면 Confirm Dialog를 거친다. Enter = 확인. 확인 단계의 왼쪽 버튼은 "이전"(입력값 유지)

### Dialog

- 폭 480 · 화면 가운데 · 패딩 `lg` · radius `lg` · 그림자 `modal` · 뒤 `bg-dim` · 제목 `h2` + 설명 `body` `text-secondary`, 버튼 MD
- `Type` Alert(확인 1개) / Confirm(Weak Dark 취소 + Fill Primary 확인, 1:1)
- 규칙: Confirm은 되돌리기 어려운 행동 직전에만("송금을 그만둘까요?"). 확인 버튼 문구는 행동 그대로("그만두기"), "예/아니오" 금지. Esc = 취소, 열리면 포커스는 다이얼로그 안에 갇힌다. 선택지가 3개 이상이면 별도 페이지

### Toast

- 48px · 좌우 `md` · radius `lg` · `bg-dark` · 텍스트 `body-strong` `text-inverse` · 좌 아이콘 16(`Type` Default 없음 / Success 초록 / Error 빨강)
- 화면 오른쪽 위(GNB 아래 `lg`, 우측 `lg`), 3초 후 사라짐, 한 줄. 여러 개면 아래로 쌓인다
- 규칙: 행동이 필요 없는 짧은 피드백만("계좌번호를 복사했어요"). 사용자가 결정해야 하면 Dialog

### Result

- 흐름 종료 화면 상단: 아이콘 72(원 `bg-success-soft`/`bg-danger-soft` + 점 32) → 제목 `h1` → 설명 `body` `text-secondary`, 가운데 정렬, 위아래 `2xl`
- `Type` Success / Failure. 같은 폼 카드 안에 요약 행(받는 분·금액·일시) + FormActions("확인")

## 3. 정보구조 · 화면 패턴

### 정보구조

GNB 1depth는 Phase(도메인)와 같다. LNB·메가메뉴의 2depth는 아래 표가 주인이고, 화면 이름은 PRD가 주인이다.

| 1depth   | 2depth                                     | Phase         |
| -------- | ------------------------------------------ | ------------- |
| 조회     | 전체계좌조회 · 거래내역조회 · 이체결과조회 | 1             |
| 이체     | 계좌이체 · 수취인 별칭                     | 1 · 2         |
| 뱅킹관리 | 이체 비밀번호 변경 · 알림 설정             | 1 (향후)      |
| 관리자   | AI 비서 대시보드                           | 2 · `ADMIN`만 |

AI 비서는 메뉴가 아니라 **모든 페이지의 우하단 버튼 → 우측 패널**이다(Phase 2). 패널 · 답변 카드 · 되읽기 · 음성 상태 컴포넌트는 Phase 2 착수 때 2절에 보탠다.

향후 확장 후보(예금·대출 · 오픈뱅킹 · 카드 · 증권 · 보험)는 GNB에 두지 않는다. 착수할 때 1depth를 추가한다.

### 화면 패턴

모든 페이지: GNB → Breadcrumb → LNB + 콘텐츠(PageHeader → 본체 → Notice) → Footer. 로그인만 LNB 없이 가운데 카드.

| 화면                | 본체                                                                                                                                                        | FormActions                                             |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| 로그인              | 카드 480 가운데: Tab(아이디 · 인증서) · TextField 아이디 · 비밀번호 · Checkbox 아이디 저장                                                                  | Single "로그인" + "회원가입" · "아이디 찾기" TextButton |
| 조회 › 전체계좌조회 | AccountTable · Notice                                                                                                                                       | —                                                       |
| 조회 › 거래내역조회 | FilterBar · Table · Pagination                                                                                                                              | —                                                       |
| 이체 › 1단계 입력   | StepIndicator 1 · Select 출금계좌 · Select 입금은행 · TextField 계좌번호 · AmountField + Chip · TextField 받는 분 통장표시 · Notice                         | Double "취소" / "다음" (금액 0이면 Disabled)            |
| 이체 › 2단계 확인   | StepIndicator 2 · 금액 `amount-lg` · 요약 행(출금계좌 · 받는 분 · 입금계좌 · 수수료) · PinField                                                             | Double "이전" / "이체 실행"                             |
| 이체 › 3단계 완료   | StepIndicator 3 · Result · 요약 행(받는 분 · 금액 · 일시 · 거래번호) · "이체확인증 인쇄" TextButton                                                         | Double "계좌조회" / "추가 이체"                         |
| 상태                | 잔액 부족 → AmountField Error 즉시 · 취소 → Confirm Dialog · 비밀번호 오류 → PinField Error · 서버 오류 → Toast Error · 실패 → Result Failure + "다시 입력" | —                                                       |

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

Figma 파일 **talking-bank Design** 이 이 문서의 구현이다.

- 변수: `Primitives`(팔레트, 숨김) → `Color`(시맨틱) · `Spacing`(간격·radius·size·bp). 값은 프리미티브만 고치면 전체가 따라온다
- 텍스트 스타일 12개 · 이펙트 `Shadow/Card`
- 페이지: Foundations(스와치·팔레트·타이포) · Components(2절 전부) · Screens(3절 흐름, 1440 × 900)
- 컴포넌트 속성 이름(`Variant` · `Color` · `Size` · `State` · `Type` · `Right`)은 이 문서와 같다
