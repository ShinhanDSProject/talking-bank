import { useMemo, useState } from 'react'
import { Badge, DataTable, PageHeader, Pagination, SearchBar, StatePanel } from '../components'
import { statusTone } from '../mockData'
import { members, type AdminMember } from './membersData'

type MembersState = 'ready' | 'loading' | 'empty' | 'error'

export default function AdminMembersPage({
  data = members,
  state = 'ready',
}: {
  data?: AdminMember[]
  state?: MembersState
}) {
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [selectedMember, setSelectedMember] = useState<AdminMember | null>(null)

  const filteredMembers = useMemo(() => {
    const keyword = query.trim().toLowerCase()
    if (!keyword) return data
    return data.filter((member) =>
      [member.id, member.name, member.email, member.phone].some((value) =>
        value.toLowerCase().includes(keyword),
      ),
    )
  }, [data, query])

  return (
    <>
      <PageHeader
        eyebrow="CUSTOMERS"
        title="회원 관리"
        description="가입 회원의 상태와 기본 정보를 조회합니다."
        action={<button className="admin-button" type="button">내보내기</button>}
      />
      <section className="admin-card">
        <div className="list-summary">
          <div>
            <strong>전체 {data.length.toLocaleString('ko-KR')}명</strong>
            <span>민감한 인증 정보는 표시하지 않습니다.</span>
          </div>
          <SearchBar
            placeholder="이름, 이메일, 회원번호 검색"
            value={query}
            onChange={(value) => {
              setQuery(value)
              setPage(1)
            }}
          />
        </div>

        {state !== 'ready' ? (
          <StatePanel type={state} />
        ) : filteredMembers.length === 0 ? (
          <StatePanel type="empty" />
        ) : (
          <>
            <DataTable headers={['회원 ID', '이름', '이메일', '휴대폰 번호', '가입일', '회원 상태', '관리']}>
              {filteredMembers.map((member) => (
                <tr key={member.id}>
                  <td className="admin-mono">{member.id}</td>
                  <td><strong>{member.name}</strong></td>
                  <td>{member.email}</td>
                  <td>{member.phone}</td>
                  <td>{member.joinedAt}</td>
                  <td><Badge tone={statusTone(member.status)}>{member.status}</Badge></td>
                  <td>
                    <button className="table-action" type="button" onClick={() => setSelectedMember(member)}>
                      상세 보기
                    </button>
                  </td>
                </tr>
              ))}
            </DataTable>
            <Pagination page={page} pageCount={3} onChange={setPage} />
          </>
        )}
      </section>

      {selectedMember && (
        <MemberDetail member={selectedMember} onClose={() => setSelectedMember(null)} />
      )}
    </>
  )
}

function MemberDetail({ member, onClose }: { member: AdminMember; onClose: () => void }) {
  return (
    <div className="admin-modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="admin-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="member-detail-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header>
          <div>
            <span>MEMBER DETAIL</span>
            <h2 id="member-detail-title">{member.name} 회원 정보</h2>
          </div>
          <button className="admin-icon-button" type="button" aria-label="회원 상세 닫기" onClick={onClose}>×</button>
        </header>
        <dl className="member-detail-list">
          <div><dt>회원 ID</dt><dd className="admin-mono">{member.id}</dd></div>
          <div><dt>회원 상태</dt><dd><Badge tone={statusTone(member.status)}>{member.status}</Badge></dd></div>
          <div><dt>이메일</dt><dd>{member.email}</dd></div>
          <div><dt>휴대폰 번호</dt><dd>{member.phone}</dd></div>
          <div><dt>가입일</dt><dd>{member.joinedAt}</dd></div>
          <div><dt>마지막 로그인</dt><dd>{member.lastLoginAt}</dd></div>
          <div><dt>보유 계좌</dt><dd>{member.accountCount}개</dd></div>
        </dl>
        <div className="member-detail-actions">
          <button className="admin-button" type="button" disabled>계좌 정보 보기</button>
          <button className="admin-button" type="button" disabled>거래 내역 보기</button>
          <button className="admin-button admin-button--primary" type="button" onClick={onClose}>확인</button>
        </div>
      </section>
    </div>
  )
}
