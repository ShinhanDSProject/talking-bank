import type { ReactNode } from 'react'
import { NavLink } from 'react-router'

type AdminMenu = {
  to: string
  label: string
  icon: string
  end?: boolean
}

const adminMenus: AdminMenu[] = [
  { to: '/admin', label: '대시보드', icon: '▦', end: true },
  { to: '/admin/members', label: '회원 관리', icon: '♙' },
  { to: '/admin/accounts', label: '계좌 관리', icon: '▣' },
  { to: '/admin/transactions', label: '거래 관리', icon: '⇄' },
  { to: '/admin/fds', label: '이상 거래 관리', icon: '◇' },
  { to: '/admin/system', label: '시스템 상태', icon: '◉' },
]

export function AdminSidebar({ menus = adminMenus }: { menus?: AdminMenu[] }) {
  return (
    <aside className="admin-sidebar" aria-label="관리자 사이드바">
      <NavLink to="/admin" className="admin-logo">
        <span>t</span>
        <strong>talking-bank</strong>
        <small>ADMIN</small>
      </NavLink>
      <nav aria-label="관리자 메뉴">
        {menus.map((menu) => (
          <NavLink key={menu.to} to={menu.to} end={menu.end}>
            <span aria-hidden="true">{menu.icon}</span>
            {menu.label}
          </NavLink>
        ))}
      </nav>
      <div className="admin-sidebar__footer">
        <div className="admin-avatar">관리</div>
        <div>
          <strong>김관리</strong>
          <span>최고 관리자</span>
        </div>
        <button type="button" aria-label="관리자 계정 메뉴">
          ⋮
        </button>
      </div>
    </aside>
  )
}

export function AdminHeader() {
  return (
    <header className="admin-topbar">
      <div>
        <strong>관리자 센터</strong>
        <span>운영 현황을 한눈에 확인하세요.</span>
      </div>
      <div className="admin-topbar__actions">
        <button type="button" aria-label="알림">
          ♢<i />
        </button>
        <div className="admin-avatar">관리</div>
        <strong>김관리</strong>
      </div>
    </header>
  )
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="admin-shell">
      <AdminSidebar />
      <section className="admin-workspace">
        <AdminHeader />
        <main>{children}</main>
      </section>
    </div>
  )
}
