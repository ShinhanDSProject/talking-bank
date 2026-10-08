export type StatusTone = 'success' | 'warning' | 'danger' | 'neutral' | 'info'

export const dashboardStats = [
  { label: '전체 회원', value: '24,891', delta: '+4.8%', tone: 'info' as const },
  { label: '전체 계좌', value: '31,204', delta: '+3.2%', tone: 'success' as const },
  { label: '오늘 거래', value: '18,492', delta: '+12.5%', tone: 'success' as const },
  { label: '이상 거래', value: '28', delta: '확인 필요', tone: 'danger' as const },
]

export const members = [
  {
    id: 'U-24891',
    name: '김지우',
    email: 'jiwoo.kim@example.com',
    phone: '010-2458-1190',
    joined: '2026.10.08',
    status: '정상',
  },
  {
    id: 'U-24890',
    name: '박서준',
    email: 'seojun.park@example.com',
    phone: '010-9812-4431',
    joined: '2026.10.08',
    status: '정상',
  },
  {
    id: 'U-24889',
    name: '이하은',
    email: 'haeun.lee@example.com',
    phone: '010-3351-8820',
    joined: '2026.10.07',
    status: '잠김',
  },
  {
    id: 'U-24888',
    name: '최도윤',
    email: 'doyun.choi@example.com',
    phone: '010-6140-7725',
    joined: '2026.10.07',
    status: '탈퇴',
  },
  {
    id: 'U-24887',
    name: '정수빈',
    email: 'subin.jeong@example.com',
    phone: '010-5532-1078',
    joined: '2026.10.06',
    status: '정상',
  },
]

export const accounts = [
  {
    number: '110-482-938201',
    owner: '김지우',
    product: '주거래 입출금통장',
    balance: 12_480_500,
    opened: '2024.03.12',
    status: '정상',
  },
  {
    number: '110-293-104857',
    owner: '박서준',
    product: '쏠편한 정기예금',
    balance: 50_000_000,
    opened: '2025.11.02',
    status: '정상',
  },
  {
    number: '110-721-556092',
    owner: '이하은',
    product: '신한 주니어통장',
    balance: 820_400,
    opened: '2023.08.19',
    status: '휴면',
  },
  {
    number: '110-663-092145',
    owner: '최도윤',
    product: '주거래 입출금통장',
    balance: 0,
    opened: '2022.01.22',
    status: '해지',
  },
  {
    number: '110-105-882341',
    owner: '정수빈',
    product: '신한 마이홈 적금',
    balance: 8_200_000,
    opened: '2026.02.14',
    status: '정상',
  },
]

export const transactions = [
  {
    id: 'TX-20261008-1842',
    at: '2026.10.08 14:32',
    user: '김지우',
    type: '송금',
    amount: 350_000,
    target: '박서준',
    status: '완료',
  },
  {
    id: 'TX-20261008-1841',
    at: '2026.10.08 14:28',
    user: '정수빈',
    type: '입금',
    amount: 1_200_000,
    target: '-',
    status: '완료',
  },
  {
    id: 'TX-20261008-1840',
    at: '2026.10.08 14:21',
    user: '이하은',
    type: '출금',
    amount: 2_000_000,
    target: '-',
    status: '보류',
  },
  {
    id: 'TX-20261008-1839',
    at: '2026.10.08 14:17',
    user: '최도윤',
    type: '송금',
    amount: 9_800_000,
    target: '외부 계좌',
    status: '차단',
  },
  {
    id: 'TX-20261008-1838',
    at: '2026.10.08 14:05',
    user: '박서준',
    type: '출금',
    amount: 100_000,
    target: '-',
    status: '실패',
  },
]

export const fdsCases = [
  {
    id: 'FDS-2048',
    at: '2026.10.08 14:17',
    user: '최도윤',
    amount: 9_800_000,
    score: 94,
    reason: '단시간 내 고액 반복 송금',
    status: '차단',
  },
  {
    id: 'FDS-2047',
    at: '2026.10.08 13:52',
    user: '이하은',
    amount: 2_000_000,
    score: 81,
    reason: '평소와 다른 기기 및 지역',
    status: '검토 중',
  },
  {
    id: 'FDS-2046',
    at: '2026.10.08 12:40',
    user: '김지우',
    amount: 3_500_000,
    score: 67,
    reason: '신규 수취인 고액 송금',
    status: '확인 완료',
  },
  {
    id: 'FDS-2045',
    at: '2026.10.08 11:22',
    user: '정수빈',
    amount: 1_500_000,
    score: 58,
    reason: '비정상 접근 패턴',
    status: '확인 완료',
  },
]

export const statusTone = (status: string): StatusTone => {
  if (['정상', '완료', '확인 완료', '운영 중'].includes(status)) return 'success'
  if (['잠김', '휴면', '보류', '검토 중'].includes(status)) return 'warning'
  if (['차단', '실패', '장애'].includes(status)) return 'danger'
  return 'neutral'
}
