import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../features/auth/useAuth'
import { buildNavItems } from './navItems'
import { ROLE_LABELS } from '../shared/constants/roles'

export function AppShell() {
  const { isAuthenticated, user, logout } = useAuth()
  const navItems = buildNavItems(isAuthenticated, user?.role)

  return (
    <div className="app-shell">
      <header className="topbar">
        <strong className="brand">MediReserve - Nền tảng giao diện</strong>
        <nav className="nav" aria-label="Điều hướng chính">
          {navItems.map((item) => (
            <NavLink key={item.to + item.label} to={item.to} end={item.to === '/'}>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="panel">
        <Outlet />
      </main>

      {isAuthenticated ? (
        <div className="panel">
          <p>
            Phiên đăng nhập: <strong>{user?.name || 'Người dùng chưa xác định'}</strong> ({ROLE_LABELS[user?.role] || 'Vai trò chưa xác định'})
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
