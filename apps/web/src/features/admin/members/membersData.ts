export type MemberStatus = '정상' | '정지' | '탈퇴'

export type AdminMember = {
  id: string
  name: string
  email: string
  phone: string
  joinedAt: string
  status: MemberStatus
  accountCount: number
  lastLoginAt: string
}

export const members: AdminMember[] = [
  { id: 'U-24891', name: '김지우', email: 'jiwoo.kim@example.com', phone: '010-2458-1190', joinedAt: '2026.10.08', status: '정상', accountCount: 2, lastLoginAt: '2026.10.08 14:31' },
  { id: 'U-24890', name: '박서준', email: 'seojun.park@example.com', phone: '010-9812-4431', joinedAt: '2026.10.08', status: '정상', accountCount: 1, lastLoginAt: '2026.10.08 13:52' },
  { id: 'U-24889', name: '이하은', email: 'haeun.lee@example.com', phone: '010-3351-8820', joinedAt: '2026.10.07', status: '정지', accountCount: 1, lastLoginAt: '2026.10.07 18:20' },
  { id: 'U-24888', name: '최도윤', email: 'doyun.choi@example.com', phone: '010-6140-7725', joinedAt: '2026.10.07', status: '탈퇴', accountCount: 0, lastLoginAt: '2026.10.07 09:14' },
  { id: 'U-24887', name: '정수빈', email: 'subin.jeong@example.com', phone: '010-5532-1078', joinedAt: '2026.10.06', status: '정상', accountCount: 3, lastLoginAt: '2026.10.08 11:07' },
]
