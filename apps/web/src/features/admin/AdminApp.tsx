import { Navigate, Route, Routes, useLocation } from 'react-router'
import AdminAuthPage from './AdminAuthPage'
import AdminDashboardPage from './dashboard/AdminDashboardPage'
import AdminLayout from './AdminLayout'
import AdminMembersPage from './members/AdminMembersPage'
import { Badge, DataTable, PageHeader, Pagination, SearchBar } from './components'
import { accounts, fdsCases, statusTone, transactions } from './mockData'
import './admin.css'

const money = new Intl.NumberFormat('ko-KR')
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
        <Route path="accounts" element={<Accounts />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="fds" element={<Fds />} />
        <Route path="system" element={<System />} />
        <Route path="*" element={<Navigate to="." replace />} />
      </Routes>
    </AdminLayout>
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
