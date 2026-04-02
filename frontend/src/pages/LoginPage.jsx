import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../features/auth/useAuth'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const targetPath = location.state?.from || '/app'

  const handleLogin = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login({ email, password })
      navigate(targetPath, { replace: true })
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Đăng nhập thất bại, vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section>
      <h1>Đăng nhập</h1>
      <p>
        Sử dụng tài khoản thật từ backend để truy cập các trang bảo vệ.
      </p>

      <form className="auth-form" onSubmit={handleLogin}>
        <label htmlFor="login-email">Email</label>
        <input
          id="login-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="nhap-email@example.com"
          required
        />

        <label htmlFor="login-password">Mật khẩu</label>
        <input
          id="login-password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Nhập mật khẩu"
          required
        />

        {error ? <p className="form-error">{error}</p> : null}

        <div className="actions">
          <button type="submit" disabled={loading}>
            {loading ? 'Đang xử lý...' : 'Đăng nhập'}
          </button>
          <Link to="/register" className="secondary">
            Chưa có tài khoản? Đăng ký
          </Link>
        </div>
      </form>
    </section>
  )
}
