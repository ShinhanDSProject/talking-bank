import type { FormEvent, ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router'

function AdminAuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="admin-auth">
      <aside className="admin-auth__brand">
        <div>
          <span className="admin-auth__mark" aria-hidden="true" />
          <strong>Talking BANK</strong>
          <p>안전하고 명확한 금융 운영을 위한 관리자 콘솔</p>
        </div>
        <small>© 2026 Talking BANK · 보안 접속 기록이 저장됩니다.</small>
      </aside>
      <section className="admin-auth__content">{children}</section>
    </main>
  )
}

function LoginPage({ hasError = false }: { hasError?: boolean }) {
  const navigate = useNavigate()
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    navigate(hasError ? '/admin/login' : '/admin')
  }

  return (
    <AdminAuthLayout>
      <form className="admin-auth-card" onSubmit={submit}>
        <header>
          <span>관리자 인증</span>
          <h1>{hasError ? '로그인할 수 없습니다' : '관리자 로그인'}</h1>
          <p>
            {hasError
              ? '관리자 아이디 또는 비밀번호를 다시 확인해 주세요.'
              : 'Talking BANK 운영 콘솔에 접속합니다.'}
          </p>
        </header>
        <div className="admin-auth-form">
          <AuthField
            label="관리자 아이디"
            name="adminId"
            value="admin@atlasbank.kr"
            error={hasError}
          />
          <AuthField
            label="비밀번호"
            name="password"
            value="admin-password"
            error={hasError}
            password
          />
          {hasError && <span className="admin-auth-badge danger">인증 정보 불일치</span>}
          <button className="admin-auth-button" type="submit">
            {hasError ? '다시 로그인' : '관리자 로그인'}
          </button>
        </div>
        <p className={`admin-auth-notice${hasError ? ' danger' : ''}`}>
          {hasError
            ? '남은 시도 3회 · 5회 실패 시 계정이 30분간 잠깁니다.'
            : '관리자 계정은 사내 보안 정책과 2단계 인증의 적용을 받습니다.'}
        </p>
      </form>
    </AdminAuthLayout>
  )
}

function AuthField({
  label,
  name,
  value,
  error,
  password = false,
}: {
  label: string
  name: string
  value: string
  error: boolean
  password?: boolean
}) {
  return (
    <label>
      <span>{label}</span>
      <input
        className={error ? 'is-error' : undefined}
        name={name}
        type={password ? 'password' : 'text'}
        defaultValue={value}
        autoComplete={password ? 'current-password' : 'username'}
      />
      {error && <small>{label}를 확인해 주세요.</small>}
    </label>
  )
}

function StatusPage({
  eyebrow,
  title,
  description,
  badge,
  action,
  notice,
  onAction,
}: {
  eyebrow: string
  title: string
  description: string
  badge: string
  action: string
  notice: string
  onAction: () => void
}) {
  return (
    <AdminAuthLayout>
      <section className="admin-auth-card">
        <header>
          <span>{eyebrow}</span>
          <h1>{title}</h1>
          <p>{description}</p>
        </header>
        <div className="admin-auth-form">
          <span className="admin-auth-badge warning">{badge}</span>
          <button className="admin-auth-button" type="button" onClick={onAction}>
            {action}
          </button>
        </div>
        <p className="admin-auth-notice">{notice}</p>
      </section>
    </AdminAuthLayout>
  )
}

function ForbiddenPage() {
  const navigate = useNavigate()
  return (
    <StatusPage
      eyebrow="접근 제한"
      title="이 화면에 접근할 권한이 없습니다"
      description="FDS 운영 관리자 권한이 필요한 화면입니다."
      badge="권한 확인 필요"
      action="이전 화면으로"
      notice="필요 권한: FDS_REVIEWER · 권한 요청은 보안 관리자에게 문의하세요."
      onAction={() => navigate(-1)}
    />
  )
}

function SessionExpiredPage() {
  const navigate = useNavigate()
  return (
    <StatusPage
      eyebrow="세션 종료"
      title="관리자 세션이 만료되었습니다"
      description="보호를 위해 30분 동안 활동이 없어 자동 로그아웃되었습니다."
      badge="세션 만료"
      action="다시 로그인"
      notice="계속하려면 관리자 계정으로 다시 로그인해 주세요."
      onAction={() => navigate('/admin/login')}
    />
  )
}

export default function AdminAuthPage() {
  const { pathname } = useLocation()

  if (pathname === '/admin/login-error') return <LoginPage hasError />
  if (pathname === '/admin/forbidden') return <ForbiddenPage />
  if (pathname === '/admin/session-expired') return <SessionExpiredPage />
  return <LoginPage />
}
