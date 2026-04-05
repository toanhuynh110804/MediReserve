import { useCallback, useEffect, useMemo, useState } from 'react'
import { getDepartmentsApi, getSpecialtiesApi } from '../../shared/api/catalogApi'
import {
  createDoctorApi,
  createRoomApi,
  createScheduleApi,
  deleteDoctorApi,
  deleteRoomApi,
  deleteScheduleApi,
  getAdminAppointmentsApi,
  getAdminDoctorsApi,
  getAdminSchedulesApi,
  getRoomsApi,
  updateDoctorApi,
  updateRoomApi,
  updateScheduleApi,
} from '../../shared/api/adminWorkspaceApi'
import { getUsersApi } from '../../shared/api/userManagementApi'

const INITIAL_DOCTOR_FORM = {
  user: '',
  department: '',
  specialties: [],
  qualifications: '',
  experienceYears: '',
  bio: '',
  phone: '',
  active: true,
}

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
  slot: 'morning',
  capacity: 1,
  status: 'open',
}

function toDateInput(value) {
  if (!value) return ''
  return String(value).slice(0, 10)
}

function buildDoctorPayload(formState) {
  return {
    user: formState.user,
    department: formState.department || undefined,
    specialties: formState.specialties,
    qualifications: formState.qualifications.trim(),
    experienceYears: formState.experienceYears === '' ? undefined : Number(formState.experienceYears),
    bio: formState.bio.trim(),
    phone: formState.phone.trim(),
    active: Boolean(formState.active),
  }
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
  return {
    doctor: formState.doctor,
    room: formState.room,
    department: formState.department || undefined,
    date: formState.date,
    slot: formState.slot,
    capacity: Number(formState.capacity || 1),
    status: formState.status,
  }
}

