import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  cancelAppointmentApi,
  createAppointmentFromScheduleApi,
  getDoctorsApi,
  getMyAppointmentsApi,
  getSchedulesApi,
} from '../shared/api/patientAppointmentsApi'
import {
  fetchPatientBookingSnapshot,
  resolveSelectedScheduleId,
} from '../features/patient/transactionSync'
import { subscribeAppointmentEvents } from '../shared/realtime/socketService'

function formatDate(value) {
  if (!value) return 'Không xác định'
  return new Date(value).toLocaleDateString('vi-VN')
}

function buildDoctorNameMap(doctors) {
  return doctors.reduce((acc, doctor) => {
    const id = doctor?._id
    if (!id) return acc
    const name = doctor?.user?.name || `Bác sĩ ${id.slice(-6)}`
    acc[id] = name
    return acc
  }, {})
}

function getId(value) {
  if (!value) return undefined
  if (typeof value === 'string') return value
  if (typeof value === 'object' && value._id) return value._id
  return undefined
}

export function PatientPage() {
  const [dateFilter, setDateFilter] = useState('')
  const [schedules, setSchedules] = useState([])
  const [appointments, setAppointments] = useState([])
  const [doctors, setDoctors] = useState([])
  const [syncing, setSyncing] = useState(false)
  const [mutating, setMutating] = useState(false)
  const [bookingScheduleId, setBookingScheduleId] = useState('')
  const [bookingNotes, setBookingNotes] = useState('')
  const [cancelReasonById, setCancelReasonById] = useState({})
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [lastSyncedAt, setLastSyncedAt] = useState(null)
  const latestSyncRequestIdRef = useRef(0)

  const doctorNameMap = useMemo(() => buildDoctorNameMap(doctors), [doctors])

  const syncFromServer = useCallback(async ({ clearFeedback = true, reason = 'manual' } = {}) => {
    latestSyncRequestIdRef.current += 1
    const currentRequestId = latestSyncRequestIdRef.current

    setSyncing(true)
    setError('')
    if (clearFeedback) setMessage('')

    try {
      const snapshot = await fetchPatientBookingSnapshot({
        dateFilter,
        getSchedules: getSchedulesApi,
        getDoctors: getDoctorsApi,
        getAppointments: getMyAppointmentsApi,
      })

      if (currentRequestId !== latestSyncRequestIdRef.current) {
        return
      }

      setDoctors(snapshot.doctors)
      setSchedules(snapshot.openSchedules)
      setAppointments(snapshot.appointments)
      setBookingScheduleId((previous) => resolveSelectedScheduleId(snapshot.openSchedules, previous))
      setLastSyncedAt(snapshot.fetchedAt)

      if (reason === 'post-mutation') {
        setMessage('Đã đồng bộ lại dữ liệu mới nhất từ máy chủ.')
      }
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Không thể đồng bộ dữ liệu từ máy chủ.')
    } finally {
      if (currentRequestId === latestSyncRequestIdRef.current) {
        setSyncing(false)
      }
    }
  }, [dateFilter])

  const handleBook = async () => {
    if (!bookingScheduleId) {
      setError('Vui lòng chọn một lịch khám trước khi đặt lịch.')
      return
    }

    const selectedSchedule = schedules.find((item) => item._id === bookingScheduleId)
    if (!selectedSchedule) {
      setError('Lịch khám đã chọn không còn khả dụng. Vui lòng tải lại.')
      return
    }

    setMutating(true)
    setError('')
    setMessage('')
    try {
      await createAppointmentFromScheduleApi(selectedSchedule, bookingNotes)
      setMessage('Đặt lịch thành công. Đang đồng bộ dữ liệu...')
      setBookingNotes('')
      await syncFromServer({ clearFeedback: false, reason: 'post-mutation' })
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Đặt lịch thất bại.')
    } finally {
      setMutating(false)
    }
  }

  const handleCancel = async (appointmentId) => {
    setMutating(true)
    setError('')
    setMessage('')
    try {
      await cancelAppointmentApi(appointmentId, cancelReasonById[appointmentId] || '')
      setMessage('Hủy lịch thành công. Đang đồng bộ dữ liệu...')
      setCancelReasonById((prev) => ({ ...prev, [appointmentId]: '' }))
      await syncFromServer({ clearFeedback: false, reason: 'post-mutation' })
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Hủy lịch thất bại.')
    } finally {
      setMutating(false)
    }
  }

  useEffect(() => {
    syncFromServer({ clearFeedback: true, reason: 'filter-change' })
  }, [syncFromServer])

  useEffect(() => {
    const unsubscribe = subscribeAppointmentEvents(() => {
      setMessage('Phát hiện thay đổi thời gian thực. Đang đồng bộ dữ liệu...')
      void syncFromServer({ clearFeedback: false, reason: 'realtime-event' })
    })

    return unsubscribe
  }, [syncFromServer])

  const isBusy = syncing || mutating

  return (
    <section>
      <h1>Khu vực bệnh nhân</h1>
      <p>Tại đây bạn có thể tải lịch khám thật từ hệ thống, đặt lịch và hủy lịch hẹn.</p>

      <div className="status-box">
        <label htmlFor="date-filter">Lọc lịch theo ngày</label>
        <div className="actions">
          <input
            id="date-filter"
            type="date"
            value={dateFilter}
            onChange={(event) => setDateFilter(event.target.value)}
            disabled={isBusy}
          />
          <button type="button" onClick={() => syncFromServer({ clearFeedback: true, reason: 'manual' })} disabled={isBusy}>
            {syncing ? 'Đang đồng bộ...' : 'Đồng bộ dữ liệu'}
          </button>
        </div>
        {lastSyncedAt ? <p className="muted">Lần đồng bộ gần nhất: {new Date(lastSyncedAt).toLocaleTimeString('vi-VN')}</p> : null}
      </div>

      {error ? <p className="form-error">{error}</p> : null}
      {message ? <p className="muted">{message}</p> : null}

      <div className="panel">
        <h2>Đặt lịch khám</h2>
        <p className="muted">Dữ liệu lịch khám lấy trực tiếp từ API backend.</p>

        <label htmlFor="schedule-select">Chọn lịch khám còn trống</label>
        <select
          id="schedule-select"
          value={bookingScheduleId}
          onChange={(event) => setBookingScheduleId(event.target.value)}
        >
          {schedules.length === 0 ? <option value="">Không có lịch khám phù hợp</option> : null}
          {schedules.map((schedule) => {
            const doctorId = getId(schedule.doctor)
            const doctorName = doctorNameMap[doctorId] || `Bác sĩ ${doctorId?.slice(-6) || 'N/A'}`
            return (
              <option key={schedule._id} value={schedule._id}>
                {formatDate(schedule.date)} - {schedule.slot} - {doctorName} (còn {Math.max((schedule.capacity || 0) - (schedule.bookedCount || 0), 0)} chỗ)
              </option>
            )
          })}
        </select>

        <label htmlFor="booking-notes">Ghi chú cho lịch hẹn</label>
        <input
          id="booking-notes"
          value={bookingNotes}
          onChange={(event) => setBookingNotes(event.target.value)}
          placeholder="Ví dụ: đau đầu kéo dài 2 ngày"
        />

        <div className="actions">
          <button type="button" onClick={handleBook} disabled={!bookingScheduleId || schedules.length === 0 || isBusy}>
            Đặt lịch ngay
          </button>
        </div>
      </div>

      <div className="panel">
        <h2>Lịch hẹn của tôi</h2>
        {appointments.length === 0 ? <p>Chưa có lịch hẹn nào. Hãy tải dữ liệu hoặc đặt lịch mới.</p> : null}

        {appointments.map((appointment) => {
          const doctorId = getId(appointment.doctor)
          const doctorName = doctorNameMap[doctorId] || `Bác sĩ ${doctorId?.slice(-6) || 'N/A'}`
          const status = appointment.status || 'pending'
          const canCancel = status !== 'cancelled' && status !== 'completed'

          return (
            <div key={appointment._id} className="status-box">
              <p>
                <strong>Mã lịch hẹn:</strong> {appointment._id}
              </p>
              <p>
                <strong>Bác sĩ:</strong> {doctorName}
              </p>
              <p>
                <strong>Ngày:</strong> {formatDate(appointment.date)} | <strong>Khung giờ:</strong> {appointment.time}
              </p>
              <p>
                <strong>Trạng thái:</strong> {status}
              </p>

              {canCancel ? (
                <>
                  <label htmlFor={`cancel-${appointment._id}`}>Lý do hủy</label>
                  <input
                    id={`cancel-${appointment._id}`}
                    value={cancelReasonById[appointment._id] || ''}
                    disabled={isBusy}
                    onChange={(event) =>
                      setCancelReasonById((prev) => ({
                        ...prev,
                        [appointment._id]: event.target.value,
                      }))
                    }
                    placeholder="Nhập lý do hủy (không bắt buộc)"
                  />
                  <div className="actions">
                    <button className="warn" type="button" onClick={() => handleCancel(appointment._id)} disabled={isBusy}>
                      Hủy lịch hẹn
                    </button>
                  </div>
                </>
              ) : null}
            </div>
          )
        })}
      </div>
    </section>
  )
}
