import { Navigate, Route, Routes, useLocation } from 'react-router'
import AdminAccountsPage from './accounts/AdminAccountsPage'
import AdminAuthPage from './AdminAuthPage'
import AdminDashboardPage from './dashboard/AdminDashboardPage'
import AdminFdsPage from './fds/AdminFdsPage'
import AdminLayout from './AdminLayout'
import AdminMembersPage from './members/AdminMembersPage'
import AdminSystemPage from './system/AdminSystemPage'
import AdminTransactionsPage from './transactions/AdminTransactionsPage'
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
        <Route path="system" element={<AdminSystemPage />} />
        <Route path="*" element={<Navigate to="." replace />} />
      </Routes>
    </AdminLayout>
  )
}
