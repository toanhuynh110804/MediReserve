import { Link } from 'react-router-dom'
import { useAuth } from '../features/auth/useAuth'
import { ROLE_HOME_PATH, ROLE_LABELS } from '../shared/constants/roles'
import { PageHero } from '../shared/components/PageHero'

export function HomePage() {
  const { isAuthenticated, user } = useAuth()

  if (isAuthenticated) {
    const rolePath = ROLE_HOME_PATH[user?.role]
    const roleLabel = ROLE_LABELS[user?.role] || 'người dùng'

    return (
      <section>
        <PageHero
          eyebrow="MediReserve"
          title={`Chào mừng, ${user?.name || roleLabel}!`}
          description={`Bạn đã đăng nhập với vai trò ${roleLabel}. Truy cập khu vực làm việc của bạn bên dưới.`}
          stats={[
            { label: 'Vai trò', value: ROLE_LABELS[user?.role] || '—' },
            { label: 'Tài khoản', value: user?.email || '—' },
          ]}
        />
        {rolePath ? (
          <div className="panel accent-panel" style={{ marginTop: '1rem' }}>
            <h2>Khu vực của bạn</h2>
            <p className="muted">Nhấn vào đây để đến khu vực làm việc dành cho {roleLabel}.</p>
            <div className="actions">
              <Link to={rolePath}>Đi đến khu vực của tôi</Link>
            </div>
          </div>
        ) : null}
      </section>
    )
  }

  return (
    <section>
      <PageHero
        eyebrow="MediReserve"
        title="Cổng truy cập hệ thống đặt lịch và điều phối khám bệnh"
        description="Trang này dành cho khách truy cập và người dùng chưa đăng nhập. Sau khi đăng nhập, mỗi vai trò sẽ được đưa vào đúng khu vực làm việc riêng của mình."
        stats={[
          { label: 'Khách truy cập', value: 'Public' },
          { label: 'Đăng nhập', value: 'Bắt buộc' },
          { label: 'Điều hướng', value: 'Theo vai trò' },
        ]}
      />

      <div className="panel-grid two-columns">
        <div className="panel accent-panel">
          <h2>Truy cập hệ thống</h2>
          <p className="muted">Đăng nhập nếu bạn đã có tài khoản hoặc đăng ký tài khoản bệnh nhân mới.</p>
          <div className="actions">
            <Link to="/login">Đăng nhập</Link>
            <Link to="/register" className="secondary">Tạo tài khoản</Link>
          </div>
        </div>

        <div className="panel soft-panel">
          <h2>Các khu vực sau đăng nhập</h2>
          <ul className="feature-list">
            <li>Admin: quản trị bác sĩ, khoa phòng, lịch làm việc và phân quyền.</li>
            <li>Bác sĩ: xem lịch làm việc, xử lý lịch hẹn và lập hồ sơ khám.</li>
            <li>Nhân viên: tiếp nhận bệnh nhân và tạo lịch khám tại quầy.</li>
          </ul>
        </div>
      </div>
    </section>
  )
}
