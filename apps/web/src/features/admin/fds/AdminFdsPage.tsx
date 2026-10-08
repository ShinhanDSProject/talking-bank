import { useMemo, useState } from 'react'
import { Badge, DataTable, FilterSelect, PageHeader, Pagination, SearchBar, StatePanel } from '../components'
import { statusTone } from '../mockData'
import { fdsCases, type AdminFdsCase, type RiskLevel } from './fdsData'

const money = new Intl.NumberFormat('ko-KR')
type FdsPageState = 'ready' | 'loading' | 'empty' | 'error'

export default function AdminFdsPage({ data = fdsCases, state = 'ready' }: { data?: AdminFdsCase[]; state?: FdsPageState }) {
  const [query, setQuery] = useState('')
  const [riskLevel, setRiskLevel] = useState('전체 위험도')
  const [status, setStatus] = useState('전체 상태')
  const [page, setPage] = useState(1)
  const [selectedCase, setSelectedCase] = useState<AdminFdsCase | null>(null)

  const filteredCases = useMemo(() => {
    const keyword = query.trim().toLowerCase()
    return data.filter((fdsCase) => {
      const matchesQuery = !keyword || [fdsCase.id, fdsCase.transactionId, fdsCase.sender, fdsCase.senderMemberId, fdsCase.sourceAccount, fdsCase.destinationAccount, ...fdsCase.reasons].some((value) => value.toLowerCase().includes(keyword))
      const matchesRisk = riskLevel === '전체 위험도' || fdsCase.riskLevel === riskLevel
      const matchesStatus = status === '전체 상태' || fdsCase.status === status
      return matchesQuery && matchesRisk && matchesStatus
    })
  }, [data, query, riskLevel, status])

  const resetPage = () => setPage(1)

  return <>
    <PageHeader eyebrow="FRAUD DETECTION" title="이상 거래 관리" description="FDS가 탐지한 거래의 위험도와 판단 근거를 검토합니다." action={<button className="admin-button" type="button">내보내기</button>} />
    <section className="admin-card">
      <div className="list-summary"><div><strong>탐지 {data.length.toLocaleString('ko-KR')}건</strong><span>원본 거래 정보는 조회만 가능합니다.</span></div><SearchBar placeholder="탐지·거래 ID, 회원, 계좌, 탐지 사유 검색" value={query} onChange={(value) => { setQuery(value); resetPage() }} /></div>
      <div className="fds-filters" aria-label="이상 거래 필터">
        <FilterSelect label="위험도" value={riskLevel} options={['전체 위험도', 'LOW', 'MEDIUM', 'HIGH']} onChange={(value) => { setRiskLevel(value); resetPage() }} />
        <FilterSelect label="처리 상태" value={status} options={['전체 상태', '검토 중', '차단', '정상 처리']} onChange={(value) => { setStatus(value); resetPage() }} />
      </div>
      {state !== 'ready' ? <StatePanel type={state} /> : filteredCases.length === 0 ? <StatePanel type="empty" /> : <>
        <DataTable headers={['거래 ID', '거래 일시', '송금자', '송금 계좌', '수취 계좌', '거래 금액', '위험 점수', '위험도', '탐지 사유', '상태', '관리']}>
          {filteredCases.map((fdsCase) => <tr key={fdsCase.id}>
            <td className="admin-mono">{fdsCase.transactionId}</td><td>{fdsCase.occurredAt}</td><td><strong>{fdsCase.sender}</strong></td><td className="admin-mono">{fdsCase.sourceAccount}</td><td className="admin-mono">{fdsCase.destinationAccount}</td><td className="admin-num">{money.format(fdsCase.amount)}원</td>
            <td><RiskScore score={fdsCase.score} /></td><td><RiskBadge level={fdsCase.riskLevel} /></td><td>{fdsCase.reasons[0]}</td><td><Badge tone={statusTone(fdsCase.status)}>{fdsCase.status}</Badge></td><td><button className="table-action" type="button" onClick={() => setSelectedCase(fdsCase)}>상세 보기</button></td>
          </tr>)}
        </DataTable>
        <Pagination page={page} pageCount={3} onChange={setPage} />
      </>}
    </section>
    {selectedCase && <FdsDetail fdsCase={selectedCase} onClose={() => setSelectedCase(null)} />}
  </>
}

function RiskScore({ score }: { score: number }) {
  const tone = score >= 80 ? 'danger' : score >= 60 ? 'warning' : 'info'
  return <div className={`risk-score risk-score--${tone}`}><strong>{score}</strong><span><i style={{ width: `${score}%` }} /></span></div>
}

function RiskBadge({ level }: { level: RiskLevel }) {
  const tone = level === 'HIGH' ? 'danger' : level === 'MEDIUM' ? 'warning' : 'success'
  return <Badge tone={tone}>{level}</Badge>
}

function FdsDetail({ fdsCase, onClose }: { fdsCase: AdminFdsCase; onClose: () => void }) {
  return <div className="admin-modal-backdrop" role="presentation" onMouseDown={onClose}>
    <section className="admin-modal admin-modal--wide" role="dialog" aria-modal="true" aria-labelledby="fds-detail-title" onMouseDown={(event) => event.stopPropagation()}>
      <header><div><span>FDS DETAIL</span><h2 id="fds-detail-title">{fdsCase.id} 탐지 정보</h2></div><button className="admin-icon-button" type="button" aria-label="이상 거래 상세 닫기" onClick={onClose}>×</button></header>
      <div className="fds-risk-summary"><div><span>위험 점수</span><strong>{fdsCase.score}</strong></div><RiskBadge level={fdsCase.riskLevel} /></div>
      <section className="fds-reasons" aria-labelledby="fds-reasons-title"><h3 id="fds-reasons-title">탐지 사유</h3><ul>{fdsCase.reasons.map((reason) => <li key={reason}>{reason}</li>)}</ul></section>
      <section className="fds-original-transaction" aria-labelledby="original-transaction-title"><h3 id="original-transaction-title">원본 거래 정보</h3><dl className="member-detail-list">
        <div><dt>거래 ID</dt><dd className="admin-mono">{fdsCase.transactionId}</dd></div><div><dt>거래 일시</dt><dd>{fdsCase.occurredAt}</dd></div><div><dt>송금자</dt><dd>{fdsCase.sender} · {fdsCase.senderMemberId}</dd></div><div><dt>거래 유형</dt><dd>{fdsCase.transactionType}</dd></div><div><dt>송금 계좌</dt><dd className="admin-mono">{fdsCase.sourceAccount}</dd></div><div><dt>수취 계좌</dt><dd className="admin-mono">{fdsCase.destinationAccount}</dd></div><div><dt>거래 금액</dt><dd>{money.format(fdsCase.amount)}원</dd></div><div><dt>처리 상태</dt><dd><Badge tone={statusTone(fdsCase.status)}>{fdsCase.status}</Badge></dd></div>
      </dl></section>
      <div className="member-detail-actions"><button className="admin-button" type="button" disabled>원본 거래 보기</button><button className="admin-button admin-button--primary" type="button" onClick={onClose}>확인</button></div>
    </section>
  </div>
}
