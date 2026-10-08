import { NavLink, Navigate, Route, Routes, useLocation } from 'react-router'
import AdminAuthPage from './AdminAuthPage'
import { Badge, DataTable, PageHeader, Pagination, SearchBar, StatCard } from './components'
import { accounts, dashboardStats, fdsCases, members, statusTone, transactions } from './mockData'
import './admin.css'

const money = new Intl.NumberFormat('ko-KR')
const menus = [
  { to: '/admin', label: '대시보드', icon: '▦', end: true },
  { to: '/admin/members', label: '회원 관리', icon: '♙' },
  { to: '/admin/accounts', label: '계좌 관리', icon: '▣' },
  { to: '/admin/transactions', label: '거래 관리', icon: '⇄' },
  { to: '/admin/fds', label: '이상 거래 관리', icon: '◇' },
  { to: '/admin/system', label: '시스템 상태', icon: '◉' },
]

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
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <NavLink to="/admin" className="admin-logo">
          <span>t</span>
          <strong>talking-bank</strong>
          <small>ADMIN</small>
        </NavLink>
        <nav>
          {menus.map((menu) => (
            <NavLink key={menu.to} to={menu.to} end={menu.end}>
              <span>{menu.icon}</span>
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
          <button type="button" aria-label="관리자 메뉴">
            ⋮
          </button>
        </div>
      </aside>
      <section className="admin-workspace">
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
        <main>
          <Routes>
            <Route path="/admin" element={<Dashboard />} />
            <Route path="/admin/members" element={<Members />} />
            <Route path="/admin/accounts" element={<Accounts />} />
            <Route path="/admin/transactions" element={<Transactions />} />
            <Route path="/admin/fds" element={<Fds />} />
            <Route path="/admin/system" element={<System />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </main>
      </section>
    </div>
  )
}

function Dashboard() {
  return (
    <>
      <PageHeader
        eyebrow="OVERVIEW"
        title="대시보드"
        description="2026년 10월 8일 목요일 · 실시간 운영 현황입니다."
        action={
          <button className="admin-button" type="button">
            ↻ 새로고침
          </button>
        }
      />
      <section className="stat-grid">
        {dashboardStats.map((item) => (
          <StatCard
            key={item.label}
            label={item.label}
            value={item.value}
            meta={item.delta}
            tone={item.tone}
          />
        ))}
      </section>
      <div className="dashboard-grid">
        <section className="admin-card admin-card--wide">
          <div className="card-heading">
            <div>
              <h2>거래 추이</h2>
              <p>최근 7일 거래 건수</p>
            </div>
            <select aria-label="거래 추이 기간">
              <option>최근 7일</option>
            </select>
          </div>
          <div className="bar-chart" aria-label="최근 7일 거래량 막대 차트">
            {[52, 68, 61, 82, 73, 94, 78].map((height, index) => (
              <div key={height + index}>
                <span style={{ height: `${height}%` }} />
                <small>{['10/2', '10/3', '10/4', '10/5', '10/6', '10/7', '오늘'][index]}</small>
              </div>
            ))}
          </div>
        </section>
        <section className="admin-card">
          <div className="card-heading">
            <div>
              <h2>시스템 상태</h2>
              <p>주요 서비스 실시간 상태</p>
            </div>
            <Badge tone="success">전체 정상</Badge>
          </div>
          {[
            ['API 서버', '99.99%', 24],
            ['데이터베이스', '99.98%', 41],
            ['FDS 엔진', '99.95%', 62],
          ].map(([name, uptime, usage]) => (
            <div className="service-row" key={name as string}>
              <div>
                <strong>{name}</strong>
                <Badge tone="success">운영 중</Badge>
              </div>
              <div className="meter">
                <span style={{ width: `${usage}%` }} />
              </div>
              <small>가동률 {uptime}</small>
            </div>
          ))}
        </section>
      </div>
      <section className="admin-card">
        <div className="card-heading">
          <div>
            <h2>최근 이상 거래</h2>
            <p>위험 점수가 높은 순서로 표시합니다.</p>
          </div>
          <NavLink to="/admin/fds">전체 보기 →</NavLink>
        </div>
        <DataTable
          headers={['탐지 번호', '탐지 시각', '회원', '금액', '위험 점수', '탐지 사유', '상태']}
        >
          {fdsCases.slice(0, 3).map((item) => (
            <tr key={item.id}>
              <td className="admin-mono">{item.id}</td>
              <td>{item.at}</td>
              <td>
                <strong>{item.user}</strong>
              </td>
              <td className="admin-num">{money.format(item.amount)}원</td>
              <td>
                <RiskScore score={item.score} />
              </td>
              <td>{item.reason}</td>
              <td>
                <Badge tone={statusTone(item.status)}>{item.status}</Badge>
              </td>
            </tr>
          ))}
        </DataTable>
      </section>
    </>
  )
}

function Members() {
  return (
    <ListPage
      eyebrow="CUSTOMERS"
      title="회원 관리"
      description="가입 회원의 상태와 기본 정보를 조회합니다."
      count="전체 24,891명"
      placeholder="이름, 이메일, 회원번호 검색"
    >
      <DataTable headers={['회원번호', '이름', '이메일', '휴대폰', '가입일', '상태', '관리']}>
        {members.map((m) => (
          <tr key={m.id}>
            <td className="admin-mono">{m.id}</td>
            <td>
              <strong>{m.name}</strong>
            </td>
            <td>{m.email}</td>
            <td>{m.phone}</td>
            <td>{m.joined}</td>
            <td>
              <Badge tone={statusTone(m.status)}>{m.status}</Badge>
            </td>
            <td>
              <button className="table-action" type="button">
                상세 보기
              </button>
            </td>
          </tr>
        ))}
      </DataTable>
    </ListPage>
  )
}
function Accounts() {
  return (
    <ListPage
      eyebrow="ACCOUNTS"
      title="계좌 관리"
      description="전체 계좌의 상품, 잔액 및 상태를 조회합니다."
      count="전체 31,204개"
      placeholder="계좌번호, 예금주, 상품명 검색"
    >
      <DataTable headers={['계좌번호', '예금주', '상품명', '잔액', '개설일', '상태', '관리']}>
        {accounts.map((a) => (
          <tr key={a.number}>
            <td className="admin-mono">{a.number}</td>
            <td>
              <strong>{a.owner}</strong>
            </td>
            <td>{a.product}</td>
            <td className="admin-num">{money.format(a.balance)}원</td>
            <td>{a.opened}</td>
            <td>
              <Badge tone={statusTone(a.status)}>{a.status}</Badge>
            </td>
            <td>
              <button className="table-action" type="button">
                상세 보기
              </button>
            </td>
          </tr>
        ))}
      </DataTable>
    </ListPage>
  )
}
function Transactions() {
  return (
    <ListPage
      eyebrow="TRANSACTIONS"
      title="거래 관리"
      description="입금, 출금, 송금 내역과 처리 상태를 조회합니다."
      count="오늘 18,492건"
      placeholder="거래번호, 회원명 검색"
    >
      <DataTable headers={['거래번호', '일시', '회원', '구분', '금액', '상대 정보', '상태']}>
        {transactions.map((t) => (
          <tr key={t.id}>
            <td className="admin-mono">{t.id}</td>
            <td>{t.at}</td>
            <td>
              <strong>{t.user}</strong>
            </td>
            <td>{t.type}</td>
            <td className="admin-num">{money.format(t.amount)}원</td>
            <td>{t.target}</td>
            <td>
              <Badge tone={statusTone(t.status)}>{t.status}</Badge>
            </td>
          </tr>
        ))}
      </DataTable>
    </ListPage>
  )
}
function Fds() {
  return (
    <ListPage
      eyebrow="FRAUD DETECTION"
      title="이상 거래 관리"
      description="탐지된 이상 거래의 위험도와 사유를 검토합니다."
      count="검토 필요 28건"
      placeholder="탐지번호, 회원명, 탐지 사유 검색"
    >
      <DataTable
        headers={[
          '탐지번호',
          '탐지 시각',
          '회원',
          '거래 금액',
          '위험 점수',
          '탐지 사유',
          '상태',
          '관리',
        ]}
      >
        {fdsCases.map((f) => (
          <tr key={f.id}>
            <td className="admin-mono">{f.id}</td>
            <td>{f.at}</td>
            <td>
              <strong>{f.user}</strong>
            </td>
            <td className="admin-num">{money.format(f.amount)}원</td>
            <td>
              <RiskScore score={f.score} />
            </td>
            <td>{f.reason}</td>
            <td>
              <Badge tone={statusTone(f.status)}>{f.status}</Badge>
            </td>
            <td>
              <button className="table-action" type="button">
                검토하기
              </button>
            </td>
          </tr>
        ))}
      </DataTable>
    </ListPage>
  )
}

function ListPage({
  eyebrow,
  title,
  description,
  count,
  placeholder,
  children,
}: {
  eyebrow: string
  title: string
  description: string
  count: string
  placeholder: string
  children: React.ReactNode
}) {
  return (
    <>
      <PageHeader
        eyebrow={eyebrow}
        title={title}
        description={description}
        action={
          <button className="admin-button" type="button">
            내보내기
          </button>
        }
      />
      <section className="admin-card">
        <div className="list-summary">
          <div>
            <strong>{count}</strong>
            <span>마지막 업데이트 방금 전</span>
          </div>
          <SearchBar placeholder={placeholder} />
        </div>
        {children}
        <Pagination />
      </section>
    </>
  )
}
function RiskScore({ score }: { score: number }) {
  const tone = score >= 80 ? 'danger' : score >= 60 ? 'warning' : 'info'
  return (
    <div className={`risk-score risk-score--${tone}`}>
      <strong>{score}</strong>
      <span>
        <i style={{ width: `${score}%` }} />
      </span>
    </div>
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
