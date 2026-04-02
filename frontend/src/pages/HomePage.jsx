import { Link } from 'react-router-dom'
import { PageHero } from '../shared/components/PageHero'

export function HomePage() {
  return (
    <section>
      <PageHero
        eyebrow="MediReserve Workspace"
        title="Điều phối khám chữa bệnh trên một giao diện thống nhất"
        description="Frontend hiện đã nối toàn bộ luồng chính với backend thật: xác thực, bệnh nhân, bác sĩ, thanh toán, file, quản trị và vận hành nội bộ."
        stats={[
          { label: 'Tính năng frontend', value: '11/11' },
          { label: 'Unit tests', value: '119' },
          { label: 'Luồng E2E mục tiêu', value: '3' },
        ]}
      />

      <div className="panel-grid two-columns">
        <div className="panel accent-panel">
          <h2>Điểm vào nhanh</h2>
          <p className="muted">Chọn luồng làm việc phù hợp với vai trò của bạn.</p>
          <div className="actions">
            <Link to="/login">Đăng nhập</Link>
            <Link to="/register" className="secondary">Tạo tài khoản</Link>
            <Link to="/tong-quan" className="secondary">Xem tổng quan</Link>
          </div>
        </div>

        <div className="panel soft-panel">
          <h2>Những gì đã sẵn sàng</h2>
          <ul className="feature-list">
            <li>Đặt và hủy lịch với đồng bộ transaction-safe.</li>
            <li>Workspace bác sĩ với hồ sơ y tế, đơn thuốc và realtime.</li>
            <li>Quản trị danh mục, người dùng, nhân sự và role nội bộ.</li>
          </ul>
        </div>
      </div>
    </section>
  )
}
