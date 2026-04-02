import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  cancelAppointmentApi,
  createAppointmentFromScheduleApi,
  getDoctorsApi,
  getMyAppointmentsApi,
  getSchedulesApi,
} from '../shared/api/patientAppointmentsApi'

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
  const [loadingSchedules, setLoadingSchedules] = useState(false)
  const [loadingAppointments, setLoadingAppointments] = useState(false)
  const [bookingScheduleId, setBookingScheduleId] = useState('')
  const [bookingNotes, setBookingNotes] = useState('')
  const [cancelReasonById, setCancelReasonById] = useState({})
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const doctorNameMap = useMemo(() => buildDoctorNameMap(doctors), [doctors])

  const loadSchedulesAndDoctors = useCallback(async () => {
    setLoadingSchedules(true)
    setError('')
    setMessage('')
    try {
      const [scheduleData, doctorData] = await Promise.all([
        getSchedulesApi(dateFilter ? { date: dateFilter } : {}),
        getDoctorsApi(),
      ])
      setDoctors(doctorData || [])
      const openSchedules = (scheduleData || []).filter((item) => item.status === 'open')
      setSchedules(openSchedules)
      setBookingScheduleId((previous) => {
        if (previous && openSchedules.some((item) => item._id === previous)) {
          return previous
        }
        return openSchedules[0]?._id || ''
      })
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Không tải được danh sách lịch khám.')
    } finally {
      setLoadingSchedules(false)
    }
  }, [dateFilter])

  const loadAppointments = useCallback(async () => {
    setLoadingAppointments(true)
    setError('')
    try {
      const data = await getMyAppointmentsApi()
      setAppointments(data || [])
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Không tải được danh sách lịch hẹn.')
    } finally {
      setLoadingAppointments(false)
    }
  }, [])

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

    setError('')
    setMessage('')
    try {
      await createAppointmentFromScheduleApi(selectedSchedule, bookingNotes)
      setMessage('Đặt lịch thành công.')
      setBookingNotes('')
      await Promise.all([loadSchedulesAndDoctors(), loadAppointments()])
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Đặt lịch thất bại.')
    }
  }

  const handleCancel = async (appointmentId) => {
    setError('')
    setMessage('')
    try {
      await cancelAppointmentApi(appointmentId, cancelReasonById[appointmentId] || '')
      setMessage('Hủy lịch thành công.')
      setCancelReasonById((prev) => ({ ...prev, [appointmentId]: '' }))
      await Promise.all([loadSchedulesAndDoctors(), loadAppointments()])
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Hủy lịch thất bại.')
    }
  }

  useEffect(() => {
    loadSchedulesAndDoctors()
    loadAppointments()
  }, [loadSchedulesAndDoctors, loadAppointments])

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
          />
          <button type="button" onClick={loadSchedulesAndDoctors}>
            {loadingSchedules ? 'Đang tải lịch...' : 'Tải lịch khám'}
          </button>
          <button className="secondary" type="button" onClick={loadAppointments}>
            {loadingAppointments ? 'Đang tải lịch hẹn...' : 'Tải lịch hẹn của tôi'}
          </button>
        </div>
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
          <button type="button" onClick={handleBook} disabled={!bookingScheduleId || schedules.length === 0}>
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
                    onChange={(event) =>
                      setCancelReasonById((prev) => ({
                        ...prev,
                        [appointment._id]: event.target.value,
                      }))
                    }
                    placeholder="Nhập lý do hủy (không bắt buộc)"
                  />
                  <div className="actions">
                    <button className="warn" type="button" onClick={() => handleCancel(appointment._id)}>
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
