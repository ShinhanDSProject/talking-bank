import { Link } from 'react-router'

export default function HomePage() {
  return (
    <section>
      <h2>bank-bank</h2>
      <p>Spring Boot API와 React 웹을 한 저장소에서 개발하는 풀스택 모노레포입니다.</p>
      <ul>
        <li>
          <code>apps/api</code> — Spring Boot 3.5 · Java 21 · JPA · Security
        </li>
        <li>
          <code>apps/web</code> — Vite · React 19 · TypeScript · TanStack Query
        </li>
      </ul>
      <p>
        <Link to="/accounts">계좌 목록 보기 →</Link>
      </p>
    </section>
  )
}
