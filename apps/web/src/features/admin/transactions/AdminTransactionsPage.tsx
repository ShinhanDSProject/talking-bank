import { useMemo, useState } from 'react'
import { Badge, DataTable, FilterSelect, PageHeader, Pagination, SearchBar, StatePanel } from '../components'
import { statusTone } from '../mockData'
import { transactions, type AdminTransaction } from './transactionsData'

const money = new Intl.NumberFormat('ko-KR')
type TransactionsState = 'ready' | 'loading' | 'empty' | 'error'

export default function AdminTransactionsPage({ data = transactions, state = 'ready' }: { data?: AdminTransaction[]; state?: TransactionsState }) {
  const [query, setQuery] = useState('')
  const [type, setType] = useState('전체 유형')
  const [status, setStatus] = useState('전체 상태')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [page, setPage] = useState(1)
  const [selectedTransaction, setSelectedTransaction] = useState<AdminTransaction | null>(null)

  const filteredTransactions = useMemo(() => {
    const keyword = query.trim().toLowerCase()
    return data.filter((transaction) => {
      const matchesQuery = !keyword || [transaction.id, transaction.sourceAccount, transaction.destinationAccount, transaction.sender, transaction.recipient, transaction.senderMemberId, transaction.recipientMemberId].some((value) => value.toLowerCase().includes(keyword))
      const matchesType = type === '전체 유형' || transaction.type === type
      const matchesStatus = status === '전체 상태' || transaction.status === status
      const matchesStart = !startDate || transaction.date >= startDate
      const matchesEnd = !endDate || transaction.date <= endDate
      return matchesQuery && matchesType && matchesStatus && matchesStart && matchesEnd
    })
  }, [data, endDate, query, startDate, status, type])

  const resetPage = () => setPage(1)

  return (
    <>
      <PageHeader eyebrow="TRANSACTIONS" title="거래 관리" description="전체 거래 흐름과 성공·실패 상태를 조회합니다." action={<button className="admin-button" type="button">내보내기</button>} />
      <section className="admin-card">
        <div className="list-summary"><div><strong>전체 {data.length.toLocaleString('ko-KR')}건</strong><span>거래 데이터는 조회만 가능하며 수정하거나 삭제할 수 없습니다.</span></div><SearchBar placeholder="거래 ID, 계좌번호, 회원 정보 검색" value={query} onChange={(value) => { setQuery(value); resetPage() }} /></div>
        <div className="transaction-filters" aria-label="거래 필터">
          <FilterSelect label="거래 유형" value={type} options={['전체 유형', '송금', '입금', '출금', '자동이체']} onChange={(value) => { setType(value); resetPage() }} />
          <FilterSelect label="거래 상태" value={status} options={['전체 상태', '성공', '실패', '처리 중']} onChange={(value) => { setStatus(value); resetPage() }} />
          <label className="admin-filter-field"><span>시작일</span><input aria-label="시작일" type="date" value={startDate} onChange={(event) => { setStartDate(event.target.value); resetPage() }} /></label>
          <label className="admin-filter-field"><span>종료일</span><input aria-label="종료일" type="date" value={endDate} onChange={(event) => { setEndDate(event.target.value); resetPage() }} /></label>
        </div>

        {state !== 'ready' ? <StatePanel type={state} /> : filteredTransactions.length === 0 ? <StatePanel type="empty" /> : <>
          <DataTable headers={['거래 ID', '거래 일시', '송금 계좌', '수취 계좌', '송금자 → 수취인', '거래 금액', '유형', '상태', '관리']}>
            {filteredTransactions.map((transaction) => <tr key={transaction.id}>
              <td className="admin-mono">{transaction.id}</td><td>{transaction.occurredAt}</td><td className="admin-mono">{transaction.sourceAccount}</td><td className="admin-mono">{transaction.destinationAccount}</td>
              <td><strong>{transaction.sender}</strong> → {transaction.recipient}</td><td className="admin-num">{money.format(transaction.amount)}원</td><td>{transaction.type}</td><td><Badge tone={statusTone(transaction.status)}>{transaction.status}</Badge></td>
              <td><button className="table-action" type="button" onClick={() => setSelectedTransaction(transaction)}>상세 보기</button></td>
            </tr>)}
          </DataTable>
          <Pagination page={page} pageCount={3} onChange={setPage} />
        </>}
      </section>
      {selectedTransaction && <TransactionDetail transaction={selectedTransaction} onClose={() => setSelectedTransaction(null)} />}
    </>
  )
}

function TransactionDetail({ transaction, onClose }: { transaction: AdminTransaction; onClose: () => void }) {
  return <div className="admin-modal-backdrop" role="presentation" onMouseDown={onClose}>
    <section className="admin-modal admin-modal--wide" role="dialog" aria-modal="true" aria-labelledby="transaction-detail-title" onMouseDown={(event) => event.stopPropagation()}>
      <header><div><span>TRANSACTION DETAIL</span><h2 id="transaction-detail-title">{transaction.id} 거래 정보</h2></div><button className="admin-icon-button" type="button" aria-label="거래 상세 닫기" onClick={onClose}>×</button></header>
      <dl className="member-detail-list">
        <div><dt>거래 일시</dt><dd>{transaction.occurredAt}</dd></div><div><dt>상태</dt><dd><Badge tone={statusTone(transaction.status)}>{transaction.status}</Badge></dd></div>
        <div><dt>송금 계좌</dt><dd className="admin-mono">{transaction.sourceAccount}</dd></div><div><dt>수취 계좌</dt><dd className="admin-mono">{transaction.destinationAccount}</dd></div>
        <div><dt>송금자</dt><dd>{transaction.sender} · {transaction.senderMemberId}</dd></div><div><dt>수취인</dt><dd>{transaction.recipient} · {transaction.recipientMemberId}</dd></div>
        <div><dt>거래 유형</dt><dd>{transaction.type}</dd></div><div><dt>거래 금액</dt><dd>{money.format(transaction.amount)}원</dd></div>
      </dl>
      {transaction.failureReason && <section className="transaction-failure" role="alert"><strong>거래 실패 사유</strong><p>{transaction.failureReason}</p></section>}
      {transaction.fdsCaseId && <p className="transaction-fds-link">이상 거래 탐지 번호: <strong>{transaction.fdsCaseId}</strong></p>}
      <div className="member-detail-actions"><button className="admin-button" type="button" disabled>회원 정보 보기</button><button className="admin-button" type="button" disabled>계좌 정보 보기</button><button className="admin-button admin-button--primary" type="button" onClick={onClose}>확인</button></div>
    </section>
  </div>
}
