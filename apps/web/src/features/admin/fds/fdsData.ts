export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH'
export type FdsStatus = '검토 중' | '차단' | '정상 처리'

export type AdminFdsCase = {
  id: string
  transactionId: string
  occurredAt: string
  sender: string
  senderMemberId: string
  sourceAccount: string
  destinationAccount: string
  amount: number
  score: number
  riskLevel: RiskLevel
  reasons: string[]
  status: FdsStatus
  transactionType: string
}

export const fdsCases: AdminFdsCase[] = [
  { id: 'FDS-2048', transactionId: 'TX-20261008-1839', occurredAt: '2026.10.08 14:17', sender: '최도윤', senderMemberId: 'U-24888', sourceAccount: '110-663-092145', destinationAccount: '110-999-000001', amount: 9_800_000, score: 94, riskLevel: 'HIGH', reasons: ['단시간 고액 반복 송금', '신규 수취 계좌'], status: '차단', transactionType: '송금' },
  { id: 'FDS-2047', transactionId: 'TX-20261008-1827', occurredAt: '2026.10.08 13:52', sender: '이하은', senderMemberId: 'U-24889', sourceAccount: '110-721-556092', destinationAccount: '110-812-449201', amount: 2_000_000, score: 81, riskLevel: 'HIGH', reasons: ['평소와 다른 기기 및 지역'], status: '검토 중', transactionType: '송금' },
  { id: 'FDS-2046', transactionId: 'TX-20261008-1764', occurredAt: '2026.10.08 12:40', sender: '김지우', senderMemberId: 'U-24891', sourceAccount: '110-482-938201', destinationAccount: '110-221-550092', amount: 3_500_000, score: 67, riskLevel: 'MEDIUM', reasons: ['신규 수취인 고액 송금'], status: '정상 처리', transactionType: '송금' },
  { id: 'FDS-2045', transactionId: 'TX-20261008-1701', occurredAt: '2026.10.08 11:22', sender: '정수빈', senderMemberId: 'U-24887', sourceAccount: '110-105-882341', destinationAccount: '110-903-125040', amount: 1_500_000, score: 38, riskLevel: 'LOW', reasons: ['비정상 접근 패턴'], status: '정상 처리', transactionType: '자동이체' },
]
