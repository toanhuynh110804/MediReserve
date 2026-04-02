import { Link } from 'react-router-dom'

export function UnauthorizedPage() {
  return (
    <section>
      <h1>403 - Không được phép truy cập</h1>
      <p>Bạn không có quyền truy cập trang này.</p>
      <div className="actions">
        <Link to="/" className="secondary">
          Về trang chủ
        </Link>
      </div>
    </section>
  )
}