function getDoctorFormState(doctor) {
  if (!doctor) return INITIAL_DOCTOR_FORM
  return {
    user: doctor.user?._id || doctor.user || '',
    department: doctor.department?._id || doctor.department || '',
    specialties: Array.isArray(doctor.specialties) ? doctor.specialties.map((item) => item._id || item) : [],
    qualifications: doctor.qualifications || '',
    experienceYears: doctor.experienceYears ?? '',
    bio: doctor.bio || '',
    phone: doctor.phone || '',
    active: doctor.active ?? true,
  }
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
  return {
    doctor: schedule.doctor?._id || schedule.doctor || '',
    room: schedule.room?._id || schedule.room || '',
    department: schedule.department?._id || schedule.department || '',
    date: toDateInput(schedule.date),
    slot: schedule.slot || 'morning',
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
  const [activeTab, setActiveTab] = useState('doctors')
  const [users, setUsers] = useState([])
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
  const [editingDoctor, setEditingDoctor] = useState(null)
  const [editingRoom, setEditingRoom] = useState(null)
  const [editingSchedule, setEditingSchedule] = useState(null)
  const [doctorForm, setDoctorForm] = useState(INITIAL_DOCTOR_FORM)
  const [roomForm, setRoomForm] = useState(INITIAL_ROOM_FORM)
  const [scheduleForm, setScheduleForm] = useState(INITIAL_SCHEDULE_FORM)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const [doctorUsers, doctorData, roomData, scheduleData, appointmentData, departmentData, specialtyData] = await Promise.all([
        getUsersApi({ role: 'doctor' }),
        getAdminDoctorsApi(),
        getRoomsApi(),
        getAdminSchedulesApi(),
        getAdminAppointmentsApi(),
        getDepartmentsApi(),
        getSpecialtiesApi(),
      ])

      setUsers(doctorUsers)
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

  const doctorUserOptions = useMemo(
    () => users.map((user) => ({ value: user._id, label: `${user.name} (${user.email})` })),
    [users],
  )

  const departmentOptions = useMemo(() => departments.map((item) => ({ value: item._id, label: item.name })), [departments])
  const specialtyOptions = useMemo(() => specialties.map((item) => ({ value: item._id, label: item.name })), [specialties])
  const roomOptions = useMemo(() => rooms.map((item) => ({ value: item._id, label: `${item.code} - ${item.department?.name || 'N/A'}` })), [rooms])
  const doctorOptions = useMemo(() => doctors.map((item) => ({ value: item._id, label: getDoctorName(item) })), [doctors])

  const resetDoctorForm = () => {
    setEditingDoctor(null)
    setDoctorForm(INITIAL_DOCTOR_FORM)
  }

  const resetRoomForm = () => {
    setEditingRoom(null)
    setRoomForm(INITIAL_ROOM_FORM)
  }

  const resetScheduleForm = () => {
    setEditingSchedule(null)
    setScheduleForm(INITIAL_SCHEDULE_FORM)
  }

  const handleDoctorSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')

    try {
      const payload = buildDoctorPayload(doctorForm)
      if (editingDoctor?._id) {
        await updateDoctorApi(editingDoctor._id, payload)
        setMessage('Đã cập nhật bác sĩ.')
      } else {
        await createDoctorApi(payload)
        setMessage('Đã tạo bác sĩ mới.')
      }
      resetDoctorForm()
      await loadData()
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Không thể lưu bác sĩ.')
    } finally {
      setSaving(false)
    }
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
      setError(requestError.response?.data?.message || 'Không thể lưu lịch làm việc.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (type, itemId) => {
    setSaving(true)
    setError('')
    setMessage('')

    try {
      if (type === 'doctor') {
        await deleteDoctorApi(itemId)
        if (editingDoctor?._id === itemId) resetDoctorForm()
        setMessage('Đã xóa bác sĩ.')
      }
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
      <p>Admin quản lý bác sĩ, phòng, lịch làm việc và chỉ giám sát toàn bộ lịch hẹn.</p>

      {error && <p className="form-error">{error}</p>}
      {message && <p className="muted">{message}</p>}

      <div className="actions" style={{ flexWrap: 'wrap', marginBottom: '1rem' }}>
        <button type="button" onClick={() => setActiveTab('doctors')} disabled={loading || saving} style={activeTab === 'doctors' ? { backgroundColor: '#0f766e', color: '#fff' } : undefined}>Bác sĩ</button>
        <button type="button" onClick={() => setActiveTab('rooms')} disabled={loading || saving} style={activeTab === 'rooms' ? { backgroundColor: '#0f766e', color: '#fff' } : undefined}>Phòng</button>
        <button type="button" onClick={() => setActiveTab('schedules')} disabled={loading || saving} style={activeTab === 'schedules' ? { backgroundColor: '#0f766e', color: '#fff' } : undefined}>Lịch làm việc</button>
        <button type="button" onClick={() => setActiveTab('appointments')} disabled={loading || saving} style={activeTab === 'appointments' ? { backgroundColor: '#0f766e', color: '#fff' } : undefined}>Toàn bộ lịch hẹn</button>
        <button type="button" onClick={loadData} disabled={loading || saving}>{loading ? 'Đang tải...' : 'Làm mới'}</button>
      </div>

      {activeTab === 'doctors' && (
        <>
          <div className="panel">
            <h2>Quản lý bác sĩ</h2>
            {doctors.length === 0 ? (
              <p className="muted">Chưa có bác sĩ nào.</p>
            ) : (
              <table className="appointments-table">
                <thead>
                  <tr>
                    <th>Bác sĩ</th>
                    <th>Khoa</th>
                    <th>Trạng thái</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {doctors.map((doctor) => (
                    <tr key={doctor._id}>
                      <td>{getDoctorName(doctor)}</td>
                      <td>{doctor.department?.name || 'N/A'}</td>
                      <td>{doctor.active ? 'Đang hoạt động' : 'Đã khóa'}</td>
                      <td>
                        <div className="actions" style={{ flexDirection: 'column', gap: '0.5rem' }}>
                          <button type="button" onClick={() => { setEditingDoctor(doctor); setDoctorForm(getDoctorFormState(doctor)); }} disabled={saving}>Chỉnh sửa</button>
                          <button type="button" onClick={() => handleDelete('doctor', doctor._id)} disabled={saving}>Xóa</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <form className="panel" onSubmit={handleDoctorSubmit}>
            <h2>{editingDoctor ? 'Cập nhật bác sĩ' : 'Tạo bác sĩ mới'}</h2>
            <label htmlFor="doctor-user">User bác sĩ</label>
            <select id="doctor-user" value={doctorForm.user} onChange={(event) => setDoctorForm((current) => ({ ...current, user: event.target.value }))} disabled={saving} required>
              <option value="">Chọn user bác sĩ</option>
              {doctorUserOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
            <label htmlFor="doctor-department">Khoa</label>
            <select id="doctor-department" value={doctorForm.department} onChange={(event) => setDoctorForm((current) => ({ ...current, department: event.target.value }))} disabled={saving}>
              <option value="">Chọn khoa</option>
              {departmentOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
            <label htmlFor="doctor-specialties">Chuyên khoa</label>
            <select
              id="doctor-specialties"
              multiple
              value={doctorForm.specialties}
              onChange={(event) =>
                setDoctorForm((current) => ({
                  ...current,
                  specialties: Array.from(event.target.selectedOptions, (option) => option.value),
                }))
              }
              disabled={saving}
            >
              {specialtyOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
            <label htmlFor="doctor-qualifications">Bằng cấp</label>
            <input id="doctor-qualifications" value={doctorForm.qualifications} onChange={(event) => setDoctorForm((current) => ({ ...current, qualifications: event.target.value }))} disabled={saving} />
            <label htmlFor="doctor-experience">Số năm kinh nghiệm</label>
            <input id="doctor-experience" type="number" value={doctorForm.experienceYears} onChange={(event) => setDoctorForm((current) => ({ ...current, experienceYears: event.target.value }))} disabled={saving} />
            <label htmlFor="doctor-phone">Điện thoại</label>
            <input id="doctor-phone" value={doctorForm.phone} onChange={(event) => setDoctorForm((current) => ({ ...current, phone: event.target.value }))} disabled={saving} />
            <label htmlFor="doctor-bio">Tiểu sử</label>
            <textarea id="doctor-bio" rows="3" value={doctorForm.bio} onChange={(event) => setDoctorForm((current) => ({ ...current, bio: event.target.value }))} disabled={saving} />
            <label htmlFor="doctor-active">Trạng thái</label>
            <select id="doctor-active" value={doctorForm.active ? 'active' : 'inactive'} onChange={(event) => setDoctorForm((current) => ({ ...current, active: event.target.value === 'active' }))} disabled={saving}>
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Đã khóa</option>
            </select>
            <div className="actions">
              <button type="submit" disabled={saving}>{saving ? 'Đang lưu...' : editingDoctor ? 'Lưu cập nhật' : 'Tạo bác sĩ'}</button>
              <button type="button" onClick={resetDoctorForm} disabled={saving}>Bỏ chọn</button>
            </div>
          </form>
        </>
      )}

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
                      <td>{schedule.slot}</td>
                      <td>{schedule.room?.code || schedule.room?.roomNumber || 'N/A'}</td>
                      <td>{schedule.status}</td>
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
            <input id="schedule-date" type="date" value={scheduleForm.date} onChange={(event) => setScheduleForm((current) => ({ ...current, date: event.target.value }))} disabled={saving} required />
            <label htmlFor="schedule-slot">Khung giờ</label>
            <select id="schedule-slot" value={scheduleForm.slot} onChange={(event) => setScheduleForm((current) => ({ ...current, slot: event.target.value }))} disabled={saving}>
              <option value="morning">morning</option>
              <option value="afternoon">afternoon</option>
              <option value="evening">evening</option>
            </select>
            <label htmlFor="schedule-capacity">Sức chứa</label>
            <input id="schedule-capacity" type="number" min="1" value={scheduleForm.capacity} onChange={(event) => setScheduleForm((current) => ({ ...current, capacity: event.target.value }))} disabled={saving} />
            <label htmlFor="schedule-status">Trạng thái</label>
            <select id="schedule-status" value={scheduleForm.status} onChange={(event) => setScheduleForm((current) => ({ ...current, status: event.target.value }))} disabled={saving}>
              <option value="open">open</option>
              <option value="closed">closed</option>
              <option value="cancelled">cancelled</option>
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