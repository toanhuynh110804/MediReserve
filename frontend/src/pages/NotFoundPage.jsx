import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <section>
      <h1>404</h1>
      <p>Đường dẫn không tồn tại.</p>
      <div className="actions">
        <Link to="/" className="secondary">
          Về trang chủ
        </Link>
      </div>
    </section>
  )
}
