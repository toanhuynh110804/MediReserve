import { useCallback, useEffect, useMemo, useState } from 'react'
import { getDoctorsApi, getSchedulesApi } from '../../shared/api/patientAppointmentsApi'
import { getPatientsApi } from '../../shared/api/patientApi'
import {
  cancelStaffAppointmentApi,
  createStaffAppointmentApi,
  getStaffAppointmentsApi,
  markAppointmentArrivedApi,
} from '../../shared/api/staffWorkspaceApi'
import { getChatRoomsApi } from '../../shared/api/chatApi'
import { ChatBox } from '../../shared/components/ChatBox'

function getId(value) {
  if (!value) return ''
  if (typeof value === 'string') return value
  return value._id || ''
}

function formatDate(value) {
  if (!value) return 'N/A'
  return new Date(value).toLocaleDateString('vi-VN')
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

export function StaffOperationsPanel() {
  const [activeTab, setActiveTab] = useState('appointments')
  const [patients, setPatients] = useState([])
  const [doctors, setDoctors] = useState([])
  const [schedules, setSchedules] = useState([])
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [selectedPatientId, setSelectedPatientId] = useState('')
  const [selectedScheduleId, setSelectedScheduleId] = useState('')
  const [appointmentNotes, setAppointmentNotes] = useState('')
  const [chatRooms, setChatRooms] = useState([])
  const [chatRoomsLoading, setChatRoomsLoading] = useState(false)
  const [chatRoomsError, setChatRoomsError] = useState('')
  const [activeChatRoomId, setActiveChatRoomId] = useState(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const [patientData, doctorData, scheduleData, appointmentData] = await Promise.all([
        getPatientsApi(),
        getDoctorsApi(),
        getSchedulesApi(),
        getStaffAppointmentsApi(),
      ])

      setPatients(patientData)
      setDoctors(doctorData)
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

  const loadChatRooms = useCallback(async () => {
    setChatRoomsLoading(true)
    setChatRoomsError('')
    try {
      const rooms = await getChatRoomsApi()
      const normalized = (rooms || []).map((room) => {
        const roomId = room.roomId || room._id || ''
        return {
          roomId,
          patientName: room.patientName || null,
          unreadCount: Number(room.unreadCount ?? room.unread ?? 0),
          lastMessage: room.lastMessage || '',
          lastAt: room.lastAt || null,
        }
      }).filter((room) => room.roomId)
      setChatRooms(normalized)
    } catch {
      setChatRoomsError('Không thể tải danh sách phòng chat.')
    } finally {
      setChatRoomsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (activeTab === 'chat') {
      loadChatRooms()
    }
  }, [activeTab, loadChatRooms])

  const doctorNameMap = useMemo(() => getDoctorNameMap(doctors), [doctors])

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
      <p>Nhân viên tiếp nhận xử lý lịch khám và theo dõi danh sách bệnh nhân đã có trong hệ thống.</p>

      {error && <p className="form-error">{error}</p>}
      {message && <p className="muted">{message}</p>}

      <div className="actions" style={{ flexWrap: 'wrap', marginBottom: '1rem' }}>
        <button type="button" onClick={() => setActiveTab('appointments')} disabled={loading || saving} style={activeTab === 'appointments' ? { backgroundColor: '#0f766e', color: '#fff' } : undefined}>Lịch khám</button>
        <button type="button" onClick={() => setActiveTab('chat')} disabled={loading || saving} style={activeTab === 'chat' ? { backgroundColor: '#0f766e', color: '#fff' } : undefined}>Chat hỗ trợ</button>
        <button type="button" onClick={loadData} disabled={loading || saving}>{loading ? 'Đang tải...' : 'Làm mới'}</button>
      </div>

      {activeTab === 'appointments' && (
        <>
          <div className="panel">
            <h2>Tạo lịch khám cho bệnh nhân</h2>
            <p className="muted">Nhân viên chỉ dùng khu vực này để xử lý lịch khám cho bệnh nhân đã có tài khoản/hồ sơ nền trong hệ thống.</p>
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

      {activeTab === 'chat' && (
        <div className="panel">
          <h2>Chat hỗ trợ bệnh nhân</h2>
          <p className="muted">Chọn bệnh nhân để xem và trả lời tin nhắn.</p>

          {chatRoomsError ? <p className="form-error">{chatRoomsError}</p> : null}
          {chatRoomsLoading ? <p className="muted">Đang tải danh sách phòng chat...</p> : null}

          {!chatRoomsLoading && chatRooms.length === 0 ? (
            <p className="muted">Chưa có bệnh nhân nào nhắn tin.</p>
          ) : null}

          {chatRooms.length > 0 ? (
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              {chatRooms.map((room) => (
                <button
                  key={room.roomId}
                  type="button"
                  onClick={() => setActiveChatRoomId(room.roomId)}
                  style={activeChatRoomId === room.roomId
                    ? { backgroundColor: '#0f766e', color: '#fff', position: 'relative' }
                    : { position: 'relative' }}
                >
                  {room.patientName || room.roomId.slice(-8)}
                  {room.unreadCount > 0 ? (
                    <span style={{
                      position: 'absolute',
                      top: '-6px',
                      right: '-6px',
                      backgroundColor: '#dc2626',
                      color: '#fff',
                      borderRadius: '50%',
                      fontSize: '0.7rem',
                      minWidth: '18px',
                      height: '18px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0 3px',
                    }}>
                      {room.unreadCount}
                    </span>
                  ) : null}
                </button>
              ))}
            </div>
          ) : null}

          {activeChatRoomId ? (
            <ChatBox
              key={activeChatRoomId}
              roomId={activeChatRoomId}
              title={`Chat với bệnh nhân ${chatRooms.find((r) => r.roomId === activeChatRoomId)?.patientName || activeChatRoomId.slice(-8)}`}
            />
          ) : (
            <p className="muted">Chọn một bệnh nhân ở trên để bắt đầu chat.</p>
          )}
        </div>
      )}
    </section>
  )
}