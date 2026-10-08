export type TransactionType = '송금' | '입금' | '출금' | '자동이체'
export type TransactionStatus = '성공' | '실패' | '처리 중'

export type AdminTransaction = {
  id: string
  occurredAt: string
  date: string
  sourceAccount: string
  destinationAccount: string
  sender: string
  senderMemberId: string
  recipient: string
  recipientMemberId: string
  amount: number
  type: TransactionType
  status: TransactionStatus
  failureReason?: string
  fdsCaseId?: string
}

export const transactions: AdminTransaction[] = [
  { id: 'TX-20261008-1842', occurredAt: '2026.10.08 14:32', date: '2026-10-08', sourceAccount: '110-482-938201', destinationAccount: '110-293-104857', sender: '김지우', senderMemberId: 'U-24891', recipient: '박서준', recipientMemberId: 'U-24890', amount: 350_000, type: '송금', status: '성공' },
  { id: 'TX-20261008-1841', occurredAt: '2026.10.08 14:28', date: '2026-10-08', sourceAccount: '-', destinationAccount: '110-105-882341', sender: '외부 계좌', senderMemberId: '-', recipient: '정수빈', recipientMemberId: 'U-24887', amount: 1_200_000, type: '입금', status: '성공' },
  { id: 'TX-20261008-1840', occurredAt: '2026.10.08 14:21', date: '2026-10-08', sourceAccount: '110-721-556092', destinationAccount: '-', sender: '이하은', senderMemberId: 'U-24889', recipient: '외부 계좌', recipientMemberId: '-', amount: 2_000_000, type: '출금', status: '처리 중' },
  { id: 'TX-20261008-1839', occurredAt: '2026.10.08 14:17', date: '2026-10-08', sourceAccount: '110-663-092145', destinationAccount: '110-999-000001', sender: '최도윤', senderMemberId: 'U-24888', recipient: '확인 불가', recipientMemberId: '-', amount: 9_800_000, type: '송금', status: '실패', failureReason: '수취 계좌가 존재하지 않습니다.', fdsCaseId: 'FDS-2048' },
  { id: 'TX-20261007-1812', occurredAt: '2026.10.07 09:10', date: '2026-10-07', sourceAccount: '110-293-104857', destinationAccount: '110-482-938201', sender: '박서준', senderMemberId: 'U-24890', recipient: '김지우', recipientMemberId: 'U-24891', amount: 100_000, type: '자동이체', status: '실패', failureReason: '출금 가능 잔액이 부족합니다.' },
]
