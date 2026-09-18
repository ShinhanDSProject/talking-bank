import { BrowserRouter, NavLink, Route, Routes } from 'react-router'
import AccountListPage from './features/accounts/AccountListPage'
import HomePage from './pages/HomePage'
import NotFoundPage from './pages/NotFoundPage'

export default function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <header className="app-header">
          <span className="logo">bank-bank</span>
          <nav>
            <NavLink to="/" end>
              홈
            </NavLink>
            <NavLink to="/accounts">계좌</NavLink>
          </nav>
        </header>

        <main className="app-main">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/accounts" element={<AccountListPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
