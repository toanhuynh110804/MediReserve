import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuth } from '../features/auth/useAuth'
import { getDoctorSchedulesApi, getDoctorAppointmentsApi, updateAppointmentStatusApi } from '../shared/api/doctorApi'
import { subscribeAppointmentEvents } from '../shared/realtime/socketService'
import { DoctorScheduleCard } from '../features/doctor/DoctorScheduleCard'
import { AppointmentActionRow } from '../features/doctor/AppointmentActionRow'

export function DoctorPage() {
  const { user } = useAuth()
  const [schedules, setSchedules] = useState([])
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const latestSyncRequestIdRef = useRef(0)

  const doctorId = user?._id || user?.id

  const fetchData = useCallback(async () => {
    if (!doctorId) return

    latestSyncRequestIdRef.current += 1
    const currentRequestId = latestSyncRequestIdRef.current

    setLoading(true)
    setError('')
    setMessage('')

    try {
      const [schedulesData, appointmentsData] = await Promise.all([
        getDoctorSchedulesApi(doctorId),
        getDoctorAppointmentsApi(doctorId),
      ])

      if (currentRequestId !== latestSyncRequestIdRef.current) {
        return
      }

      setSchedules(schedulesData)
      setAppointments(appointmentsData)
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải dữ liệu.')
    } finally {
      if (currentRequestId === latestSyncRequestIdRef.current) {
        setLoading(false)
      }
    }
  }, [doctorId])

  const handleStatusChange = useCallback(
    async (appointmentId, data) => {
      setUpdating(true)
      setError('')
      setMessage('')

      try {
        await updateAppointmentStatusApi(appointmentId, data)
        setMessage('Cập nhật trạng thái thành công. Đang tải lại...')
        await fetchData()
      } catch (err) {
        setError(err.response?.data?.message || 'Cập nhật thất bại.')
      } finally {
        setUpdating(false)
      }
    },
    [fetchData],
  )

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    const unsubscribe = subscribeAppointmentEvents(() => {
      setMessage('Phát hiện appointment mới từ bệnh nhân. Đang làm mới...')
      fetchData()
    })

    return unsubscribe
  }, [fetchData])

  const filteredAppointments = appointments.filter((apt) => {
    if (statusFilter === 'all') return true
    return apt.status === statusFilter
  })

  return (
    <section>
      <h1>Khu vực bác sĩ</h1>
      <p>Quản lý lịch làm việc và lịch hẹn bệnh nhân của bạn.</p>

      {error && <p className="form-error">{error}</p>}
      {message && <p className="muted">{message}</p>}

      <div className="actions">
        <button type="button" onClick={fetchData} disabled={loading || updating}>
          {loading ? 'Đang tải...' : 'Làm mới'}
        </button>
      </div>

      <div className="panel">
        <h2>Lịch làm việc của tôi</h2>
        {schedules.length === 0 ? (
          <p className="muted">Chưa có lịch làm việc nào.</p>
        ) : (
          <div>
            {schedules.map((schedule) => (
              <DoctorScheduleCard key={schedule._id} schedule={schedule} />
            ))}
          </div>
        )}
      </div>

      <div className="panel">
        <h2>Lịch hẹn của bệnh nhân</h2>

        <label htmlFor="status-filter">Lọc theo trạng thái</label>
        <select
          id="status-filter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          disabled={updating}
        >
          <option value="all">Tất cả ({appointments.length})</option>
          <option value="pending">Chờ phê duyệt ({appointments.filter((a) => a.status === 'pending').length})</option>
          <option value="confirmed">Đã xác nhận ({appointments.filter((a) => a.status === 'confirmed').length})</option>
          <option value="completed">Hoàn thành ({appointments.filter((a) => a.status === 'completed').length})</option>
          <option value="cancelled">Bị hủy ({appointments.filter((a) => a.status === 'cancelled').length})</option>
        </select>

        {filteredAppointments.length === 0 ? (
          <p className="muted">Không có lịch hẹn nào.</p>
        ) : (
          <table className="appointments-table">
            <thead>
              <tr>
                <th>ID lịch hẹn</th>
                <th>Bệnh nhân</th>
                <th>Ngày giờ</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.map((appointment) => (
                <AppointmentActionRow
                  key={appointment._id}
                  appointment={appointment}
                  onStatusChange={handleStatusChange}
                  disabled={updating}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  )
}
