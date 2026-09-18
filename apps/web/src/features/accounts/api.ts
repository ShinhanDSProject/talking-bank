import { queryOptions } from '@tanstack/react-query'
import { apiFetch } from '../../lib/api'

export type AccountStatus = 'ACTIVE' | 'DORMANT' | 'CLOSED'

/** GET /api/accounts 응답 한 건. 서버의 AccountResponse와 모양을 맞춘다. */
export interface Account {
  id: number
  accountNumber: string
  ownerName: string
  productName: string
  balance: number
  currency: string
  status: AccountStatus
  openedAt: string
}

export const accountsQuery = queryOptions({
  queryKey: ['accounts'],
  queryFn: () => apiFetch<Account[]>('/api/accounts'),
})
