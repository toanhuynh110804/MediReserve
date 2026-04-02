import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../features/auth/useAuth'

export function LoginPage() {
  const [name, setName] = useState('Người dùng thử nghiệm')
  const [role, setRole] = useState('patient')
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const targetPath = location.state?.from || '/app'

  const handleLogin = () => {
    login({
      token: `demo-token-${Date.now()}`,
      user: {
        id: 'demo-id',
        name,
        role,
      },
    })
    navigate(targetPath, { replace: true })
  }

  return (
    <section>
      <h1>Đăng nhập (Chế độ nền tảng)</h1>
      <p>
        Đây là đăng nhập tạm cho chức năng #1 để kiểm tra auth guard. Chức năng #2 sẽ kết nối API /api/auth/login.
      </p>
      <div className="actions">
        <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Tên hiển thị" />
        <select value={role} onChange={(event) => setRole(event.target.value)}>
          <option value="patient">Bệnh nhân</option>
          <option value="doctor">Bác sĩ</option>
          <option value="staff">Nhân viên</option>
          <option value="admin">Quản trị viên</option>
        </select>
        <button type="button" onClick={handleLogin}>
          Đăng nhập với phiên thử nghiệm
        </button>
      </div>
    </section>
  )
}
