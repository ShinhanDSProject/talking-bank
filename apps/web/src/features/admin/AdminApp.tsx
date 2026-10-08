import { Navigate, Route, Routes, useLocation } from 'react-router'
import AdminAccountsPage from './accounts/AdminAccountsPage'
import AdminAuthPage from './AdminAuthPage'
import AdminDashboardPage from './dashboard/AdminDashboardPage'
import AdminFdsPage from './fds/AdminFdsPage'
import AdminLayout from './AdminLayout'
import AdminMembersPage from './members/AdminMembersPage'
import AdminTransactionsPage from './transactions/AdminTransactionsPage'
import { Badge, DataTable, PageHeader } from './components'
import './admin.css'

export default function AdminApp() {
  const { pathname } = useLocation()
  const authPaths = [
    '/admin/login',
    '/admin/login-error',
    '/admin/forbidden',
    '/admin/session-expired',
  ]

  if (authPaths.includes(pathname)) return <AdminAuthPage />

  return (
    <AdminLayout>
      <Routes>
        <Route index element={<AdminDashboardPage />} />
        <Route path="members" element={<AdminMembersPage />} />
        <Route path="accounts" element={<AdminAccountsPage />} />
        <Route path="transactions" element={<AdminTransactionsPage />} />
        <Route path="fds" element={<AdminFdsPage />} />
        <Route path="system" element={<System />} />
        <Route path="*" element={<Navigate to="." replace />} />
      </Routes>
    </AdminLayout>
  )
}

function System() {
  const resources = [
    { label: 'CPU 사용률', value: 38, detail: '8 Core · 정상' },
    { label: 'Memory 사용률', value: 64, detail: '10.2 / 16 GB' },
    { label: 'Disk 사용률', value: 47, detail: '235 / 500 GB' },
  ]
  return (
    <>
      <PageHeader
        eyebrow="SYSTEM HEALTH"
        title="시스템 상태"
        description="서비스 인프라의 성능과 가용성을 실시간으로 확인합니다."
        action={
          <button className="admin-button" type="button">
            ↻ 새로고침
          </button>
        }
      />
      <section className="system-grid">
        {resources.map((r) => (
          <article className="admin-card resource-card" key={r.label}>
            <div>
              <span>{r.label}</span>
              <Badge tone={r.value > 80 ? 'danger' : 'success'}>정상</Badge>
            </div>
            <strong>{r.value}%</strong>
            <div className="meter">
              <span style={{ width: `${r.value}%` }} />
            </div>
            <small>{r.detail}</small>
          </article>
        ))}
      </section>
      <section className="admin-card">
        <div className="card-heading">
          <div>
            <h2>서비스 상태</h2>
            <p>애플리케이션별 가동률과 응답 시간입니다.</p>
          </div>
          <Badge tone="success">모든 시스템 정상</Badge>
        </div>
        <DataTable headers={['서비스', '상태', '가동률', '평균 응답 시간', '마지막 확인']}>
          {[
            ['API Gateway', '99.99%', '84ms'],
            ['인증 서비스', '99.98%', '112ms'],
            ['계좌 서비스', '99.99%', '96ms'],
            ['거래 서비스', '99.97%', '138ms'],
            ['FDS 엔진', '99.95%', '221ms'],
          ].map((s) => (
            <tr key={s[0]}>
              <td>
                <strong>{s[0]}</strong>
              </td>
              <td>
                <Badge tone="success">운영 중</Badge>
              </td>
              <td>{s[1]}</td>
              <td>{s[2]}</td>
              <td>방금 전</td>
            </tr>
          ))}
        </DataTable>
      </section>
    </>
  )
}
