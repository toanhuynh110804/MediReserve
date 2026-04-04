import { useCallback, useEffect, useMemo, useState } from 'react'
import { getDepartmentsApi, getHospitalsApi } from '../../shared/api/catalogApi'
import { getDoctorsApi, getSchedulesApi } from '../../shared/api/patientAppointmentsApi'
import { getPatientsApi } from '../../shared/api/patientApi'
import { getUsersApi } from '../../shared/api/userManagementApi'
import {
  cancelStaffAppointmentApi,
  createPatientApi,
  createStaffScheduleApi,
  createStaffAppointmentApi,
  getStaffAppointmentsApi,
  getStaffRoomsApi,
  markAppointmentArrivedApi,
  updatePatientApi,
} from '../../shared/api/staffWorkspaceApi'

const INITIAL_PATIENT_FORM = {
  user: '',
  dateOfBirth: '',
  gender: '',
  bloodType: '',
  medicalHistory: '',
  allergies: '',
  insuranceProvider: '',
  insurancePolicyNumber: '',
  insuranceCoverage: '',
  insuranceValidUntil: '',
}

const INITIAL_SCHEDULE_FORM = {
  doctor: '',
  room: '',
  department: '',
  hospital: '',
  date: '',
  slot: 'morning',
  capacity: 1,
}

function getId(value) {
  if (!value) return ''
  if (typeof value === 'string') return value
  return value._id || ''
}

function formatDate(value) {
  if (!value) return 'N/A'
  return new Date(value).toLocaleDateString('vi-VN')
}

function getPatientFormState(patient) {
  if (!patient) return INITIAL_PATIENT_FORM
  return {
    user: getId(patient.user),
    dateOfBirth: patient.dateOfBirth ? String(patient.dateOfBirth).slice(0, 10) : '',
    gender: patient.gender || '',
    bloodType: patient.bloodType || '',
    medicalHistory: Array.isArray(patient.medicalHistory) ? patient.medicalHistory.join(', ') : '',
    allergies: Array.isArray(patient.allergies) ? patient.allergies.join(', ') : '',
    insuranceProvider: patient.insurance?.provider || '',
    insurancePolicyNumber: patient.insurance?.policyNumber || '',
    insuranceCoverage: patient.insurance?.coverage || '',
    insuranceValidUntil: patient.insurance?.validUntil ? String(patient.insurance.validUntil).slice(0, 10) : '',
  }
}

function buildPatientPayload(formState) {
  return {
    user: formState.user,
    dateOfBirth: formState.dateOfBirth || undefined,
    gender: formState.gender.trim(),
    bloodType: formState.bloodType.trim(),
    medicalHistory: formState.medicalHistory
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean),
    allergies: formState.allergies
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean),
    insurance: {
      provider: formState.insuranceProvider.trim(),
      policyNumber: formState.insurancePolicyNumber.trim(),
      coverage: formState.insuranceCoverage.trim(),
      validUntil: formState.insuranceValidUntil || undefined,
    },
  }
}

function getDoctorNameMap(doctors) {
  return doctors.reduce((result, doctor) => {
    result[doctor._id] = doctor.user?.name || doctor._id
    return result
  }, {})
}

function getScheduleLabel(schedule, doctorNameMap) {
  const doctorId = getId(schedule.doctor)
  const doctorName = doctorNameMap[doctorId] || doctorId || 'N/A'
  return `${formatDate(schedule.date)} - ${schedule.slot} - ${doctorName}`
}

function getPatientDisplayName(patient) {
  return patient.user?.name || patient.user?.email || patient._id || 'N/A'
}

function getAppointmentPatientName(appointment) {
  return appointment.patient?.user?.name || appointment.patient?._id || 'N/A'
}

function buildStaffSchedulePayload(formState) {
  return {
    doctor: formState.doctor,
    room: formState.room,
    department: formState.department || undefined,
    hospital: formState.hospital || undefined,
    date: formState.date,
    slot: formState.slot,
    capacity: Number(formState.capacity || 1),
    status: 'open',
  }
}

