export type AccountStatus = '정상' | '휴면' | '해지'

export type AccountTransaction = {
  id: string
  at: string
  type: '입금' | '출금' | '송금'
  amount: number
  balanceAfter: number
}

export type AdminAccount = {
  id: string
  number: string
  owner: string
  memberId: string
  memberEmail: string
  product: string
  balance: number
  createdAt: string
  status: AccountStatus
  recentTransactions: AccountTransaction[]
}

export const accounts: AdminAccount[] = [
  { id: 'A-31204', number: '110-482-938201', owner: '김지우', memberId: 'U-24891', memberEmail: 'jiwoo.kim@example.com', product: '주거래 입출금통장', balance: 12_480_500, createdAt: '2024.03.12', status: '정상', recentTransactions: [{ id: 'TX-1842', at: '2026.10.08 14:32', type: '송금', amount: 350_000, balanceAfter: 12_480_500 }, { id: 'TX-1811', at: '2026.10.08 09:20', type: '입금', amount: 1_200_000, balanceAfter: 12_830_500 }] },
  { id: 'A-31203', number: '110-293-104857', owner: '박서준', memberId: 'U-24890', memberEmail: 'seojun.park@example.com', product: '신한 정기예금', balance: 50_000_000, createdAt: '2025.11.02', status: '정상', recentTransactions: [{ id: 'TX-1804', at: '2026.10.07 16:12', type: '입금', amount: 5_000_000, balanceAfter: 50_000_000 }] },
  { id: 'A-31202', number: '110-721-556092', owner: '이하은', memberId: 'U-24889', memberEmail: 'haeun.lee@example.com', product: '신한 주니어통장', balance: 820_400, createdAt: '2023.08.19', status: '휴면', recentTransactions: [] },
  { id: 'A-31201', number: '110-663-092145', owner: '최도윤', memberId: 'U-24888', memberEmail: 'doyun.choi@example.com', product: '주거래 입출금통장', balance: 0, createdAt: '2022.01.22', status: '해지', recentTransactions: [] },
  { id: 'A-31200', number: '110-105-882341', owner: '정수빈', memberId: 'U-24887', memberEmail: 'subin.jeong@example.com', product: '신한 마이홈적금', balance: 8_200_000, createdAt: '2026.02.14', status: '정상', recentTransactions: [{ id: 'TX-1798', at: '2026.10.06 12:02', type: '출금', amount: 100_000, balanceAfter: 8_200_000 }] },
]
