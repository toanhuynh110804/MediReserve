import { useCallback, useEffect, useMemo, useState } from 'react'
import { getDepartmentsApi, getSpecialtiesApi } from '../../shared/api/catalogApi'
import { getPatientsApi } from '../../shared/api/patientApi'
import {
  deleteStaffApi,
  getStaffsApi,
  updateStaffApi,
} from '../../shared/api/userManagementApi'
import {
  deleteDoctorApi,
  getAdminDoctorsApi,
  updateDoctorApi,
} from '../../shared/api/adminWorkspaceApi'
import { buildStaffPayload, getInitialStaffForm } from './userManagementHelpers'

const ACTIVE_STYLE = { backgroundColor: '#0f766e', color: '#fff' }

function toDateInput(value) {
  if (!value) return ''
  return String(value).slice(0, 10)
}

const INITIAL_DOCTOR_EDIT_FORM = {
  department: '',
  specialties: [],
  qualifications: '',
  experienceYears: '',
  bio: '',
  phone: '',
  active: true,
}

export function UserManagementPanel() {
  const [activeTab, setActiveTab] = useState('staffs')
  const [staffs, setStaffs] = useState([])
  const [patients, setPatients] = useState([])
  const [doctors, setDoctors] = useState([])
  const [departments, setDepartments] = useState([])
  const [specialties, setSpecialties] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [editingStaff, setEditingStaff] = useState(null)
  const [editingDoctor, setEditingDoctor] = useState(null)
  const [staffForm, setStaffForm] = useState(() => getInitialStaffForm())
  const [doctorEditForm, setDoctorEditForm] = useState(INITIAL_DOCTOR_EDIT_FORM)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [staffsData, patientsData, doctorsData, depsData, specsData] = await Promise.all([
        getStaffsApi(),
        getPatientsApi(),
        getAdminDoctorsApi(),
        getDepartmentsApi(),
        getSpecialtiesApi(),
      ])
      setStaffs(staffsData)
      setPatients(patientsData)
      setDoctors(doctorsData)
      setDepartments(depsData)
      setSpecialties(specsData)
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải dữ liệu nhân sự.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const departmentOptions = useMemo(
    () => departments.map((d) => ({ value: d._id, label: d.name })),
    [departments],
  )

  const specialtyOptions = useMemo(
    () => specialties.map((s) => ({ value: s._id, label: s.name })),
    [specialties],
  )

  const handleUpdateStaff = async (event) => {
    event.preventDefault()
    if (!editingStaff) return
    setSaving(true)
    setError('')
    setMessage('')
    try {
      await updateStaffApi(editingStaff._id, buildStaffPayload(staffForm))
      setMessage('Đã cập nhật hồ sơ nhân viên.')
      setEditingStaff(null)
      setStaffForm(getInitialStaffForm())
      await loadData()
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể cập nhật nhân viên.')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteStaff = async (staffId) => {
    setSaving(true)
    setError('')
    setMessage('')
    try {
      await deleteStaffApi(staffId)
      setMessage('Đã xóa hồ sơ nhân viên.')
      if (editingStaff?._id === staffId) {
        setEditingStaff(null)
        setStaffForm(getInitialStaffForm())
      }
      await loadData()
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể xóa nhân viên.')
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateDoctor = async (event) => {
    event.preventDefault()
    if (!editingDoctor) return
    setSaving(true)
    setError('')
    setMessage('')
    try {
      await updateDoctorApi(editingDoctor._id, {
        department: doctorEditForm.department || undefined,
        specialties: doctorEditForm.specialties,
        qualifications: doctorEditForm.qualifications.trim(),
        experienceYears: doctorEditForm.experienceYears === '' ? undefined : Number(doctorEditForm.experienceYears),
        bio: doctorEditForm.bio.trim(),
        phone: doctorEditForm.phone.trim(),
        active: Boolean(doctorEditForm.active),
      })
      setMessage('Đã cập nhật thông tin bác sĩ.')
      setEditingDoctor(null)
      setDoctorEditForm(INITIAL_DOCTOR_EDIT_FORM)
      await loadData()
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể cập nhật bác sĩ.')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteDoctor = async (doctorId) => {
    setSaving(true)
    setError('')
    setMessage('')
    try {
      await deleteDoctorApi(doctorId)
      setMessage('Đã xóa bác sĩ.')
      if (editingDoctor?._id === doctorId) {
        setEditingDoctor(null)
        setDoctorEditForm(INITIAL_DOCTOR_EDIT_FORM)
      }
      await loadData()
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể xóa bác sĩ.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section>
      <h1>Quản lý nhân sự</h1>
      <p>Xem và chỉnh sửa hồ sơ nhân viên, bệnh nhân và bác sĩ của Bệnh viện Đa Khoa Thủ Đức.</p>

      {error && <p className="form-error">{error}</p>}
      {message && <p className="muted">{message}</p>}

      <div className="actions" style={{ flexWrap: 'wrap', marginBottom: '1rem' }}>
        <button type="button" onClick={() => setActiveTab('staffs')} disabled={loading || saving} style={activeTab === 'staffs' ? ACTIVE_STYLE : undefined}>Nhân viên ({staffs.length})</button>
        <button type="button" onClick={() => setActiveTab('patients')} disabled={loading || saving} style={activeTab === 'patients' ? ACTIVE_STYLE : undefined}>Bệnh nhân ({patients.length})</button>
        <button type="button" onClick={() => setActiveTab('doctors')} disabled={loading || saving} style={activeTab === 'doctors' ? ACTIVE_STYLE : undefined}>Bác sĩ ({doctors.length})</button>
        <button type="button" onClick={loadData} disabled={loading || saving}>{loading ? 'Đang tải...' : 'Làm mới'}</button>
      </div>

      {activeTab === 'staffs' && (
        <>
          <div className="panel">
            <h2>Danh sách nhân viên</h2>
            {staffs.length === 0 ? (
              <p className="muted">Chưa có hồ sơ nhân viên.</p>
            ) : (
              <table className="appointments-table">
                <thead>
                  <tr>
                    <th>Tên</th>
                    <th>Email</th>
                    <th>Chức danh</th>
                    <th>Khoa</th>
                    <th>Trạng thái</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {staffs.map((staff) => (
                    <tr key={staff._id}>
                      <td>{staff.user?.name || 'N/A'}</td>
                      <td>{staff.user?.email || 'N/A'}</td>
                      <td>{staff.title || 'N/A'}</td>
                      <td>{staff.department?.name || 'N/A'}</td>
                      <td>{staff.status}</td>
                      <td>
                        <div className="actions" style={{ flexDirection: 'column', gap: '0.5rem' }}>
                          <button type="button" onClick={() => { setEditingStaff(staff); setStaffForm(getInitialStaffForm(staff)) }} disabled={saving}>Chỉnh sửa</button>
                          <button type="button" onClick={() => handleDeleteStaff(staff._id)} disabled={saving}>Xóa</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {editingStaff && (
            <form className="panel" onSubmit={handleUpdateStaff}>
              <h2>Cập nhật: {editingStaff.user?.name || editingStaff._id}</h2>

              <label htmlFor="staff-title">Chức danh</label>
              <input id="staff-title" value={staffForm.title} onChange={(e) => setStaffForm((s) => ({ ...s, title: e.target.value }))} disabled={saving} />

              <label htmlFor="staff-department">Khoa <span style={{ color: 'red' }}>*</span></label>
              <select id="staff-department" value={staffForm.department} onChange={(e) => setStaffForm((s) => ({ ...s, department: e.target.value }))} disabled={saving} required>
                <option value="">-- Chọn khoa (bắt buộc) --</option>
                {departmentOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>

              <label htmlFor="staff-role">Vai trò nội bộ</label>
              <select id="staff-role" value={staffForm.role} onChange={(e) => setStaffForm((s) => ({ ...s, role: e.target.value }))} disabled={saving}>
                <option value="staff">staff</option>
                <option value="manager">manager</option>
              </select>

              <label htmlFor="staff-status">Trạng thái</label>
              <select id="staff-status" value={staffForm.status} onChange={(e) => setStaffForm((s) => ({ ...s, status: e.target.value }))} disabled={saving}>
                <option value="active">active</option>
                <option value="inactive">inactive</option>
              </select>

              <div className="actions">
                <button type="submit" disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu cập nhật'}</button>
                <button type="button" onClick={() => { setEditingStaff(null); setStaffForm(getInitialStaffForm()) }} disabled={saving}>Hủy</button>
              </div>
            </form>
          )}
        </>
      )}

      {activeTab === 'patients' && (
        <div className="panel">
          <h2>Danh sách bệnh nhân</h2>
          {patients.length === 0 ? (
            <p className="muted">Chưa có hồ sơ bệnh nhân.</p>
          ) : (
            <table className="appointments-table">
              <thead>
                <tr>
                  <th>Tên</th>
                  <th>Ngày sinh</th>
                  <th>Giới tính</th>
                  <th>Điện thoại</th>
                  <th>CMND/CCCD</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((patient) => (
                  <tr key={patient._id}>
                    <td>{patient.user?.name || patient.name || 'N/A'}</td>
                    <td>{patient.dateOfBirth ? toDateInput(patient.dateOfBirth) : 'N/A'}</td>
                    <td>{patient.gender || 'N/A'}</td>
                    <td>{patient.user?.phone || patient.phone || 'N/A'}</td>
                    <td>{patient.idNumber || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === 'doctors' && (
        <>
          <div className="panel">
            <h2>Danh sách bác sĩ</h2>
            {doctors.length === 0 ? (
              <p className="muted">Chưa có hồ sơ bác sĩ.</p>
            ) : (
              <table className="appointments-table">
                <thead>
                  <tr>
                    <th>Tên</th>
                    <th>Email</th>
                    <th>Khoa</th>
                    <th>Chuyên khoa</th>
                    <th>Trạng thái</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {doctors.map((doctor) => (
                    <tr key={doctor._id}>
                      <td>{doctor.user?.name || 'N/A'}</td>
                      <td>{doctor.user?.email || 'N/A'}</td>
                      <td>{doctor.department?.name || 'N/A'}</td>
                      <td>{Array.isArray(doctor.specialties) ? doctor.specialties.map((s) => s.name || s).join(', ') || 'N/A' : 'N/A'}</td>
                      <td>{doctor.active ? 'Đang hoạt động' : 'Đã khóa'}</td>
                      <td>
                        <div className="actions" style={{ flexDirection: 'column', gap: '0.5rem' }}>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingDoctor(doctor)
                              setDoctorEditForm({
                                department: doctor.department?._id || doctor.department || '',
                                specialties: Array.isArray(doctor.specialties) ? doctor.specialties.map((s) => s._id || s) : [],
                                qualifications: doctor.qualifications || '',
                                experienceYears: doctor.experienceYears ?? '',
                                bio: doctor.bio || '',
                                phone: doctor.phone || '',
                                active: doctor.active ?? true,
                              })
                            }}
                            disabled={saving}
                          >Chỉnh sửa</button>
                          <button type="button" onClick={() => handleDeleteDoctor(doctor._id)} disabled={saving}>Xóa</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {editingDoctor && (
            <form className="panel" onSubmit={handleUpdateDoctor}>
              <h2>Cập nhật bác sĩ: {editingDoctor.user?.name || editingDoctor._id}</h2>

              <label htmlFor="doc-department">Khoa</label>
              <select id="doc-department" value={doctorEditForm.department} onChange={(e) => setDoctorEditForm((s) => ({ ...s, department: e.target.value }))} disabled={saving}>
                <option value="">Chọn khoa</option>
                {departmentOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>

              <label htmlFor="doc-specialties">Chuyên khoa</label>
              <select
                id="doc-specialties"
                multiple
                size={5}
                value={doctorEditForm.specialties}
                onChange={(e) => setDoctorEditForm((s) => ({ ...s, specialties: Array.from(e.target.selectedOptions, (o) => o.value) }))}
                disabled={saving}
              >
                {specialtyOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
              <small className="muted">Giữ Ctrl (hoặc Cmd) để chọn nhiều chuyên khoa.</small>

              <label htmlFor="doc-qualifications">Bằng cấp</label>
              <input id="doc-qualifications" value={doctorEditForm.qualifications} onChange={(e) => setDoctorEditForm((s) => ({ ...s, qualifications: e.target.value }))} disabled={saving} />

              <label htmlFor="doc-experience">Số năm kinh nghiệm</label>
              <input id="doc-experience" type="number" min="0" value={doctorEditForm.experienceYears} onChange={(e) => setDoctorEditForm((s) => ({ ...s, experienceYears: e.target.value }))} disabled={saving} />

              <label htmlFor="doc-phone">Điện thoại</label>
              <input id="doc-phone" value={doctorEditForm.phone} onChange={(e) => setDoctorEditForm((s) => ({ ...s, phone: e.target.value }))} disabled={saving} />

              <label htmlFor="doc-bio">Tiểu sử</label>
              <textarea id="doc-bio" rows="3" value={doctorEditForm.bio} onChange={(e) => setDoctorEditForm((s) => ({ ...s, bio: e.target.value }))} disabled={saving} />

              <label htmlFor="doc-active">Trạng thái</label>
              <select id="doc-active" value={doctorEditForm.active ? 'active' : 'inactive'} onChange={(e) => setDoctorEditForm((s) => ({ ...s, active: e.target.value === 'active' }))} disabled={saving}>
                <option value="active">Đang hoạt động</option>
                <option value="inactive">Đã khóa</option>
              </select>

              <div className="actions">
                <button type="submit" disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu cập nhật'}</button>
                <button type="button" onClick={() => { setEditingDoctor(null); setDoctorEditForm(INITIAL_DOCTOR_EDIT_FORM) }} disabled={saving}>Hủy</button>
              </div>
            </form>
          )}
        </>
      )}
    </section>
  )
}

