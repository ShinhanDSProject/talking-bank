# DESIGN.md — 화면 규칙

> PRD가 "무엇을 만들지"를 정하듯, 이 파일은 "어떻게 보일지"를 정한다. Figma 변수, CSS 변수, AI 디자인 도구에 주는 프롬프트가 전부 이 값을 쓴다. 값을 바꾸면 여기를 먼저 고친다.

톤: **신뢰감 · 숫자 강조 · 장식 최소.** 흰 배경에 파랑 하나로 행동을 이끌고, 금액은 굵고 등폭으로.

## Colors

### Brand

| 토큰            | 값        | 용도                                 |
| --------------- | --------- | ------------------------------------ |
| `primary`       | `#4A90FF` | 주 버튼 · 링크 · 강조 금액           |
| `primary-hover` | `#2F7BF0` | 주 버튼 hover/active                 |
| `primary-soft`  | `#EBF3FF` | 보조 버튼 배경 · 정보 배지 · 강조 행 |

### Semantic

| 토큰      | 값        | 용도                    |
| --------- | --------- | ----------------------- |
| `success` | `#10B981` | 입금 · 완료             |
| `warning` | `#F59E0B` | 보류 · 추가 인증 필요   |
| `danger`  | `#EF4444` | 출금 강조 · 오류 · 차단 |

### Neutral

| 토큰             | 값        | 용도                         |
| ---------------- | --------- | ---------------------------- |
| `bg-primary`     | `#FFFFFF` | 페이지 · 카드                |
| `bg-secondary`   | `#F5F7FA` | 페이지 하단 영역 · 입력 배경 |
| `text-primary`   | `#1A202C` | 본문 · 제목                  |
| `text-secondary` | `#4A5568` | 보조 텍스트 · 라벨           |
| `text-inverse`   | `#FFFFFF` | 주 버튼 위 텍스트            |
| `border`         | `#E5E7EB` | 입력 테두리 · 구분선         |
| `dark`           | `#212121` | 어두운 버튼(선택)            |

## Typography

### Font Family

- sans: `"Inter", "Pretendard", -apple-system, "Apple SD Gothic Neo", sans-serif`
- 숫자(금액·계좌번호): 같은 서체에 `font-variant-numeric: tabular-nums` — 자리수가 달라도 세로로 정렬된다

### Scale

| 토큰          | 크기 / 굵기 / 행간 | 용도                       |
| ------------- | ------------------ | -------------------------- |
| `display`     | 40px / 800 / 1.2   | 온보딩 등 큰 제목          |
| `h1`          | 22px / 800 / 1.25  | 화면 제목                  |
| `h2`          | 20px / 700 / 1.3   | 섹션 제목 · 카드 제목      |
| `h3`          | 16px / 700 / 1.4   | 소제목                     |
| `body`        | 15px / 500 / 1.6   | 본문                       |
| `body-strong` | 15px / 600 / 1.6   | 버튼 · 강조 본문           |
| `caption`     | 14px / 400 / 1.5   | 보조 설명                  |
| `small`       | 13px / 500 / 1.4   | 배지 · 메타 정보           |
| `amount`      | 20px / 700 / 1.3   | 금액 (tabular)             |
| `amount-lg`   | 28px / 800 / 1.2   | 잔액 · 최종 금액 (tabular) |

## Spacing

4px 기반.

| 토큰  | 값   |
| ----- | ---- |
| `xs`  | 4px  |
| `sm`  | 8px  |
| `md`  | 16px |
| `lg`  | 24px |
| `xl`  | 32px |
| `2xl` | 48px |

### Radius

| 토큰   | 값     | 용도             |
| ------ | ------ | ---------------- |
| `sm`   | 8px    | 배지 · 작은 칩   |
| `md`   | 12px   | 버튼 · 입력      |
| `lg`   | 16px   | 카드 · 시트      |
| `full` | 9999px | 아바타 · 필 배지 |

### Shadow

- `card`: `0 1px 3px rgba(0,0,0,0.06)`

## Components

### Button

- 높이: `lg` 52px (화면 하단 주 버튼) · `md` 44px · `sm` 36px
- 패딩: 0 `md` · radius `md` · 텍스트 `body-strong`
- variants: `primary`(primary 배경 · text-inverse) · `secondary`(primary-soft 배경 · primary 텍스트) · `ghost`(투명 · primary 텍스트) · `danger`(danger 배경) · `dark`(dark 배경)
- 상태: default / hover / disabled(opacity 0.4)
- 화면 하단 주 버튼은 좌우 `md` 여백, 폭 채움

### Input

- 높이 52px · 테두리 1px `border` · radius `md` · 패딩 0 `md` · 배경 `bg-primary`
- focus: 테두리 2px `primary` · error: 테두리 2px `danger` + 아래 `caption` 오류 문구(danger)
- 라벨: `small` `text-secondary`, 입력 위 `xs` 간격
- 금액 입력: 오른쪽 정렬 · `amount` · 자동 콤마

### Card

- 배경 `bg-primary` · radius `lg` · 패딩 `md` · 그림자 `card`
- 제목 `h2` · 본문 `body` · 행 간격 `sm`

### ListRow (계좌 · 거래 행)

- 높이 64px 이상 · 좌: 제목 `body` + 부제 `caption` · 우: 금액 `amount`
- 입금 금액 `success`, 출금 금액 `text-primary` (`-` 부호), 강조 시 `danger`
- 행 구분선 `border`

### Badge

- 높이 24px · 패딩 0 `sm` · radius `full` · 텍스트 `small`
- 계좌 상태: 정상 `success-soft`, 휴면 `warning`, 해지 `text-secondary`
- 이체 상태: 완료 `success`, 보류 `warning`, 차단·실패 `danger`

### Header

- 높이 56px · 좌 뒤로가기 · 중앙 제목 `h3` · 배경 `bg-primary`

## 표시 형식

| 항목      | 형식                                                    |
| --------- | ------------------------------------------------------- |
| 금액      | `1,250,000원` — `Intl.NumberFormat('ko-KR')`, 소수 없음 |
| 계좌번호  | `110-123-456789` — 하이픈 포함, 마스킹 없음(Phase 1)    |
| 날짜·시각 | `2026.09.22 14:05`                                      |
| 버튼 문구 | 동사형으로 통일 — "송금하기", "확인하기"                |

## 화면 기준

- 플랫폼: 모바일 웹 우선 · 기준 프레임 **412 × 917**
- 상단 상태바 44px + Header 56px, 하단 주 버튼 영역 52px + 여백 `md`
- 좌우 여백 `md`(16px) → 콘텐츠 폭 380px
