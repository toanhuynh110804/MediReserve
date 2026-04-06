import { useCallback, useEffect, useMemo, useState } from 'react'
import { getDepartmentsApi, getSpecialtiesApi } from '../../shared/api/catalogApi'
import { DateSelect } from '../../shared/components/DateSelect'
import {
  createRoomApi,
  createScheduleApi,
  deleteRoomApi,
  deleteScheduleApi,
  getAdminAppointmentsApi,
  getAdminDoctorsApi,
  getAdminSchedulesApi,
  getRoomsApi,
  updateRoomApi,
  updateScheduleApi,
} from '../../shared/api/adminWorkspaceApi'

const INITIAL_ROOM_FORM = {
  code: '',
  type: 'general',
  department: '',
  capacity: 1,
  status: 'available',
  note: '',
}

const INITIAL_SCHEDULE_FORM = {
  doctor: '',
  room: '',
  department: '',
  date: '',
  startTime: '08:00',
  endTime: '11:00',
  capacity: 1,
  status: 'open',
}

const LEGACY_SLOT_MAP = {
  morning: { startTime: '08:00', endTime: '11:00' },
  afternoon: { startTime: '13:00', endTime: '17:00' },
  evening: { startTime: '17:30', endTime: '20:30' },
}

const TIME_OPTIONS = (() => {
  const options = []
  for (let h = 6; h <= 22; h++) {
    for (const m of [0, 30]) {
      if (h === 22 && m === 30) break
      const hh = String(h).padStart(2, '0')
      const mm = String(m).padStart(2, '0')
      options.push(`${hh}:${mm}`)
    }
  }
  return options
})()

function toDateInput(value) {
  if (!value) return ''
  return String(value).slice(0, 10)
}

function buildRoomPayload(formState) {
  return {
    code: formState.code.trim(),
    type: formState.type.trim(),
    department: formState.department,
    capacity: Number(formState.capacity || 1),
    status: formState.status,
    note: formState.note.trim(),
  }
}

function buildSchedulePayload(formState) {
  if (!formState.startTime || !formState.endTime) {
    throw new Error('Vui lòng chọn đầy đủ giờ bắt đầu và giờ kết thúc.')
  }

  if (formState.startTime >= formState.endTime) {
    throw new Error('Giờ kết thúc phải lớn hơn giờ bắt đầu.')
  }

  return {
    doctor: formState.doctor,
    room: formState.room,
    department: formState.department || undefined,
    date: formState.date,
    slot: `${formState.startTime}-${formState.endTime}`,
    capacity: Number(formState.capacity || 1),
    status: formState.status,
  }
}

function parseScheduleSlot(slot = '') {
  const legacyRange = LEGACY_SLOT_MAP[slot]
  if (legacyRange) {
    return legacyRange
  }

  const [rawStart = '', rawEnd = ''] = String(slot).split('-')
  const startTime = rawStart.trim()
  const endTime = rawEnd.trim()
  const isValidTime = (value) => /^\d{2}:\d{2}$/.test(value)

  if (isValidTime(startTime) && isValidTime(endTime)) {
    return { startTime, endTime }
  }

  return { startTime: INITIAL_SCHEDULE_FORM.startTime, endTime: INITIAL_SCHEDULE_FORM.endTime }
}

function renderScheduleSlot(slot = '') {
  const { startTime, endTime } = parseScheduleSlot(slot)
  return `${startTime} - ${endTime}`
}

function renderScheduleStatus(status = '') {
  const statusMap = {
    open: 'Đang làm việc',
    closed: 'Nghỉ trưa',
    cancelled: 'Không làm việc',
  }

  return statusMap[status] || status
}

function getRoomFormState(room) {
  if (!room) return INITIAL_ROOM_FORM
  return {
    code: room.code || '',
    type: room.type || 'general',
    department: room.department?._id || room.department || '',
    capacity: room.capacity ?? 1,
    status: room.status || 'available',
    note: room.note || '',
  }
}

function getScheduleFormState(schedule) {
  if (!schedule) return INITIAL_SCHEDULE_FORM
  const parsedSlot = parseScheduleSlot(schedule.slot)
  return {
    doctor: schedule.doctor?._id || schedule.doctor || '',
    room: schedule.room?._id || schedule.room || '',
    department: schedule.department?._id || schedule.department || '',
    date: toDateInput(schedule.date),
    startTime: parsedSlot.startTime,
    endTime: parsedSlot.endTime,
    capacity: schedule.capacity ?? 1,
    status: schedule.status || 'open',
  }
}

