import { Link } from 'react-router'

export default function NotFoundPage() {
  return (
    <section>
      <h2>404</h2>
      <p>요청하신 페이지를 찾을 수 없습니다.</p>
      <Link to="/">홈으로 돌아가기</Link>
    </section>
  )
}
