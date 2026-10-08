import type { ReactNode } from 'react'
import type { StatusTone } from './mockData'

export function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: StatusTone }) {
  return <span className={`admin-badge admin-badge--${tone}`}>{children}</span>
}

export function StatCard({
  label,
  value,
  meta,
  tone = 'info',
}: {
  label: string
  value: string
  meta: string
  tone?: StatusTone
}) {
  return (
    <article className="stat-card">
      <div className={`stat-card__icon stat-card__icon--${tone}`} aria-hidden="true" />
      <p>{label}</p>
      <strong>{value}</strong>
      <span>{meta}</span>
    </article>
  )
}

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <header className="admin-page-header">
      <div>
        <span>{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </header>
  )
}

export function SearchBar({ placeholder }: { placeholder: string }) {
  return (
    <div className="admin-toolbar">
      <label className="admin-search">
        <span aria-hidden="true">⌕</span>
        <input aria-label="검색" placeholder={placeholder} />
      </label>
      <button className="admin-button admin-button--primary" type="button">
        검색
      </button>
      <button className="admin-button" type="button">
        필터
      </button>
    </div>
  )
}

export function DataTable({ headers, children }: { headers: string[]; children: ReactNode }) {
  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  )
}

export function Pagination() {
  return (
    <nav className="admin-pagination" aria-label="페이지 이동">
      <button type="button" aria-label="이전 페이지">
        ‹
      </button>
      <button type="button" className="active">
        1
      </button>
      <button type="button">2</button>
      <button type="button">3</button>
      <span>…</span>
      <button type="button">24</button>
      <button type="button" aria-label="다음 페이지">
        ›
      </button>
    </nav>
  )
}

export function StatePanel({ type }: { type: 'loading' | 'empty' | 'error' }) {
  const content = {
    loading: ['불러오는 중입니다', '최신 데이터를 안전하게 가져오고 있어요.'],
    empty: ['표시할 데이터가 없습니다', '검색 조건을 변경해 보세요.'],
    error: ['데이터를 불러오지 못했습니다', '잠시 후 다시 시도해 주세요.'],
  }[type]
  return (
    <div
      className={`state-panel state-panel--${type}`}
      role={type === 'error' ? 'alert' : undefined}
    >
      <span aria-hidden="true">{type === 'loading' ? '◌' : type === 'empty' ? '□' : '!'}</span>
      <strong>{content[0]}</strong>
      <p>{content[1]}</p>
      {type === 'error' && (
        <button className="admin-button" type="button">
          다시 시도
        </button>
      )}
    </div>
  )
}
