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

export function MetricBarChart({
  label,
  unit,
  points,
}: {
  label: string
  unit: string
  points: { label: string; value: number }[]
}) {
  const max = Math.max(...points.map((point) => point.value), 1)
  return (
    <div className="metric-chart" role="img" aria-label={`${label} 추이 차트`}>
      {points.map((point) => (
        <div key={point.label}>
          <span title={`${point.value}${unit}`} style={{ height: `${Math.max((point.value / max) * 100, 4)}%` }} />
          <small>{point.label}</small>
        </div>
      ))}
    </div>
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

export function SearchBar({
  placeholder,
  value,
  onChange,
  onSubmit,
}: {
  placeholder: string
  value?: string
  onChange?: (value: string) => void
  onSubmit?: () => void
}) {
  return (
    <form
      className="admin-toolbar"
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit?.()
      }}
    >
      <label className="admin-search">
        <span aria-hidden="true">⌕</span>
        <input
          aria-label="검색"
          placeholder={placeholder}
          value={value}
          onChange={onChange ? (event) => onChange(event.target.value) : undefined}
        />
      </label>
      <button className="admin-button admin-button--primary" type="submit">
        검색
      </button>
      <button className="admin-button" type="button">
        필터
      </button>
    </form>
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

export function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: string[]
  onChange: (value: string) => void
}) {
  return (
    <label className="admin-filter-field">
      <span>{label}</span>
      <select aria-label={label} value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => <option key={option}>{option}</option>)}
      </select>
    </label>
  )
}

export function Pagination({
  page = 1,
  pageCount = 24,
  onChange,
}: {
  page?: number
  pageCount?: number
  onChange?: (page: number) => void
}) {
  const pages = Array.from({ length: Math.min(pageCount, 3) }, (_, index) => index + 1)
  return (
    <nav className="admin-pagination" aria-label="페이지 이동">
      <button type="button" aria-label="이전 페이지" disabled={page === 1} onClick={() => onChange?.(page - 1)}>
        ‹
      </button>
      {pages.map((item) => (
        <button key={item} type="button" className={item === page ? 'active' : undefined} onClick={() => onChange?.(item)}>
          {item}
        </button>
      ))}
      {pageCount > 3 && <span>…</span>}
      {pageCount > 3 && <button type="button" onClick={() => onChange?.(pageCount)}>{pageCount}</button>}
      <button type="button" aria-label="다음 페이지" disabled={page === pageCount} onClick={() => onChange?.(page + 1)}>
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
