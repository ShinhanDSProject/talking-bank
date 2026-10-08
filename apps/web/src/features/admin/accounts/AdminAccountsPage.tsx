import { useMemo, useState } from 'react'
import { Badge, DataTable, PageHeader, Pagination, SearchBar, StatePanel } from '../components'
import { statusTone } from '../mockData'
import { accounts, type AdminAccount } from './accountsData'

const money = new Intl.NumberFormat('ko-KR')
type AccountsState = 'ready' | 'loading' | 'empty' | 'error'

export default function AdminAccountsPage({
  data = accounts,
  state = 'ready',
}: {
  data?: AdminAccount[]
  state?: AccountsState
}) {
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [selectedAccount, setSelectedAccount] = useState<AdminAccount | null>(null)

  const filteredAccounts = useMemo(() => {
    const keyword = query.trim().toLowerCase()
    if (!keyword) return data
    return data.filter((account) =>
      [account.id, account.number, account.owner, account.memberId].some((value) =>
        value.toLowerCase().includes(keyword),
      ),
    )
  }, [data, query])

  return (
    <>
      <PageHeader
        eyebrow="ACCOUNTS"
        title="계좌 관리"
        description="전체 가상계좌의 소유 회원, 잔액 및 상태를 조회합니다."
        action={<button className="admin-button" type="button">내보내기</button>}
      />
      <section className="admin-card">
        <div className="list-summary">
          <div>
            <strong>전체 {data.length.toLocaleString('ko-KR')}개</strong>
            <span>계좌 비밀번호와 인증 정보는 표시하지 않습니다.</span>
          </div>
          <SearchBar
            placeholder="계좌번호, 예금주, 회원 ID 검색"
            value={query}
            onChange={(value) => {
              setQuery(value)
              setPage(1)
            }}
          />
        </div>

        {state !== 'ready' ? (
          <StatePanel type={state} />
        ) : filteredAccounts.length === 0 ? (
          <StatePanel type="empty" />
        ) : (
          <>
            <DataTable headers={['계좌 ID', '계좌번호', '예금주', '회원 ID', '현재 잔액', '생성일', '계좌 상태', '관리']}>
              {filteredAccounts.map((account) => (
                <tr key={account.id}>
                  <td className="admin-mono">{account.id}</td>
                  <td className="admin-mono">{account.number}</td>
                  <td><strong>{account.owner}</strong></td>
                  <td className="admin-mono">{account.memberId}</td>
                  <td className="admin-num">{money.format(account.balance)}원</td>
                  <td>{account.createdAt}</td>
                  <td><Badge tone={statusTone(account.status)}>{account.status}</Badge></td>
                  <td><button className="table-action" type="button" onClick={() => setSelectedAccount(account)}>상세 보기</button></td>
                </tr>
              ))}
            </DataTable>
            <Pagination page={page} pageCount={3} onChange={setPage} />
          </>
        )}
      </section>

      {selectedAccount && <AccountDetail account={selectedAccount} onClose={() => setSelectedAccount(null)} />}
    </>
  )
}

function AccountDetail({ account, onClose }: { account: AdminAccount; onClose: () => void }) {
  return (
    <div className="admin-modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="admin-modal admin-modal--wide" role="dialog" aria-modal="true" aria-labelledby="account-detail-title" onMouseDown={(event) => event.stopPropagation()}>
        <header>
          <div><span>ACCOUNT DETAIL</span><h2 id="account-detail-title">{account.number} 계좌 정보</h2></div>
          <button className="admin-icon-button" type="button" aria-label="계좌 상세 닫기" onClick={onClose}>×</button>
        </header>
        <dl className="member-detail-list">
          <div><dt>계좌 ID</dt><dd className="admin-mono">{account.id}</dd></div>
          <div><dt>계좌 상태</dt><dd><Badge tone={statusTone(account.status)}>{account.status}</Badge></dd></div>
          <div><dt>상품명</dt><dd>{account.product}</dd></div>
          <div><dt>현재 잔액</dt><dd>{money.format(account.balance)}원</dd></div>
          <div><dt>예금주</dt><dd>{account.owner}</dd></div>
          <div><dt>회원 ID</dt><dd className="admin-mono">{account.memberId}</dd></div>
          <div><dt>회원 이메일</dt><dd>{account.memberEmail}</dd></div>
          <div><dt>계좌 생성일</dt><dd>{account.createdAt}</dd></div>
        </dl>
        <section className="account-transactions" aria-labelledby="recent-transactions-title">
          <div className="card-heading"><div><h3 id="recent-transactions-title">최근 거래 내역</h3><p>이 계좌에서 발생한 최근 거래입니다.</p></div></div>
          {account.recentTransactions.length ? (
            <DataTable headers={['거래 ID', '일시', '구분', '금액', '거래 후 잔액']}>
              {account.recentTransactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td className="admin-mono">{transaction.id}</td><td>{transaction.at}</td><td>{transaction.type}</td>
                  <td className="admin-num">{money.format(transaction.amount)}원</td><td className="admin-num">{money.format(transaction.balanceAfter)}원</td>
                </tr>
              ))}
            </DataTable>
          ) : <p className="account-transactions__empty">최근 거래 내역이 없습니다.</p>}
        </section>
        <div className="member-detail-actions"><button className="admin-button" type="button" disabled>회원 정보 보기</button><button className="admin-button admin-button--primary" type="button" onClick={onClose}>확인</button></div>
      </section>
    </div>
  )
}
