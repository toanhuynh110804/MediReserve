import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../features/auth/useAuth'

const defaultForm = {
  name: '',
  email: '',
  password: '',
}

export function RegisterPage() {
  const [formData, setFormData] = useState(defaultForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (field) => (event) => {
    setFormData((prev) => ({ ...prev, [field]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      await register(formData)
      navigate('/app', { replace: true })
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Đăng ký thất bại, vui lòng kiểm tra lại thông tin.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section>
      <h1>Đăng ký tài khoản</h1>
      <p>Tạo tài khoản bệnh nhân để sử dụng hệ thống MediReserve.</p>

      <form className="auth-form" onSubmit={handleSubmit}>
        <label htmlFor="register-name">Họ và tên</label>
        <input
          id="register-name"
          type="text"
          value={formData.name}
          onChange={handleChange('name')}
          placeholder="Nhập họ tên"
          required
        />

        <label htmlFor="register-email">Email</label>
        <input
          id="register-email"
          type="email"
          value={formData.email}
          onChange={handleChange('email')}
          placeholder="nhap-email@example.com"
          required
        />

        <label htmlFor="register-password">Mật khẩu</label>
        <input
          id="register-password"
          type="password"
          value={formData.password}
          onChange={handleChange('password')}
          placeholder="Tối thiểu 6 ký tự"
          minLength={6}
          required
        />

        {error ? <p className="form-error">{error}</p> : null}

        <div className="actions">
          <button type="submit" disabled={loading}>
            {loading ? 'Đang xử lý...' : 'Đăng ký'}
          </button>
          <Link to="/login" className="secondary">
            Đã có tài khoản? Đăng nhập
          </Link>
        </div>
      </form>
    </section>
  )
}