function getPatientName(appointment) {
  return appointment.patient?.user?.name || appointment.patient?.name || appointment.patient?._id || 'N/A'
}

function getDoctorName(doctor) {
  return doctor.user?.name || doctor.user?.email || doctor._id || 'N/A'
}

export function AdminOperationsPanel() {
  const [activeTab, setActiveTab] = useState('rooms')

  const [doctors, setDoctors] = useState([])
  const [rooms, setRooms] = useState([])
  const [schedules, setSchedules] = useState([])
  const [appointments, setAppointments] = useState([])
  const [departments, setDepartments] = useState([])
  const [specialties, setSpecialties] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [editingRoom, setEditingRoom] = useState(null)
  const [editingSchedule, setEditingSchedule] = useState(null)
  const [roomForm, setRoomForm] = useState(INITIAL_ROOM_FORM)
  const [scheduleForm, setScheduleForm] = useState(INITIAL_SCHEDULE_FORM)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const [doctorData, roomData, scheduleData, appointmentData, departmentData, specialtyData] = await Promise.all([
        getAdminDoctorsApi(),
        getRoomsApi(),
        getAdminSchedulesApi(),
        getAdminAppointmentsApi(),
        getDepartmentsApi(),
        getSpecialtiesApi(),
      ])

      setDoctors(doctorData)
      setRooms(roomData)
      setSchedules(scheduleData)
      setAppointments(appointmentData)
      setDepartments(departmentData)
      setSpecialties(specialtyData)
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Không thể tải workspace quản trị.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const departmentOptions = useMemo(() => departments.map((item) => ({ value: item._id, label: item.name })), [departments])
  const specialtyOptions = useMemo(() => specialties.map((item) => ({ value: item._id, label: item.name })), [specialties])
  const roomOptions = useMemo(() => rooms.map((item) => ({ value: item._id, label: `${item.code} - ${item.department?.name || 'N/A'}` })), [rooms])
  const doctorOptions = useMemo(() => doctors.map((item) => ({ value: item._id, label: getDoctorName(item) })), [doctors])

  const resetRoomForm = () => {
    setEditingRoom(null)
    setRoomForm(INITIAL_ROOM_FORM)
  }

  const resetScheduleForm = () => {
    setEditingSchedule(null)
    setScheduleForm(INITIAL_SCHEDULE_FORM)
  }

  const handleRoomSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')

    try {
      const payload = buildRoomPayload(roomForm)
      if (editingRoom?._id) {
        await updateRoomApi(editingRoom._id, payload)
        setMessage('Đã cập nhật phòng.')
      } else {
        await createRoomApi(payload)
        setMessage('Đã tạo phòng mới.')
      }
      resetRoomForm()
      await loadData()
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Không thể lưu phòng.')
    } finally {
      setSaving(false)
    }
  }

  const handleScheduleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')

    try {
      const payload = buildSchedulePayload(scheduleForm)
      if (editingSchedule?._id) {
        await updateScheduleApi(editingSchedule._id, payload)
        setMessage('Đã cập nhật lịch làm việc.')
      } else {
        await createScheduleApi(payload)
        setMessage('Đã tạo lịch làm việc mới.')
      }
      resetScheduleForm()
      await loadData()
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message || 'Không thể lưu lịch làm việc.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (type, itemId) => {
    setSaving(true)
    setError('')
    setMessage('')

    try {
      if (type === 'room') {
        await deleteRoomApi(itemId)
        if (editingRoom?._id === itemId) resetRoomForm()
        setMessage('Đã xóa phòng.')
      }
      if (type === 'schedule') {
        await deleteScheduleApi(itemId)
        if (editingSchedule?._id === itemId) resetScheduleForm()
        setMessage('Đã xóa lịch làm việc.')
      }
      await loadData()
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Không thể xóa dữ liệu.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section>
      <h1>Điều phối hệ thống</h1>
      <p>Admin quản lý phòng, lịch làm việc và giám sát toàn bộ lịch hẹn.</p>

      {error && <p className="form-error">{error}</p>}
      {message && <p className="muted">{message}</p>}

      <div className="actions" style={{ flexWrap: 'wrap', marginBottom: '1rem' }}>
        <button type="button" onClick={() => setActiveTab('rooms')} disabled={loading || saving} style={activeTab === 'rooms' ? { backgroundColor: '#0f766e', color: '#fff' } : undefined}>Phòng</button>
        <button type="button" onClick={() => setActiveTab('schedules')} disabled={loading || saving} style={activeTab === 'schedules' ? { backgroundColor: '#0f766e', color: '#fff' } : undefined}>Lịch làm việc</button>
        <button type="button" onClick={() => setActiveTab('appointments')} disabled={loading || saving} style={activeTab === 'appointments' ? { backgroundColor: '#0f766e', color: '#fff' } : undefined}>Toàn bộ lịch hẹn</button>
        <button type="button" onClick={loadData} disabled={loading || saving}>{loading ? 'Đang tải...' : 'Làm mới'}</button>
      </div>

      {activeTab === 'rooms' && (
        <>
          <div className="panel">
            <h2>Quản lý phòng</h2>
            {rooms.length === 0 ? (
              <p className="muted">Chưa có phòng nào.</p>
            ) : (
              <table className="appointments-table">
                <thead>
                  <tr>
                    <th>Mã phòng</th>
                    <th>Khoa</th>
                    <th>Loại</th>
                    <th>Trạng thái</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {rooms.map((room) => (
                    <tr key={room._id}>
                      <td>{room.code}</td>
                      <td>{room.department?.name || 'N/A'}</td>
                      <td>{room.type}</td>
                      <td>{room.status}</td>
                      <td>
                        <div className="actions" style={{ flexDirection: 'column', gap: '0.5rem' }}>
                          <button type="button" onClick={() => { setEditingRoom(room); setRoomForm(getRoomFormState(room)); }} disabled={saving}>Chỉnh sửa</button>
                          <button type="button" onClick={() => handleDelete('room', room._id)} disabled={saving}>Xóa</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <form className="panel" onSubmit={handleRoomSubmit}>
            <h2>{editingRoom ? 'Cập nhật phòng' : 'Tạo phòng mới'}</h2>
            <label htmlFor="room-code">Mã phòng</label>
            <input id="room-code" value={roomForm.code} onChange={(event) => setRoomForm((current) => ({ ...current, code: event.target.value }))} disabled={saving} required />
            <label htmlFor="room-type">Loại phòng</label>
            <input id="room-type" value={roomForm.type} onChange={(event) => setRoomForm((current) => ({ ...current, type: event.target.value }))} disabled={saving} required />
            <label htmlFor="room-department">Khoa</label>
            <select id="room-department" value={roomForm.department} onChange={(event) => setRoomForm((current) => ({ ...current, department: event.target.value }))} disabled={saving} required>
              <option value="">Chọn khoa</option>
              {departmentOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
            <label htmlFor="room-capacity">Sức chứa</label>
            <input id="room-capacity" type="number" min="1" value={roomForm.capacity} onChange={(event) => setRoomForm((current) => ({ ...current, capacity: event.target.value }))} disabled={saving} />
            <label htmlFor="room-status">Trạng thái</label>
            <select id="room-status" value={roomForm.status} onChange={(event) => setRoomForm((current) => ({ ...current, status: event.target.value }))} disabled={saving}>
              <option value="available">available</option>
              <option value="unavailable">unavailable</option>
            </select>
            <label htmlFor="room-note">Ghi chú</label>
            <textarea id="room-note" rows="3" value={roomForm.note} onChange={(event) => setRoomForm((current) => ({ ...current, note: event.target.value }))} disabled={saving} />
            <div className="actions">
              <button type="submit" disabled={saving}>{saving ? 'Đang lưu...' : editingRoom ? 'Lưu cập nhật' : 'Tạo phòng'}</button>
              <button type="button" onClick={resetRoomForm} disabled={saving}>Bỏ chọn</button>
            </div>
          </form>
        </>
      )}

      {activeTab === 'schedules' && (
        <>
          <div className="panel">
            <h2>Quản lý lịch làm việc bác sĩ</h2>
            {schedules.length === 0 ? (
              <p className="muted">Chưa có lịch làm việc nào.</p>
            ) : (
              <table className="appointments-table">
                <thead>
                  <tr>
                    <th>Bác sĩ</th>
                    <th>Ngày</th>
                    <th>Khung giờ</th>
                    <th>Phòng</th>
                    <th>Trạng thái</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {schedules.map((schedule) => (
                    <tr key={schedule._id}>
                      <td>{schedule.doctor?.user?.name || schedule.doctor?._id || 'N/A'}</td>
                      <td>{toDateInput(schedule.date)}</td>
                      <td>{renderScheduleSlot(schedule.slot)}</td>
                      <td>{schedule.room?.code || schedule.room?.roomNumber || 'N/A'}</td>
                      <td>{renderScheduleStatus(schedule.status)}</td>
                      <td>
                        <div className="actions" style={{ flexDirection: 'column', gap: '0.5rem' }}>
                          <button type="button" onClick={() => { setEditingSchedule(schedule); setScheduleForm(getScheduleFormState(schedule)); }} disabled={saving}>Chỉnh sửa</button>
                          <button type="button" onClick={() => handleDelete('schedule', schedule._id)} disabled={saving}>Xóa</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <form className="panel" onSubmit={handleScheduleSubmit}>
            <h2>{editingSchedule ? 'Cập nhật lịch làm việc' : 'Tạo lịch làm việc mới'}</h2>
            <label htmlFor="schedule-doctor">Bác sĩ</label>
            <select id="schedule-doctor" value={scheduleForm.doctor} onChange={(event) => setScheduleForm((current) => ({ ...current, doctor: event.target.value }))} disabled={saving} required>
              <option value="">Chọn bác sĩ</option>
              {doctorOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
            <label htmlFor="schedule-room">Phòng</label>
            <select id="schedule-room" value={scheduleForm.room} onChange={(event) => setScheduleForm((current) => ({ ...current, room: event.target.value }))} disabled={saving} required>
              <option value="">Chọn phòng</option>
              {roomOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
            <label htmlFor="schedule-department">Khoa</label>
            <select id="schedule-department" value={scheduleForm.department} onChange={(event) => setScheduleForm((current) => ({ ...current, department: event.target.value }))} disabled={saving}>
              <option value="">Chọn khoa</option>
              {departmentOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
            <label htmlFor="schedule-date">Ngày làm việc</label>
            <DateSelect
              value={scheduleForm.date}
              onChange={(v) => setScheduleForm((current) => ({ ...current, date: v }))}
              disabled={saving}
              minYear={new Date().getFullYear() - 1}
              maxYear={new Date().getFullYear() + 2}
            />
            <label htmlFor="schedule-start-time">Từ giờ</label>
            <select
              id="schedule-start-time"
              value={scheduleForm.startTime}
              onChange={(event) => setScheduleForm((current) => ({ ...current, startTime: event.target.value }))}
              disabled={saving}
              required
            >
              {TIME_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <label htmlFor="schedule-end-time">Đến giờ</label>
            <select
              id="schedule-end-time"
              value={scheduleForm.endTime}
              onChange={(event) => setScheduleForm((current) => ({ ...current, endTime: event.target.value }))}
              disabled={saving}
              required
            >
              {TIME_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <label htmlFor="schedule-capacity">Sức chứa</label>
            <input id="schedule-capacity" type="number" min="1" value={scheduleForm.capacity} onChange={(event) => setScheduleForm((current) => ({ ...current, capacity: event.target.value }))} disabled={saving} />
            <label htmlFor="schedule-status">Trạng thái</label>
            <select id="schedule-status" value={scheduleForm.status} onChange={(event) => setScheduleForm((current) => ({ ...current, status: event.target.value }))} disabled={saving}>
              <option value="open">Đang làm việc</option>
              <option value="closed">Nghỉ trưa</option>
              <option value="cancelled">Không làm việc</option>
            </select>
            <div className="actions">
              <button type="submit" disabled={saving}>{saving ? 'Đang lưu...' : editingSchedule ? 'Lưu cập nhật' : 'Tạo lịch'}</button>
              <button type="button" onClick={resetScheduleForm} disabled={saving}>Bỏ chọn</button>
            </div>
          </form>
        </>
      )}

      {activeTab === 'appointments' && (
        <div className="panel">
          <h2>Toàn bộ lịch hẹn</h2>
          <p className="muted">Admin chỉ giám sát, không trực tiếp tạo hoặc cập nhật lịch hẹn.</p>
          {appointments.length === 0 ? (
            <p className="muted">Chưa có lịch hẹn nào.</p>
          ) : (
            <table className="appointments-table">
              <thead>
                <tr>
                  <th>Mã</th>
                  <th>Bệnh nhân</th>
                  <th>Bác sĩ</th>
                  <th>Ngày</th>
                  <th>Khung giờ</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appointment) => (
                  <tr key={appointment._id}>
                    <td>{appointment._id?.slice(-8)}</td>
                    <td>{getPatientName(appointment)}</td>
                    <td>{appointment.doctor?.user?.name || appointment.doctor?._id || 'N/A'}</td>
                    <td>{toDateInput(appointment.date)}</td>
                    <td>{appointment.time || appointment.schedule?.slot || 'N/A'}</td>
                    <td>{appointment.status || 'pending'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </section>
  )
}