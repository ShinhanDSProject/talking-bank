import { useQuery } from '@tanstack/react-query'
import { accountsQuery, type AccountStatus } from './api'

const currencyFormatter = new Intl.NumberFormat('ko-KR')

const statusLabel: Record<AccountStatus, string> = {
  ACTIVE: '정상',
  DORMANT: '휴면',
  CLOSED: '해지',
}

export default function AccountListPage() {
  const { data, isPending, isError, error, refetch, isFetching } = useQuery(accountsQuery)

  return (
    <section>
      <div className="page-header">
        <h2>계좌 목록</h2>
        <button type="button" onClick={() => void refetch()} disabled={isFetching}>
          {isFetching ? '불러오는 중…' : '새로고침'}
        </button>
      </div>

      {isPending && <p className="muted">계좌를 불러오는 중입니다…</p>}

      {isError && (
        <p className="error" role="alert">
          계좌를 불러오지 못했습니다. ({error.message})
          <br />
          <span className="muted">API 서버가 떠 있는지 확인해 주세요.</span>
        </p>
      )}

      {data && data.length === 0 && <p className="muted">등록된 계좌가 없습니다.</p>}

      {data && data.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>계좌번호</th>
              <th>예금주</th>
              <th>상품</th>
              <th className="num">잔액</th>
              <th>상태</th>
            </tr>
          </thead>
          <tbody>
            {data.map((account) => (
              <tr key={account.id}>
                <td className="mono">{account.accountNumber}</td>
                <td>{account.ownerName}</td>
                <td>{account.productName}</td>
                <td className="num mono">
                  {currencyFormatter.format(account.balance)} {account.currency}
                </td>
                <td>
                  <span className={`badge badge--${account.status.toLowerCase()}`}>
                    {statusLabel[account.status]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  )
}
