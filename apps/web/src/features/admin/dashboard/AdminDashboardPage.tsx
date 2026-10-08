import { NavLink } from 'react-router'
import { Badge, DataTable, PageHeader, StatePanel, StatCard } from '../components'
import { statusTone } from '../mockData'
import { dashboardData, type DashboardData } from './dashboardData'

const money = new Intl.NumberFormat('ko-KR')

type DashboardState = 'ready' | 'loading' | 'empty' | 'error'

export default function AdminDashboardPage({
  data = dashboardData,
  state = 'ready',
}: {
  data?: DashboardData
  state?: DashboardState
}) {
  if (state !== 'ready') return <StatePanel type={state} />

  return (
    <>
      <PageHeader
        eyebrow="DASHBOARD"
        title="관리자 Dashboard"
        description="전체 운영 상태와 이상거래를 실시간으로 모니터링하세요."
        action={
          <button className="admin-button" type="button">
            ↻ 새로고침
          </button>
        }
      />

      <section className="stat-grid" aria-label="운영 요약">
        {data.stats.map((item) => (
          <StatCard
            key={item.label}
            label={item.label}
            value={item.value}
            meta={item.delta}
            tone={item.tone}
          />
        ))}
      </section>

      <section className="dashboard-metric-grid" aria-label="시스템 지표">
        {data.systemMetrics.map((metric) => (
          <article className="admin-card dashboard-metric" key={metric.name}>
            <div>
              <span>{metric.name}</span>
              <Badge tone="success">정상</Badge>
            </div>
            <strong>
              {metric.value}
              {metric.name === 'API 응답시간' ? 'ms' : '%'}
            </strong>
            <div className="meter">
              <span style={{ width: `${metric.value}%` }} />
            </div>
            <small>{metric.detail}</small>
          </article>
        ))}
      </section>

      <div className="dashboard-grid">
        <section className="admin-card admin-card--wide">
          <div className="card-heading">
            <div>
              <h2>최근 거래 현황</h2>
              <p>최근 7일 거래 건수</p>
            </div>
            <NavLink to="/admin/transactions">전체 거래 →</NavLink>
          </div>
          <div className="bar-chart" aria-label="최근 7일 거래량 막대 차트">
            {data.transactionTrend.map((item) => (
              <div key={item.label}>
                <span style={{ height: `${item.value}%` }} />
                <small>{item.label}</small>
              </div>
            ))}
          </div>
        </section>
        <section className="admin-card">
          <div className="card-heading">
            <div>
              <h2>플랫폼 상태</h2>
              <p>주요 서비스 실시간 상태</p>
            </div>
            <Badge tone="success">모든 시스템 정상</Badge>
          </div>
          {data.services.map((service) => (
            <div className="platform-row" key={service.name}>
              <span>{service.name}</span>
              <small>{service.uptime}</small>
              <Badge tone={service.status === '정상' ? 'success' : 'warning'}>
                {service.status}
              </Badge>
            </div>
          ))}
          <div className="risk-summary">
            <strong>FDS 위험 수준</strong>
            <div>
              {data.riskSummary.map((risk) => (
                <Badge key={risk.label} tone={risk.tone}>
                  {risk.label} · {risk.count}
                </Badge>
              ))}
            </div>
          </div>
        </section>
      </div>

      <section className="admin-card">
        <div className="card-heading">
          <div>
            <h2>최근 거래</h2>
            <p>가장 최근 처리된 입금·출금·송금입니다.</p>
          </div>
          <NavLink to="/admin/transactions">전체 보기 →</NavLink>
        </div>
        <DataTable headers={['거래번호', '일시', '회원', '구분', '금액', '상태']}>
          {data.recentTransactions.map((item) => (
            <tr key={item.id}>
              <td className="admin-mono">{item.id}</td>
              <td>{item.at}</td>
              <td>
                <strong>{item.user}</strong>
              </td>
              <td>{item.type}</td>
              <td className="admin-num">{money.format(item.amount)}원</td>
              <td>
                <Badge tone={statusTone(item.status)}>{item.status}</Badge>
              </td>
            </tr>
          ))}
        </DataTable>
      </section>

      <section className="admin-card">
        <div className="card-heading">
          <div>
            <h2>최근 이상거래</h2>
            <p>위험 점수가 높은 순서로 표시합니다.</p>
          </div>
          <NavLink to="/admin/fds">전체 보기 →</NavLink>
        </div>
        <DataTable
          headers={['탐지 번호', '탐지 시각', '회원', '금액', '위험 점수', '탐지 사유', '상태']}
        >
          {data.recentFdsCases.map((item) => (
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
