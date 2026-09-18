import { screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { renderWithProviders } from '../../test-utils'
import AccountListPage from './AccountListPage'
import type { Account } from './api'

const accounts: Account[] = [
  {
    id: 1,
    accountNumber: '110-123-456789',
    ownerName: '조성민',
    productName: '주거래 입출금통장',
    balance: 1_250_000,
    currency: 'KRW',
    status: 'ACTIVE',
    openedAt: '2024-03-02',
  },
]

function mockFetchOnce(body: unknown, init?: { ok?: boolean; status?: number }) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: init?.ok ?? true,
      status: init?.status ?? 200,
      statusText: 'OK',
      json: async () => body,
    }),
  )
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('AccountListPage', () => {
  it('서버에서 받은 계좌를 표에 보여준다', async () => {
    mockFetchOnce(accounts)

    renderWithProviders(<AccountListPage />)

    expect(await screen.findByText('110-123-456789')).toBeInTheDocument()
    expect(screen.getByText('조성민')).toBeInTheDocument()
    expect(screen.getByText(/1,250,000 KRW/)).toBeInTheDocument()
    expect(screen.getByText('정상')).toBeInTheDocument()
    expect(vi.mocked(fetch)).toHaveBeenCalledWith(
      '/api/accounts',
      expect.objectContaining({ credentials: 'include' }),
    )
  })

  it('요청이 실패하면 오류 안내를 보여준다', async () => {
    mockFetchOnce(null, { ok: false, status: 500 })

    renderWithProviders(<AccountListPage />)

    expect(await screen.findByRole('alert')).toHaveTextContent('계좌를 불러오지 못했습니다')
  })

  it('계좌가 없으면 빈 목록 안내를 보여준다', async () => {
    mockFetchOnce([])

    renderWithProviders(<AccountListPage />)

    expect(await screen.findByText('등록된 계좌가 없습니다.')).toBeInTheDocument()
  })
})
