import { httpClient } from '../shared/api/httpClient'

export function DashboardPage() {
  const handleHealthCheck = async () => {
    try {
      await httpClient.get('/')
      window.alert('Kiểm tra API thành công')
    } catch {
      window.alert('Kiểm tra API thất bại. Vui lòng xem lại VITE_API_BASE_URL')
    }
  }

  return (
    <section>
      <h1>Tổng quan (Cần đăng nhập)</h1>
      <p>Trang này yêu cầu đăng nhập và được dùng để xác nhận auth guard hoạt động.</p>
      <div className="actions">
        <button type="button" onClick={handleHealthCheck}>
          Kiểm tra kết nối API
        </button>
      </div>
    </section>
  )
}
