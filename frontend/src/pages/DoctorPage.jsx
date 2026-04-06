import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '../features/auth/useAuth'
import {
  getDoctorAppointmentsApi,
  getDoctorSchedulesApi,
  getMyDoctorProfileApi,
  updateAppointmentStatusApi,
} from '../shared/api/doctorApi'
import {
  createMedicalRecordApi,
  getMedicalRecordsApi,
  updateMedicalRecordApi,
} from '../shared/api/medicalRecordApi'
import {
  createPrescriptionApi,
  getPrescriptionsApi,
  updatePrescriptionApi,
} from '../shared/api/prescriptionApi'
import { getMedicinesApi } from '../shared/api/medicineApi'
import { subscribeAppointmentEvents } from '../shared/realtime/socketService'
import { DoctorScheduleCard } from '../features/doctor/DoctorScheduleCard'
import { AppointmentActionRow } from '../features/doctor/AppointmentActionRow'
import {
  canManageClinicalRecord,
  getMedicalRecordForAppointment,
  getPatientDisplayName,
  getPrescriptionForMedicalRecord,
} from '../features/doctor/medicalRecordHelpers'
import { MedicalRecordForm } from '../features/doctor/MedicalRecordForm'
import { PrescriptionForm } from '../features/doctor/PrescriptionForm'

function renderList(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return 'Chưa cập nhật'
  }

  return items.join(', ')
}

