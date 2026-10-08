import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { afterEach, describe, expect, it } from 'vitest'
import AdminApp from './AdminApp'

afterEach(cleanup)

describe('AdminApp', () => {
  it('관리자 대시보드의 핵심 지표와 메뉴를 보여준다', () => {
    render(
      <AdminTestRouter path="/admin" />,
    )
    expect(screen.getByRole('heading', { name: '관리자 Dashboard' })).toBeInTheDocument()
    expect(screen.getByText('전체 회원')).toBeInTheDocument()
    expect(screen.getByText('CPU')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '최근 거래' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '최근 이상거래' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /이상 거래 관리/ })).toBeInTheDocument()
  })

  it('회원 관리 경로에서 회원 검색과 상세 정보를 제공한다', async () => {
    const user = userEvent.setup()
    render(
      <AdminTestRouter path="/admin/members" />,
    )
    expect(screen.getByRole('heading', { name: '회원 관리' })).toBeInTheDocument()
    expect(screen.getByText('jiwoo.kim@example.com')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: '상세 보기' })).toHaveLength(5)
    expect(screen.getByRole('link', { name: /회원 관리/ })).toHaveAttribute('aria-current', 'page')

    await user.type(screen.getByRole('textbox', { name: '검색' }), '박서준')
    expect(screen.getByText('seojun.park@example.com')).toBeInTheDocument()
    expect(screen.queryByText('jiwoo.kim@example.com')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '상세 보기' }))
    expect(screen.getByRole('dialog', { name: '박서준 회원 정보' })).toBeInTheDocument()
    expect(screen.getByText('2026.10.08 13:52')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '회원 상세 닫기' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('계좌 관리 경로에서 계좌 검색과 거래 상세 정보를 제공한다', async () => {
    const user = userEvent.setup()
    render(<AdminTestRouter path="/admin/accounts" />)

    expect(screen.getByRole('heading', { name: '계좌 관리' })).toBeInTheDocument()
    expect(screen.getByText('110-482-938201')).toBeInTheDocument()

    await user.type(screen.getByRole('textbox', { name: '검색' }), '박서준')
    expect(screen.getByText('110-293-104857')).toBeInTheDocument()
    expect(screen.queryByText('110-482-938201')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '상세 보기' }))
    expect(screen.getByRole('dialog', { name: '110-293-104857 계좌 정보' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '최근 거래 내역' })).toBeInTheDocument()
    expect(screen.getByText('seojun.park@example.com')).toBeInTheDocument()
  })

  it('거래 관리 경로에서 거래를 필터링하고 실패 사유를 제공한다', async () => {
    const user = userEvent.setup()
    render(<AdminTestRouter path="/admin/transactions" />)

    expect(screen.getByRole('heading', { name: '거래 관리' })).toBeInTheDocument()
    expect(screen.getByText('TX-20261008-1842')).toBeInTheDocument()

    await user.selectOptions(screen.getByRole('combobox', { name: '거래 상태' }), '실패')
    expect(screen.getByText('TX-20261008-1839')).toBeInTheDocument()
    expect(screen.queryByText('TX-20261008-1842')).not.toBeInTheDocument()

    await user.type(screen.getByRole('textbox', { name: '검색' }), 'TX-20261008-1839')
    await user.click(screen.getByRole('button', { name: '상세 보기' }))
    expect(screen.getByRole('dialog', { name: 'TX-20261008-1839 거래 정보' })).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent('수취 계좌가 존재하지 않습니다.')
    expect(screen.getByText('FDS-2048')).toBeInTheDocument()
  })

  it('이상 거래 관리 경로에서 위험도를 필터링하고 원본 거래를 제공한다', async () => {
    const user = userEvent.setup()
    render(<AdminTestRouter path="/admin/fds" />)

    expect(screen.getByRole('heading', { name: '이상 거래 관리' })).toBeInTheDocument()
    expect(screen.getByText('TX-20261008-1839')).toBeInTheDocument()

    await user.selectOptions(screen.getByRole('combobox', { name: '위험도' }), 'MEDIUM')
    expect(screen.getByText('TX-20261008-1764')).toBeInTheDocument()
    expect(screen.queryByText('TX-20261008-1839')).not.toBeInTheDocument()

    await user.selectOptions(screen.getByRole('combobox', { name: '위험도' }), 'HIGH')
    await user.type(screen.getByRole('textbox', { name: '검색' }), 'FDS-2048')
    await user.click(screen.getByRole('button', { name: '상세 보기' }))
    const dialog = screen.getByRole('dialog', { name: 'FDS-2048 탐지 정보' })
    expect(dialog).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '원본 거래 정보' })).toBeInTheDocument()
    expect(within(dialog).getByText('단시간 고액 반복 송금')).toBeInTheDocument()
  })

  it.each([
    ['/admin/login', '관리자 로그인'],
    ['/admin/login-error', '로그인할 수 없습니다'],
    ['/admin/forbidden', '이 화면에 접근할 권한이 없습니다'],
    ['/admin/session-expired', '관리자 세션이 만료되었습니다'],
  ])('%s 인증 화면을 보여준다', (path, title) => {
    render(
      <AdminTestRouter path={path} />,
    )
    expect(screen.getByRole('heading', { name: title })).toBeInTheDocument()
    expect(screen.getByText('Talking BANK')).toBeInTheDocument()
    expect(screen.queryByLabelText('관리자 사이드바')).not.toBeInTheDocument()
  })
})

function AdminTestRouter({ path }: { path: string }) {
  return (
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/admin/*" element={<AdminApp />} />
      </Routes>
    </MemoryRouter>
  )
}
