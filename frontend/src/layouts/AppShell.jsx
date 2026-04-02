import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../features/auth/useAuth'
import { buildNavItems } from './navItems'
import { ROLE_LABELS } from '../shared/constants/roles'

export function AppShell() {
  const { isAuthenticated, user, logout } = useAuth()
  const navItems = buildNavItems(isAuthenticated, user?.role)

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">Bỏ qua điều hướng</a>

      <header className="topbar">
        <div>
          <strong className="brand">MediReserve</strong>
          <p className="topbar-subtitle">Điều phối lịch khám, hồ sơ và vận hành bệnh viện trên một giao diện thống nhất.</p>
        </div>
        <nav className="nav" aria-label="Điều hướng chính">
          {navItems.map((item) => (
            <NavLink key={item.to + item.label} to={item.to} end={item.to === '/'}>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main id="main-content" className="panel shell-main">
        <Outlet />
      </main>

      {isAuthenticated ? (
        <div className="panel session-panel">
          <p className="session-copy">
            Phiên đăng nhập: <strong>{user?.name || 'Người dùng chưa xác định'}</strong> ({ROLE_LABELS[user?.role] || 'Vai trò chưa xác định'})
          </p>
          <div className="actions">
            <button className="warn" onClick={logout} type="button" aria-label="Đăng xuất khỏi phiên hiện tại">
              Đăng xuất
            </button>
          </div>
        </div>
      ) : null}

      <footer className="app-footer">
        <span>MediReserve Frontend</span>
        <span>React + Vite + Vitest + Playwright</span>
      </footer>
    </div>
  )
}
