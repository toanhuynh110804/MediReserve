import { useState } from 'react'
import { httpClient } from '../shared/api/httpClient'
import { PageHero } from '../shared/components/PageHero'
import { StateNotice } from '../shared/components/StateNotice'

export function DashboardPage() {
  const [healthState, setHealthState] = useState({ tone: 'info', message: 'Chưa chạy kiểm tra kết nối.' })
  const [checking, setChecking] = useState(false)

  const handleHealthCheck = async () => {
    setChecking(true)
    try {
      await httpClient.get('/')
      setHealthState({ tone: 'success', message: 'Kiểm tra API thành công. Backend phản hồi bình thường.' })
    } catch {
      setHealthState({ tone: 'error', message: 'Kiểm tra API thất bại. Vui lòng xem lại VITE_API_BASE_URL.' })
    } finally {
      setChecking(false)
    }
  }

  return (
    <section>
      <PageHero
        eyebrow="System Health"
        title="Tổng quan hệ thống"
        description="Kiểm tra nhanh khả năng kết nối API và dùng trang này như điểm vào kỹ thuật trước khi thao tác các module nghiệp vụ."
        stats={[
          { label: 'Môi trường API', value: 'Live URL' },
          { label: 'Realtime', value: 'Socket.IO' },
          { label: 'Auth', value: 'JWT' },
        ]}
      />
      <div className="actions">
        <button type="button" onClick={handleHealthCheck} disabled={checking}>
          {checking ? 'Đang kiểm tra...' : 'Kiểm tra kết nối API'}
        </button>
      </div>

      <StateNotice tone={healthState.tone} title="Trạng thái kiểm tra">
        {healthState.message}
      </StateNotice>
    </section>
  )
}