export function DoctorPage() {
  const { user } = useAuth()
  const [doctorProfile, setDoctorProfile] = useState(null)
  const [schedules, setSchedules] = useState([])
  const [appointments, setAppointments] = useState([])
  const [medicalRecords, setMedicalRecords] = useState([])
  const [prescriptions, setPrescriptions] = useState([])
  const [medicines, setMedicines] = useState([])
  const [selectedAppointmentId, setSelectedAppointmentId] = useState('')
  const [loading, setLoading] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [activeSection, setActiveSection] = useState('schedule')
  const latestSyncRequestIdRef = useRef(0)

  const doctorUserId = user?._id || user?.id
  const doctorId = doctorProfile?._id

  const loadDoctorProfile = useCallback(async () => {
    try {
      const profile = await getMyDoctorProfileApi()
      setDoctorProfile(profile)
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải hồ sơ bác sĩ.')
    }
  }, [])

  const fetchData = useCallback(async () => {
    if (!doctorId) return

    latestSyncRequestIdRef.current += 1
    const currentRequestId = latestSyncRequestIdRef.current

    setLoading(true)
    setError('')
    setMessage('')

    try {
      const [schedulesData, appointmentsData, medicalRecordsData, prescriptionsData, medicinesData] = await Promise.all([
        getDoctorSchedulesApi(doctorId),
        getDoctorAppointmentsApi(doctorId),
        getMedicalRecordsApi({ doctor: doctorId }),
        getPrescriptionsApi({ doctor: doctorId }),
        getMedicinesApi(),
      ])

      if (currentRequestId !== latestSyncRequestIdRef.current) {
        return
      }

      setSchedules(schedulesData)
      setAppointments(appointmentsData)
      setMedicalRecords(medicalRecordsData)
      setPrescriptions(prescriptionsData)
      setMedicines(medicinesData)
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải dữ liệu.')
    } finally {
      if (currentRequestId === latestSyncRequestIdRef.current) {
        setLoading(false)
      }
    }
  }, [doctorId])

  const selectedAppointment = useMemo(
    () => appointments.find((appointment) => appointment._id === selectedAppointmentId) || null,
    [appointments, selectedAppointmentId],
  )

  const selectedMedicalRecord = useMemo(
    () => getMedicalRecordForAppointment(medicalRecords, selectedAppointmentId),
    [medicalRecords, selectedAppointmentId],
  )

  const selectedPrescription = useMemo(
    () => getPrescriptionForMedicalRecord(prescriptions, selectedMedicalRecord?._id),
    [prescriptions, selectedMedicalRecord],
  )

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

  const handleOpenClinicalWorkspace = useCallback((appointment) => {
    setSelectedAppointmentId(appointment._id)
    setMessage('Đã mở workspace hồ sơ cho lịch hẹn được chọn.')
    setError('')
  }, [])

  const handleMedicalRecordSubmit = useCallback(
    async (payload) => {
      setUpdating(true)
      setError('')
      setMessage('')

      try {
        if (selectedMedicalRecord?._id) {
          await updateMedicalRecordApi(selectedMedicalRecord._id, payload)
          setMessage('Đã cập nhật hồ sơ y tế. Đang làm mới dữ liệu...')
        } else {
          await createMedicalRecordApi(payload)
          setMessage('Đã tạo hồ sơ y tế. Đang làm mới dữ liệu...')
        }

        await fetchData()
      } catch (err) {
        setError(err.response?.data?.message || 'Không thể lưu hồ sơ y tế.')
      } finally {
        setUpdating(false)
      }
    },
    [fetchData, selectedMedicalRecord],
  )

  const handlePrescriptionSubmit = useCallback(
    async (payload) => {
      setUpdating(true)
      setError('')
      setMessage('')

      try {
        if (selectedPrescription?._id) {
          await updatePrescriptionApi(selectedPrescription._id, payload)
          setMessage('Đã cập nhật đơn thuốc. Đang làm mới dữ liệu...')
        } else {
          await createPrescriptionApi(payload)
          setMessage('Đã tạo đơn thuốc. Đang làm mới dữ liệu...')
        }

        await fetchData()
      } catch (err) {
        setError(err.response?.data?.message || 'Không thể lưu đơn thuốc.')
      } finally {
        setUpdating(false)
      }
    },
    [fetchData, selectedPrescription],
  )

  useEffect(() => {
    if (doctorUserId) {
      loadDoctorProfile()
    }
  }, [doctorUserId, loadDoctorProfile])

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

  const selectableAppointments = filteredAppointments.filter((appointment) => canManageClinicalRecord(appointment.status))

  return (
    <section>
      <h1>Khu vực bác sĩ</h1>
      <p>Bác sĩ chỉ nhìn thấy lịch làm việc của mình, lịch hẹn bệnh nhân và workspace hồ sơ khám.</p>

      {error && <p className="form-error">{error}</p>}
      {message && <p className="muted">{message}</p>}

      <div className="actions" style={{ flexWrap: 'wrap' }}>
        <button type="button" onClick={fetchData} disabled={loading || updating}>
          {loading ? 'Đang tải...' : 'Làm mới'}
        </button>
        <button
          type="button"
          onClick={() => setActiveSection('schedule')}
          style={activeSection === 'schedule' ? { backgroundColor: '#0f766e', color: '#fff' } : undefined}
        >
          Lịch làm việc
        </button>
        <button
          type="button"
          onClick={() => setActiveSection('appointments')}
          style={activeSection === 'appointments' ? { backgroundColor: '#0f766e', color: '#fff' } : undefined}
        >
          Lịch hẹn bệnh nhân
        </button>
        <button
          type="button"
          onClick={() => setActiveSection('clinical')}
          style={activeSection === 'clinical' ? { backgroundColor: '#0f766e', color: '#fff' } : undefined}
        >
          Hồ sơ khám
        </button>
      </div>

      {activeSection === 'schedule' ? (
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
      ) : null}

      {activeSection === 'appointments' ? (
      <div className="panel">
        <h2>Lịch hẹn của bệnh nhân</h2>
        <p className="muted">Chọn nút "Hồ sơ khám" trên lịch hẹn đã xác nhận hoặc hoàn thành để lập hồ sơ và kê đơn.</p>

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
                <th>Khoa</th>
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
                  onOpenClinicalWorkspace={handleOpenClinicalWorkspace}
                  disabled={updating}
                  isSelected={selectedAppointmentId === appointment._id}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>
      ) : null}

      {activeSection === 'clinical' ? (
      <>
      <div className="panel">
        <h2>Workspace hồ sơ khám</h2>
        {!selectedAppointment ? (
          <p className="muted">
            {selectableAppointments.length === 0
              ? 'Chưa có lịch hẹn confirmed/completed để tạo hồ sơ khám.'
              : 'Chọn một lịch hẹn phù hợp để bắt đầu lập hồ sơ y tế và đơn thuốc.'}
          </p>
        ) : (
          <div>
            <p>
              <strong>Lịch hẹn đang chọn:</strong> {selectedAppointment._id?.slice(-8)}
            </p>
            <p>
              <strong>Bệnh nhân:</strong> {getPatientDisplayName(selectedAppointment)}
            </p>
            <p>
              <strong>Khoa tiếp nhận:</strong> {selectedAppointment.department?.name || selectedAppointment.schedule?.department?.name || 'Chưa cập nhật'}
            </p>
            <p>
              <strong>Trạng thái:</strong> {selectedAppointment.status}
            </p>
            {selectedAppointment.patientDetails ? (
              <div className="status-box" style={{ marginTop: '1rem' }}>
                <p><strong>Số điện thoại:</strong> {selectedAppointment.patientDetails.phone || 'Chưa cập nhật'}</p>
                <p><strong>Email:</strong> {selectedAppointment.patientDetails.email || 'Chưa cập nhật'}</p>
                <p><strong>Ngày sinh:</strong> {selectedAppointment.patientDetails.dateOfBirth ? new Date(selectedAppointment.patientDetails.dateOfBirth).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}</p>
                <p><strong>Giới tính:</strong> {selectedAppointment.patientDetails.gender || 'Chưa cập nhật'}</p>
                <p><strong>Nhóm máu:</strong> {selectedAppointment.patientDetails.bloodType || 'Chưa cập nhật'}</p>
                <p><strong>Địa chỉ:</strong> {selectedAppointment.patientDetails.address || 'Chưa cập nhật'}</p>
                <p><strong>Lý do khám:</strong> {selectedAppointment.patientDetails.reasonForVisit || 'Chưa cập nhật'}</p>
                <p><strong>Triệu chứng:</strong> {renderList(selectedAppointment.patientDetails.symptoms)}</p>
                <p><strong>Tiền sử bệnh:</strong> {renderList(selectedAppointment.patientDetails.medicalHistory)}</p>
                <p><strong>Dị ứng:</strong> {renderList(selectedAppointment.patientDetails.allergies)}</p>
                <p><strong>Bảo hiểm:</strong> {selectedAppointment.patientDetails.insurance?.provider || 'Chưa cập nhật'}</p>
              </div>
            ) : null}
          </div>
        )}
      </div>

      <MedicalRecordForm
        key={selectedMedicalRecord?._id || selectedAppointmentId || 'medical-record-empty'}
        appointment={selectedAppointment}
        doctorId={doctorId}
        medicalRecord={selectedMedicalRecord}
        onSubmit={handleMedicalRecordSubmit}
        disabled={loading || updating || !doctorId}
      />

      <PrescriptionForm
        key={selectedPrescription?._id || selectedMedicalRecord?._id || selectedAppointmentId || 'prescription-empty'}
        appointment={selectedAppointment}
        doctorId={doctorId}
        medicalRecord={selectedMedicalRecord}
        medicines={medicines}
        prescription={selectedPrescription}
        onSubmit={handlePrescriptionSubmit}
        disabled={loading || updating || !doctorId}
      />
      </>
      ) : null}
    </section>
  )
}
