import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '../features/auth/useAuth'
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
import { getDepartmentsApi } from '../shared/api/catalogApi'
import { DateSelect } from '../shared/components/DateSelect'
import { ChatBox } from '../shared/components/ChatBox'

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

const createInitialPatientDetails = (user) => ({
  fullName: user?.name || '',
  email: user?.email || '',
  phone: user?.phone || '',
  dateOfBirth: '',
  gender: '',
  bloodType: '',
  address: user?.address?.street || '',
  symptoms: '',
  medicalHistory: '',
  allergies: '',
  reasonForVisit: '',
  insuranceProvider: '',
  insurancePolicyNumber: '',
  insuranceCoverage: '',
  insuranceValidUntil: '',
})

export function PatientPage() {
  const { user } = useAuth()
  const [departments, setDepartments] = useState([])
  const [dateFilter, setDateFilter] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('')
  const [availability, setAvailability] = useState(null)
  const [schedules, setSchedules] = useState([])
  const [appointments, setAppointments] = useState([])
  const [doctors, setDoctors] = useState([])
  const [syncing, setSyncing] = useState(false)
  const [mutating, setMutating] = useState(false)
  const [bookingScheduleId, setBookingScheduleId] = useState('')
  const [bookingNotes, setBookingNotes] = useState('')
  const [patientDetails, setPatientDetails] = useState(() => createInitialPatientDetails(user))
  const [cancelReasonById, setCancelReasonById] = useState({})
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [lastSyncedAt, setLastSyncedAt] = useState(null)
  const latestSyncRequestIdRef = useRef(0)

  const doctorNameMap = useMemo(() => buildDoctorNameMap(doctors), [doctors])
  const selectedDepartment = useMemo(
    () => departments.find((department) => department._id === departmentFilter) || null,
    [departments, departmentFilter],
  )
  const suggestedDates = useMemo(() => {
    if (!availability?.availableDateKeys?.length) return []
    if (!dateFilter) return availability.availableDateKeys.slice(0, 5)
    return availability.availableDateKeys.filter((date) => date >= dateFilter).slice(0, 5)
  }, [availability, dateFilter])

  const syncFromServer = useCallback(async ({ clearFeedback = true, reason = 'manual' } = {}) => {
    latestSyncRequestIdRef.current += 1
    const currentRequestId = latestSyncRequestIdRef.current

    setSyncing(true)
    setError('')
    if (clearFeedback) setMessage('')

    try {
      const snapshot = await fetchPatientBookingSnapshot({
        dateFilter,
        departmentFilter,
        getSchedules: getSchedulesApi,
        getDoctors: getDoctorsApi,
        getAppointments: getMyAppointmentsApi,
      })

      if (currentRequestId !== latestSyncRequestIdRef.current) {
        return
      }

      setDoctors(snapshot.doctors)
      setSchedules(snapshot.openSchedules)
      setAvailability(snapshot.availability)
      setAppointments(snapshot.appointments)
      setBookingScheduleId((previous) => resolveSelectedScheduleId(snapshot.openSchedules, previous))
      setLastSyncedAt(snapshot.fetchedAt)

      if (reason === 'post-mutation') {
        setMessage('Đã đồng bộ lại dữ liệu mới nhất từ máy chủ.')
      }
      // reason === 'booking-success': giữ nguyên message "đặt lịch thành công"
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Không thể đồng bộ dữ liệu từ máy chủ.')
    } finally {
      if (currentRequestId === latestSyncRequestIdRef.current) {
        setSyncing(false)
      }
    }
  }, [dateFilter, departmentFilter])

  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const data = await getDepartmentsApi()
        setDepartments(data || [])
      } catch {
        setDepartments([])
      }
    }

    loadDepartments()
  }, [])

  const handleBook = async () => {
    if (!bookingScheduleId) {
      setError('Vui lòng chọn một lịch khám trước khi đặt lịch.')
      return
    }

    if (!departmentFilter) {
      setError('Vui lòng chọn khoa trước khi đặt lịch.')
      return
    }

    if (!patientDetails.fullName.trim() || !patientDetails.phone.trim() || !patientDetails.reasonForVisit.trim()) {
      setError('Vui lòng nhập đầy đủ họ tên, số điện thoại và lý do khám trước khi đặt lịch.')
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
      await createAppointmentFromScheduleApi(selectedSchedule, bookingNotes, patientDetails, {
        departmentId: departmentFilter,
      })
      setMessage('Đặt lịch thành công! Lịch hẹn của bạn đang chờ bác sĩ xem xét và duyệt. Vui lòng theo dõi trạng thái ở phần Lịch hẹn của tôi bên dưới.')
      setBookingNotes('')
      setPatientDetails((current) => ({
        ...createInitialPatientDetails(user),
        fullName: current.fullName,
        email: current.email,
        phone: current.phone,
      }))
      await syncFromServer({ clearFeedback: false, reason: 'booking-success' })
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
    if (!user) return

    setPatientDetails((current) => ({
      ...current,
      fullName: current.fullName || user.name || '',
      email: current.email || user.email || '',
      phone: current.phone || user.phone || '',
      address: current.address || user.address?.street || '',
    }))
  }, [user])

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
          <DateSelect
            value={dateFilter}
            onChange={setDateFilter}
            disabled={isBusy}
            minYear={new Date().getFullYear()}
            maxYear={new Date().getFullYear() + 2}
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
        <p className="muted">Bệnh nhân cần nhập rõ thông tin chi tiết trước khi gửi lịch hẹn để bác sĩ nhận đúng dữ liệu tiếp nhận.</p>

        <label htmlFor="department-filter">Chọn khoa khám</label>
        <select
          id="department-filter"
          value={departmentFilter}
          onChange={(event) => {
            const nextDepartment = event.target.value
            setDepartmentFilter(nextDepartment)
            setBookingScheduleId('')
            setAvailability(null)
          }}
          disabled={isBusy}
        >
          <option value="">Chọn khoa phù hợp</option>
          {departments.map((department) => (
            <option key={department._id} value={department._id}>
              {department.name}
            </option>
          ))}
        </select>

        {departmentFilter ? (
          <div className="status-box" style={{ marginTop: '0.5rem' }}>
            {availability?.hasAnyAvailableDoctor ? (
              availability?.hasAvailabilityOnSelectedDate ? (
                <p className="muted">
                  {dateFilter
                    ? `Khoa ${selectedDepartment?.name || ''} hiện có bác sĩ trống trong ngày ${formatDate(dateFilter)}.`
                    : `Khoa ${selectedDepartment?.name || ''} có bác sĩ trống. Bạn có thể chọn một ngày phù hợp để đặt lịch.`}
                </p>
              ) : (
                <>
                  <p className="form-error">
                    {`Khoa ${selectedDepartment?.name || ''} không có bác sĩ trống trong ngày ${formatDate(dateFilter)}.`}
                  </p>
                  {suggestedDates.length > 0 ? (
                    <>
                      <p className="muted">Ngày còn lịch trống gần nhất:</p>
                      <div className="actions" style={{ flexWrap: 'wrap' }}>
                        {suggestedDates.map((date) => (
                          <button
                            key={date}
                            type="button"
                            onClick={() => setDateFilter(date)}
                            disabled={isBusy}
                          >
                            {formatDate(date)}
                          </button>
                        ))}
                      </div>
                    </>
                  ) : null}
                </>
              )
            ) : (
              <p className="form-error">
                {`Khoa ${selectedDepartment?.name || ''} hiện chưa có lịch bác sĩ trống trong các ngày sắp tới. Vui lòng liên hệ nhân viên để được hỗ trợ.`}
              </p>
            )}
          </div>
        ) : null}

        <label htmlFor="patient-full-name">Họ và tên</label>
        <input
          id="patient-full-name"
          value={patientDetails.fullName}
          onChange={(event) => setPatientDetails((current) => ({ ...current, fullName: event.target.value }))}
          disabled={isBusy}
          placeholder="Nguyễn Văn A"
        />

        <label htmlFor="patient-phone">Số điện thoại</label>
        <input
          id="patient-phone"
          value={patientDetails.phone}
          onChange={(event) => setPatientDetails((current) => ({ ...current, phone: event.target.value }))}
          disabled={isBusy}
          placeholder="09xxxxxxxx"
        />

        <label htmlFor="patient-email">Email</label>
        <input
          id="patient-email"
          type="email"
          value={patientDetails.email}
          onChange={(event) => setPatientDetails((current) => ({ ...current, email: event.target.value }))}
          disabled={isBusy}
          placeholder="email@example.com"
        />

        <label htmlFor="patient-dob">Ngày sinh</label>
        <DateSelect
          value={patientDetails.dateOfBirth}
          onChange={(v) => setPatientDetails((current) => ({ ...current, dateOfBirth: v }))}
          disabled={isBusy}
          minYear={1920}
          maxYear={new Date().getFullYear()}
        />

        <label htmlFor="patient-gender">Giới tính</label>
        <input
          id="patient-gender"
          value={patientDetails.gender}
          onChange={(event) => setPatientDetails((current) => ({ ...current, gender: event.target.value }))}
          disabled={isBusy}
          placeholder="Nam / Nữ / Khác"
        />

        <label htmlFor="patient-blood-type">Nhóm máu</label>
        <input
          id="patient-blood-type"
          value={patientDetails.bloodType}
          onChange={(event) => setPatientDetails((current) => ({ ...current, bloodType: event.target.value }))}
          disabled={isBusy}
          placeholder="Ví dụ: O+"
        />

        <label htmlFor="patient-address">Địa chỉ liên hệ</label>
        <textarea
          id="patient-address"
          rows="2"
          value={patientDetails.address}
          onChange={(event) => setPatientDetails((current) => ({ ...current, address: event.target.value }))}
          disabled={isBusy}
          placeholder="Nhập địa chỉ hiện tại"
        />

        <label htmlFor="patient-reason">Lý do khám</label>
        <textarea
          id="patient-reason"
          rows="3"
          value={patientDetails.reasonForVisit}
          onChange={(event) => setPatientDetails((current) => ({ ...current, reasonForVisit: event.target.value }))}
          disabled={isBusy}
          placeholder="Mô tả rõ triệu chứng chính và nhu cầu thăm khám"
        />

        <label htmlFor="patient-symptoms">Triệu chứng hiện tại</label>
        <textarea
          id="patient-symptoms"
          rows="3"
          value={patientDetails.symptoms}
          onChange={(event) => setPatientDetails((current) => ({ ...current, symptoms: event.target.value }))}
          disabled={isBusy}
          placeholder="Mỗi dòng hoặc phân tách bằng dấu phẩy"
        />

        <label htmlFor="patient-history">Tiền sử bệnh</label>
        <textarea
          id="patient-history"
          rows="3"
          value={patientDetails.medicalHistory}
          onChange={(event) => setPatientDetails((current) => ({ ...current, medicalHistory: event.target.value }))}
          disabled={isBusy}
          placeholder="Mỗi dòng hoặc phân tách bằng dấu phẩy"
        />

        <label htmlFor="patient-allergies">Dị ứng</label>
        <textarea
          id="patient-allergies"
          rows="2"
          value={patientDetails.allergies}
          onChange={(event) => setPatientDetails((current) => ({ ...current, allergies: event.target.value }))}
          disabled={isBusy}
          placeholder="Thuốc, thức ăn, tác nhân khác"
        />

        <label htmlFor="insurance-provider">Bảo hiểm - nhà cung cấp</label>
        <input
          id="insurance-provider"
          value={patientDetails.insuranceProvider}
          onChange={(event) => setPatientDetails((current) => ({ ...current, insuranceProvider: event.target.value }))}
          disabled={isBusy}
        />

        <label htmlFor="insurance-policy-number">Bảo hiểm - số hợp đồng</label>
        <input
          id="insurance-policy-number"
          value={patientDetails.insurancePolicyNumber}
          onChange={(event) => setPatientDetails((current) => ({ ...current, insurancePolicyNumber: event.target.value }))}
          disabled={isBusy}
        />

        <label htmlFor="insurance-coverage">Bảo hiểm - mức chi trả</label>
        <input
          id="insurance-coverage"
          value={patientDetails.insuranceCoverage}
          onChange={(event) => setPatientDetails((current) => ({ ...current, insuranceCoverage: event.target.value }))}
          disabled={isBusy}
        />

        <label htmlFor="insurance-valid-until">Bảo hiểm - hiệu lực đến</label>
        <DateSelect
          value={patientDetails.insuranceValidUntil}
          onChange={(v) => setPatientDetails((current) => ({ ...current, insuranceValidUntil: v }))}
          disabled={isBusy}
          minYear={new Date().getFullYear()}
          maxYear={new Date().getFullYear() + 20}
        />

        <label htmlFor="schedule-select">Chọn lịch khám còn trống</label>
        <select
          id="schedule-select"
          value={bookingScheduleId}
          onChange={(event) => setBookingScheduleId(event.target.value)}
        >
          {!departmentFilter ? <option value="">Chọn khoa trước để xem lịch khám</option> : null}
          {departmentFilter && schedules.length === 0 ? <option value="">Không có lịch khám phù hợp</option> : null}
          {schedules.map((schedule) => {
            const doctorId = getId(schedule.doctor)
            const doctorName = doctorNameMap[doctorId] || `Bác sĩ ${doctorId?.slice(-6) || 'N/A'}`
            const departmentName = schedule.department?.name || 'Chưa gán khoa'
            return (
              <option key={schedule._id} value={schedule._id}>
                {departmentName} - {formatDate(schedule.date)} - {schedule.slot} - {doctorName} (còn {Math.max((schedule.capacity || 0) - (schedule.bookedCount || 0), 0)} chỗ)
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
          <button
            type="button"
            onClick={handleBook}
            disabled={
              !bookingScheduleId ||
              schedules.length === 0 ||
              isBusy ||
              !departmentFilter
            }
          >
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
                <strong>Khoa:</strong> {appointment.department?.name || appointment.schedule?.department?.name || 'Chưa xác định'}
              </p>
              {appointment.patientDetails?.reasonForVisit ? (
                <p>
                  <strong>Lý do khám:</strong> {appointment.patientDetails.reasonForVisit}
                </p>
              ) : null}
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

      <div className="panel">
        <h2>Chat hỗ trợ</h2>
        <p className="muted">Nhắn tin trực tiếp với nhân viên hỗ trợ của bệnh viện.</p>
        {(user?.id || user?._id) ? (
          <ChatBox roomId={user.id || user._id} title="Chat với nhân viên hỗ trợ" />
        ) : (
          <p className="muted">Vui lòng đăng nhập để sử dụng tính năng chat.</p>
        )}
      </div>
    </section>
  )
}