export function StaffOperationsPanel() {
  const [activeTab, setActiveTab] = useState('patients')
  const [patientUsers, setPatientUsers] = useState([])
  const [patients, setPatients] = useState([])
  const [doctors, setDoctors] = useState([])
  const [rooms, setRooms] = useState([])
  const [hospitals, setHospitals] = useState([])
  const [departments, setDepartments] = useState([])
  const [schedules, setSchedules] = useState([])
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [searchText, setSearchText] = useState('')
  const [editingPatient, setEditingPatient] = useState(null)
  const [patientForm, setPatientForm] = useState(INITIAL_PATIENT_FORM)
  const [selectedPatientId, setSelectedPatientId] = useState('')
  const [selectedScheduleId, setSelectedScheduleId] = useState('')
  const [appointmentNotes, setAppointmentNotes] = useState('')
  const [newScheduleForm, setNewScheduleForm] = useState(INITIAL_SCHEDULE_FORM)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const [patientUserData, patientData, doctorData, roomData, hospitalData, departmentData, scheduleData, appointmentData] = await Promise.all([
        getUsersApi({ role: 'patient' }),
        getPatientsApi(),
        getDoctorsApi(),
        getStaffRoomsApi(),
        getHospitalsApi(),
        getDepartmentsApi(),
        getSchedulesApi(),
        getStaffAppointmentsApi(),
      ])

      setPatientUsers(patientUserData)
      setPatients(patientData)
      setDoctors(doctorData)
      setRooms(roomData)
      setHospitals(hospitalData)
      setDepartments(departmentData)
      setSchedules((scheduleData || []).filter((item) => item.status === 'open'))
      setAppointments(appointmentData)
      setSelectedPatientId((current) => current || patientData[0]?._id || '')
      setSelectedScheduleId((current) => current || scheduleData.find((item) => item.status === 'open')?._id || '')
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Không thể tải workspace nhân viên.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const doctorNameMap = useMemo(() => getDoctorNameMap(doctors), [doctors])

  const filteredPatients = useMemo(() => {
    const normalizedSearch = searchText.trim().toLowerCase()
    if (!normalizedSearch) return patients

    return patients.filter((patient) => {
      const label = `${patient.user?.name || ''} ${patient.user?.email || ''} ${patient._id || ''}`.toLowerCase()
      return label.includes(normalizedSearch)
    })
  }, [patients, searchText])

  const resetPatientForm = () => {
    setEditingPatient(null)
    setPatientForm(INITIAL_PATIENT_FORM)
  }

  const handlePatientSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')

    try {
      const payload = buildPatientPayload(patientForm)
      if (editingPatient?._id) {
        await updatePatientApi(editingPatient._id, payload)
        setMessage('Đã cập nhật hồ sơ bệnh nhân.')
      } else {
        await createPatientApi(payload)
        setMessage('Đã tạo hồ sơ bệnh nhân mới.')
      }
      resetPatientForm()
      await loadData()
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Không thể lưu hồ sơ bệnh nhân.')
    } finally {
      setSaving(false)
    }
  }

  const handleCreateAppointment = async () => {
    if (!selectedPatientId || !selectedScheduleId) {
      setError('Cần chọn bệnh nhân và lịch khám trước khi tạo lịch.')
      return
    }

    const schedule = schedules.find((item) => item._id === selectedScheduleId)
    if (!schedule) {
      setError('Lịch khám đã chọn không còn khả dụng.')
      return
    }

    setSaving(true)
    setError('')
    setMessage('')

    try {
      await createStaffAppointmentApi(schedule, selectedPatientId, appointmentNotes)
      setAppointmentNotes('')
      setMessage('Đã tạo lịch khám cho bệnh nhân.')
      await loadData()
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Không thể tạo lịch khám.')
    } finally {
      setSaving(false)
    }
  }

  const handleCreateSchedule = async () => {
    if (!newScheduleForm.doctor || !newScheduleForm.room || !newScheduleForm.date) {
      setError('Cần chọn bác sĩ, phòng và ngày khám để tạo lịch mới.')
      return
    }

    setSaving(true)
    setError('')
    setMessage('')

    try {
      const payload = buildStaffSchedulePayload(newScheduleForm)
      const createdSchedule = await createStaffScheduleApi(payload)
      setMessage('Đã tạo lịch khám mới. Bạn có thể chọn lịch này để tạo lịch hẹn.')
      setNewScheduleForm((current) => ({
        ...current,
        date: '',
      }))
      await loadData()
      if (createdSchedule?._id) {
        setSelectedScheduleId(createdSchedule._id)
      }
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Không thể tạo lịch khám mới.')
    } finally {
      setSaving(false)
    }
  }

  const handleMarkArrived = async (appointmentId) => {
    setSaving(true)
    setError('')
    setMessage('')
    try {
      await markAppointmentArrivedApi(appointmentId)
      setMessage('Đã cập nhật trạng thái bệnh nhân đã đến.')
      await loadData()
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Không thể cập nhật trạng thái lịch hẹn.')
    } finally {
      setSaving(false)
    }
  }

  const handleCancelAppointment = async (appointmentId) => {
    setSaving(true)
    setError('')
    setMessage('')
    try {
      await cancelStaffAppointmentApi(appointmentId, 'Hủy bởi nhân viên tiếp nhận')
      setMessage('Đã hủy lịch hẹn.')
      await loadData()
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Không thể hủy lịch hẹn.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section>
      <h1>Khu vực nhân viên hành chính</h1>
      <p>Nhân viên tiếp nhận tạo hồ sơ bệnh nhân, tìm kiếm bệnh nhân và xử lý lịch khám.</p>

      {error && <p className="form-error">{error}</p>}
      {message && <p className="muted">{message}</p>}

      <div className="actions" style={{ flexWrap: 'wrap', marginBottom: '1rem' }}>
        <button type="button" onClick={() => setActiveTab('patients')} disabled={loading || saving} style={activeTab === 'patients' ? { backgroundColor: '#0f766e', color: '#fff' } : undefined}>Hồ sơ bệnh nhân</button>
        <button type="button" onClick={() => setActiveTab('appointments')} disabled={loading || saving} style={activeTab === 'appointments' ? { backgroundColor: '#0f766e', color: '#fff' } : undefined}>Lịch khám</button>
        <button type="button" onClick={loadData} disabled={loading || saving}>{loading ? 'Đang tải...' : 'Làm mới'}</button>
      </div>

      {activeTab === 'patients' && (
        <>
          <div className="panel">
            <h2>Tìm kiếm và theo dõi bệnh nhân</h2>
            <label htmlFor="patient-search">Tìm kiếm bệnh nhân</label>
            <input id="patient-search" value={searchText} onChange={(event) => setSearchText(event.target.value)} placeholder="Tên, email hoặc mã bệnh nhân" disabled={saving} />

            {filteredPatients.length === 0 ? (
              <p className="muted">Không tìm thấy bệnh nhân phù hợp.</p>
            ) : (
              <table className="appointments-table">
                <thead>
                  <tr>
                    <th>Bệnh nhân</th>
                    <th>Giới tính</th>
                    <th>Nhóm máu</th>
                    <th>Bảo hiểm</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPatients.map((patient) => (
                    <tr key={patient._id}>
                      <td>{getPatientDisplayName(patient)}</td>
                      <td>{patient.gender || 'N/A'}</td>
                      <td>{patient.bloodType || 'N/A'}</td>
                      <td>{patient.insurance?.provider || 'N/A'}</td>
                      <td>
                        <button type="button" onClick={() => { setEditingPatient(patient); setPatientForm(getPatientFormState(patient)); }} disabled={saving}>Chỉnh sửa</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <form className="panel" onSubmit={handlePatientSubmit}>
            <h2>{editingPatient ? 'Cập nhật hồ sơ bệnh nhân' : 'Tạo hồ sơ bệnh nhân'}</h2>
            <label htmlFor="patient-user">User bệnh nhân</label>
            <select id="patient-user" value={patientForm.user} onChange={(event) => setPatientForm((current) => ({ ...current, user: event.target.value }))} disabled={saving} required>
              <option value="">Chọn user bệnh nhân</option>
              {patientUsers.map((user) => <option key={user._id} value={user._id}>{user.name} ({user.email})</option>)}
            </select>
            <label htmlFor="patient-dob">Ngày sinh</label>
            <input id="patient-dob" type="date" value={patientForm.dateOfBirth} onChange={(event) => setPatientForm((current) => ({ ...current, dateOfBirth: event.target.value }))} disabled={saving} />
            <label htmlFor="patient-gender">Giới tính</label>
            <input id="patient-gender" value={patientForm.gender} onChange={(event) => setPatientForm((current) => ({ ...current, gender: event.target.value }))} disabled={saving} />
            <label htmlFor="patient-blood">Nhóm máu</label>
            <input id="patient-blood" value={patientForm.bloodType} onChange={(event) => setPatientForm((current) => ({ ...current, bloodType: event.target.value }))} disabled={saving} />
            <label htmlFor="patient-history">Tiền sử bệnh</label>
            <textarea id="patient-history" rows="3" value={patientForm.medicalHistory} onChange={(event) => setPatientForm((current) => ({ ...current, medicalHistory: event.target.value }))} disabled={saving} placeholder="Phân tách bằng dấu phẩy" />
            <label htmlFor="patient-allergies">Dị ứng</label>
            <textarea id="patient-allergies" rows="3" value={patientForm.allergies} onChange={(event) => setPatientForm((current) => ({ ...current, allergies: event.target.value }))} disabled={saving} placeholder="Phân tách bằng dấu phẩy" />
            <label htmlFor="insurance-provider">Nhà cung cấp bảo hiểm</label>
            <input id="insurance-provider" value={patientForm.insuranceProvider} onChange={(event) => setPatientForm((current) => ({ ...current, insuranceProvider: event.target.value }))} disabled={saving} />
            <label htmlFor="insurance-policy">Số hợp đồng</label>
            <input id="insurance-policy" value={patientForm.insurancePolicyNumber} onChange={(event) => setPatientForm((current) => ({ ...current, insurancePolicyNumber: event.target.value }))} disabled={saving} />
            <label htmlFor="insurance-coverage">Mức chi trả</label>
            <input id="insurance-coverage" value={patientForm.insuranceCoverage} onChange={(event) => setPatientForm((current) => ({ ...current, insuranceCoverage: event.target.value }))} disabled={saving} />
            <label htmlFor="insurance-valid-until">Hiệu lực đến</label>
            <input id="insurance-valid-until" type="date" value={patientForm.insuranceValidUntil} onChange={(event) => setPatientForm((current) => ({ ...current, insuranceValidUntil: event.target.value }))} disabled={saving} />
            <div className="actions">
              <button type="submit" disabled={saving}>{saving ? 'Đang lưu...' : editingPatient ? 'Lưu cập nhật' : 'Tạo hồ sơ'}</button>
              <button type="button" onClick={resetPatientForm} disabled={saving}>Bỏ chọn</button>
            </div>
          </form>
        </>
      )}

      {activeTab === 'appointments' && (
        <>
          <div className="panel">
            <h2>Tạo lịch khám mới</h2>
            <p className="muted">Nhân viên có thể chủ động mở lịch mới để tiếp nhận bệnh nhân tại quầy.</p>

            <label htmlFor="new-schedule-doctor">Bác sĩ</label>
            <select
              id="new-schedule-doctor"
              value={newScheduleForm.doctor}
              onChange={(event) => setNewScheduleForm((current) => ({ ...current, doctor: event.target.value }))}
              disabled={saving}
            >
              <option value="">Chọn bác sĩ</option>
              {doctors.map((doctor) => (
                <option key={doctor._id} value={doctor._id}>
                  {doctor.user?.name || doctor._id}
                </option>
              ))}
            </select>

            <label htmlFor="new-schedule-room">Phòng</label>
            <select
              id="new-schedule-room"
              value={newScheduleForm.room}
              onChange={(event) => setNewScheduleForm((current) => ({ ...current, room: event.target.value }))}
              disabled={saving}
            >
              <option value="">Chọn phòng</option>
              {rooms.map((room) => (
                <option key={room._id} value={room._id}>
                  {room.code || room.roomNumber || room._id}
                </option>
              ))}
            </select>

            <label htmlFor="new-schedule-hospital">Bệnh viện (tùy chọn)</label>
            <select
              id="new-schedule-hospital"
              value={newScheduleForm.hospital}
              onChange={(event) => setNewScheduleForm((current) => ({ ...current, hospital: event.target.value }))}
              disabled={saving}
            >
              <option value="">Không chọn</option>
              {hospitals.map((hospital) => (
                <option key={hospital._id} value={hospital._id}>
                  {hospital.name || hospital._id}
                </option>
              ))}
            </select>

            <label htmlFor="new-schedule-department">Khoa (tùy chọn)</label>
            <select
              id="new-schedule-department"
              value={newScheduleForm.department}
              onChange={(event) => setNewScheduleForm((current) => ({ ...current, department: event.target.value }))}
              disabled={saving}
            >
              <option value="">Không chọn</option>
              {departments.map((department) => (
                <option key={department._id} value={department._id}>
                  {department.name || department._id}
                </option>
              ))}
            </select>

            <label htmlFor="new-schedule-date">Ngày khám</label>
            <input
              id="new-schedule-date"
              type="date"
              value={newScheduleForm.date}
              onChange={(event) => setNewScheduleForm((current) => ({ ...current, date: event.target.value }))}
              disabled={saving}
            />

            <label htmlFor="new-schedule-slot">Ca khám</label>
            <select
              id="new-schedule-slot"
              value={newScheduleForm.slot}
              onChange={(event) => setNewScheduleForm((current) => ({ ...current, slot: event.target.value }))}
              disabled={saving}
            >
              <option value="morning">morning</option>
              <option value="afternoon">afternoon</option>
              <option value="evening">evening</option>
            </select>

            <label htmlFor="new-schedule-capacity">Số lượng tiếp nhận</label>
            <input
              id="new-schedule-capacity"
              type="number"
              min="1"
              value={newScheduleForm.capacity}
              onChange={(event) => setNewScheduleForm((current) => ({ ...current, capacity: event.target.value }))}
              disabled={saving}
            />

            <div className="actions">
              <button type="button" onClick={handleCreateSchedule} disabled={saving}>
                Tạo lịch mới
              </button>
            </div>
          </div>

          <div className="panel">
            <h2>Tạo lịch khám cho bệnh nhân</h2>
            <p className="muted">Nhân viên là người tạo lịch khám thủ công cho bệnh nhân tại quầy tiếp nhận.</p>
            <label htmlFor="appointment-patient">Bệnh nhân</label>
            <select id="appointment-patient" value={selectedPatientId} onChange={(event) => setSelectedPatientId(event.target.value)} disabled={saving}>
              <option value="">Chọn bệnh nhân</option>
              {patients.map((patient) => <option key={patient._id} value={patient._id}>{getPatientDisplayName(patient)}</option>)}
            </select>
            <label htmlFor="appointment-schedule">Lịch khám còn trống</label>
            <select id="appointment-schedule" value={selectedScheduleId} onChange={(event) => setSelectedScheduleId(event.target.value)} disabled={saving}>
              <option value="">Chọn lịch khám</option>
              {schedules.map((schedule) => <option key={schedule._id} value={schedule._id}>{getScheduleLabel(schedule, doctorNameMap)}</option>)}
            </select>
            <label htmlFor="appointment-notes">Ghi chú tiếp nhận</label>
            <input id="appointment-notes" value={appointmentNotes} onChange={(event) => setAppointmentNotes(event.target.value)} disabled={saving} placeholder="Ví dụ: đặt lịch tại quầy" />
            <div className="actions">
              <button type="button" onClick={handleCreateAppointment} disabled={saving || !selectedPatientId || !selectedScheduleId}>Tạo lịch khám</button>
            </div>
          </div>

          <div className="panel">
            <h2>Danh sách lịch khám</h2>
            {appointments.length === 0 ? (
              <p className="muted">Chưa có lịch khám nào.</p>
            ) : (
              <table className="appointments-table">
                <thead>
                  <tr>
                    <th>Mã</th>
                    <th>Bệnh nhân</th>
                    <th>Bác sĩ</th>
                    <th>Ngày</th>
                    <th>Trạng thái</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((appointment) => {
                    const canMarkArrived = appointment.status === 'pending'
                    const canCancel = appointment.status !== 'cancelled' && appointment.status !== 'completed'
                    return (
                      <tr key={appointment._id}>
                        <td>{appointment._id?.slice(-8)}</td>
                        <td>{getAppointmentPatientName(appointment)}</td>
                        <td>{appointment.doctor?.user?.name || appointment.doctor?._id || 'N/A'}</td>
                        <td>{formatDate(appointment.date)}</td>
                        <td>{appointment.status || 'pending'}</td>
                        <td>
                          <div className="actions" style={{ flexDirection: 'column', gap: '0.5rem' }}>
                            <button type="button" onClick={() => handleMarkArrived(appointment._id)} disabled={saving || !canMarkArrived}>Đã đến</button>
                            <button type="button" onClick={() => handleCancelAppointment(appointment._id)} disabled={saving || !canCancel}>Hủy</button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </section>
  )
}