import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../features/auth/useAuth'

export function AppShell() {
  const { isAuthenticated, user, logout } = useAuth()
  const roleLabelMap = {
    patient: 'Bệnh nhân',
    doctor: 'Bác sĩ',
    staff: 'Nhân viên',
    admin: 'Quản trị viên',
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <strong className="brand">MediReserve - Nền tảng giao diện</strong>
        <nav className="nav" aria-label="Điều hướng chính">
          <NavLink to="/" end>
            Trang chu
          </NavLink>
          <NavLink to="/app">Tổng quan</NavLink>
          <NavLink to="/admin">Quản trị</NavLink>
          {!isAuthenticated ? <NavLink to="/login">Đăng nhập</NavLink> : null}
          {!isAuthenticated ? <NavLink to="/register">Đăng ký</NavLink> : null}
        </nav>
      </header>

      <main className="panel">
        <Outlet />
      </main>

      {isAuthenticated ? (
        <div className="panel">
          <p>
            Phiên đăng nhập: <strong>{user?.name || 'Người dùng chưa xác định'}</strong> ({roleLabelMap[user?.role] || 'Vai trò chưa xác định'})
          </p>
          <div className="actions">
            <button className="warn" onClick={logout} type="button">
              Đăng xuất
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
