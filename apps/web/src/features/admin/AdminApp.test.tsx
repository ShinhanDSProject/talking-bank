import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { afterEach, describe, expect, it } from 'vitest'
import AdminApp from './AdminApp'

afterEach(cleanup)

describe('AdminApp', () => {
  it('관리자 대시보드의 핵심 지표와 메뉴를 보여준다', () => {
    render(
      <MemoryRouter initialEntries={['/admin']}>
        <AdminApp />
      </MemoryRouter>,
    )
    expect(screen.getByRole('heading', { name: '대시보드' })).toBeInTheDocument()
    expect(screen.getByText('전체 회원')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /이상 거래 관리/ })).toBeInTheDocument()
  })

  it('회원 관리 경로에서 회원 목록을 보여준다', () => {
    render(
      <MemoryRouter initialEntries={['/admin/members']}>
        <AdminApp />
      </MemoryRouter>,
    )
    expect(screen.getByRole('heading', { name: '회원 관리' })).toBeInTheDocument()
    expect(screen.getByText('jiwoo.kim@example.com')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: '상세 보기' })).toHaveLength(5)
  })

  it.each([
    ['/admin/login', '관리자 로그인'],
    ['/admin/login-error', '로그인할 수 없습니다'],
    ['/admin/forbidden', '이 화면에 접근할 권한이 없습니다'],
    ['/admin/session-expired', '관리자 세션이 만료되었습니다'],
  ])('%s 인증 화면을 보여준다', (path, title) => {
    render(
      <MemoryRouter initialEntries={[path]}>
        <AdminApp />
      </MemoryRouter>,
    )
    expect(screen.getByRole('heading', { name: title })).toBeInTheDocument()
    expect(screen.getByText('Talking BANK')).toBeInTheDocument()
  })
})
