import { useCallback, useEffect, useMemo, useState } from 'react'
import { getDepartmentsApi, getSpecialtiesApi } from '../../shared/api/catalogApi'
import { createUserByAdminApi, createStaffApi } from '../../shared/api/userManagementApi'
import { createDoctorApi } from '../../shared/api/adminWorkspaceApi'

const ACTIVE_STYLE = { backgroundColor: '#0f766e', color: '#fff' }

const getInitialPatientForm = () => ({ name: '', email: '', password: '', phone: '' })

const getInitialStaffAccountForm = () => ({
  name: '',
  email: '',
  password: '',
  phone: '',
  department: '',
  title: '',
})

const getInitialDoctorAccountForm = () => ({
  name: '',
  email: '',
  password: '',
  phone: '',
  department: '',
  specialties: [],
  qualifications: '',
  experienceYears: '',
  bio: '',
})

function getCreatedUserId(result) {
  return result?.user?._id || result?.user?.id || ''
}

export function AccountCreationPanel() {
  const [activeTab, setActiveTab] = useState('patient')
  const [departments, setDepartments] = useState([])
  const [specialties, setSpecialties] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [patientForm, setPatientForm] = useState(getInitialPatientForm)
  const [staffAccountForm, setStaffAccountForm] = useState(getInitialStaffAccountForm)
  const [doctorAccountForm, setDoctorAccountForm] = useState(getInitialDoctorAccountForm)

  const loadOptions = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [depsData, specsData] = await Promise.all([getDepartmentsApi(), getSpecialtiesApi()])
      setDepartments(depsData)
      setSpecialties(specsData)
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải danh sách khoa/chuyên khoa.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadOptions() }, [loadOptions])

  const departmentOptions = useMemo(() => departments.map((d) => ({ value: d._id, label: d.name })), [departments])
  const specialtyOptions = useMemo(() => specialties.map((s) => ({ value: s._id, label: s.name })), [specialties])

  const handleCreatePatient = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')
    try {
      await createUserByAdminApi({ ...patientForm, role: 'patient' })
      setMessage(`Đã tạo tài khoản bệnh nhân: ${patientForm.email}`)
      setPatientForm(getInitialPatientForm())
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tạo tài khoản bệnh nhân.')
    } finally {
      setSaving(false)
    }
  }

  const handleCreateStaffAccount = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')
    try {
      const userResult = await createUserByAdminApi({
        name: staffAccountForm.name,
        email: staffAccountForm.email,
        password: staffAccountForm.password,
        phone: staffAccountForm.phone,
        role: 'staff',
      })
      const createdUserId = getCreatedUserId(userResult)
      if (!createdUserId) {
        throw new Error('Không lấy được ID user vừa tạo')
      }
      await createStaffApi({
        user: createdUserId,
        department: staffAccountForm.department,
        title: staffAccountForm.title,
        role: 'staff',
        status: 'active',
      })
      setMessage(`Đã tạo tài khoản và hồ sơ nhân viên: ${staffAccountForm.email}`)
      setStaffAccountForm(getInitialStaffAccountForm())
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tạo tài khoản nhân viên.')
    } finally {
      setSaving(false)
    }
  }

  const handleCreateDoctorAccount = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')
    try {
      const userResult = await createUserByAdminApi({
        name: doctorAccountForm.name,
        email: doctorAccountForm.email,
        password: doctorAccountForm.password,
        phone: doctorAccountForm.phone,
        role: 'doctor',
      })
      const createdUserId = getCreatedUserId(userResult)
      if (!createdUserId) {
        throw new Error('Không lấy được ID user vừa tạo')
      }
      await createDoctorApi({
        user: createdUserId,
        department: doctorAccountForm.department || undefined,
        specialties: doctorAccountForm.specialties,
        qualifications: doctorAccountForm.qualifications.trim(),
        experienceYears: doctorAccountForm.experienceYears === '' ? undefined : Number(doctorAccountForm.experienceYears),
        bio: doctorAccountForm.bio.trim(),
        phone: doctorAccountForm.phone.trim(),
        active: true,
      })
      setMessage(`Đã tạo tài khoản và hồ sơ bác sĩ: ${doctorAccountForm.email}`)
      setDoctorAccountForm(getInitialDoctorAccountForm())
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tạo tài khoản bác sĩ.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section>
      <h1>Quản lý tài khoản</h1>
      <p>Tạo tài khoản đăng nhập cho bệnh nhân, nhân viên và bác sĩ của Bệnh viện Đa Khoa Thủ Đức.</p>

      {error && <p className="form-error">{error}</p>}
      {message && <p className="muted">{message}</p>}

      <div className="actions" style={{ flexWrap: 'wrap', marginBottom: '1rem' }}>
        <button type="button" onClick={() => setActiveTab('patient')} disabled={loading || saving} style={activeTab === 'patient' ? ACTIVE_STYLE : undefined}>Tài khoản bệnh nhân</button>
        <button type="button" onClick={() => setActiveTab('staff')} disabled={loading || saving} style={activeTab === 'staff' ? ACTIVE_STYLE : undefined}>Tài khoản nhân viên</button>
        <button type="button" onClick={() => setActiveTab('doctor')} disabled={loading || saving} style={activeTab === 'doctor' ? ACTIVE_STYLE : undefined}>Tài khoản bác sĩ</button>
      </div>

      {activeTab === 'patient' && (
        <form className="panel" onSubmit={handleCreatePatient}>
          <h2>Tạo tài khoản bệnh nhân</h2>
          <p className="muted">Tạo tài khoản đăng nhập cho bệnh nhân để đặt lịch khám.</p>

          <label htmlFor="pat-name">Họ và tên</label>
          <input id="pat-name" value={patientForm.name} onChange={(e) => setPatientForm((f) => ({ ...f, name: e.target.value }))} disabled={saving} required />

          <label htmlFor="pat-email">Email</label>
          <input id="pat-email" type="email" value={patientForm.email} onChange={(e) => setPatientForm((f) => ({ ...f, email: e.target.value }))} disabled={saving} required />

          <label htmlFor="pat-password">Mật khẩu tạm</label>
          <input id="pat-password" type="password" minLength={6} value={patientForm.password} onChange={(e) => setPatientForm((f) => ({ ...f, password: e.target.value }))} disabled={saving} required />

          <label htmlFor="pat-phone">Điện thoại</label>
          <input id="pat-phone" value={patientForm.phone} onChange={(e) => setPatientForm((f) => ({ ...f, phone: e.target.value }))} disabled={saving} />

          <div className="actions">
            <button type="submit" disabled={saving}>{saving ? 'Đang tạo...' : 'Tạo tài khoản bệnh nhân'}</button>
            <button type="button" onClick={() => setPatientForm(getInitialPatientForm())} disabled={saving}>Đặt lại</button>
          </div>
        </form>
      )}

      {activeTab === 'staff' && (
        <form className="panel" onSubmit={handleCreateStaffAccount}>
          <h2>Tạo tài khoản nhân viên</h2>
          <p className="muted">Tạo tài khoản đăng nhập và hồ sơ nhân viên cùng một bước.</p>

          <h3>Thông tin tài khoản</h3>

          <label htmlFor="st-name">Họ và tên</label>
          <input id="st-name" value={staffAccountForm.name} onChange={(e) => setStaffAccountForm((f) => ({ ...f, name: e.target.value }))} disabled={saving} required />

          <label htmlFor="st-email">Email</label>
          <input id="st-email" type="email" value={staffAccountForm.email} onChange={(e) => setStaffAccountForm((f) => ({ ...f, email: e.target.value }))} disabled={saving} required />

          <label htmlFor="st-password">Mật khẩu tạm</label>
          <input id="st-password" type="password" minLength={6} value={staffAccountForm.password} onChange={(e) => setStaffAccountForm((f) => ({ ...f, password: e.target.value }))} disabled={saving} required />

          <label htmlFor="st-phone">Điện thoại</label>
          <input id="st-phone" value={staffAccountForm.phone} onChange={(e) => setStaffAccountForm((f) => ({ ...f, phone: e.target.value }))} disabled={saving} />

          <h3>Hồ sơ nhân viên</h3>

          <label htmlFor="st-department">Khoa <span style={{ color: 'red' }}>*</span></label>
          <select id="st-department" value={staffAccountForm.department} onChange={(e) => setStaffAccountForm((f) => ({ ...f, department: e.target.value }))} disabled={saving || loading} required>
            <option value="">-- Chọn khoa (bắt buộc) --</option>
            {departmentOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>

          <label htmlFor="st-title">Chức danh</label>
          <input id="st-title" value={staffAccountForm.title} onChange={(e) => setStaffAccountForm((f) => ({ ...f, title: e.target.value }))} disabled={saving} placeholder="Ví dụ: Điều dưỡng, Kỹ thuật viên..." />

          <div className="actions">
            <button type="submit" disabled={saving || loading}>{saving ? 'Đang tạo...' : 'Tạo tài khoản nhân viên'}</button>
            <button type="button" onClick={() => setStaffAccountForm(getInitialStaffAccountForm())} disabled={saving}>Đặt lại</button>
          </div>
        </form>
      )}

      {activeTab === 'doctor' && (
        <form className="panel" onSubmit={handleCreateDoctorAccount}>
          <h2>Tạo tài khoản bác sĩ</h2>
          <p className="muted">Tạo tài khoản đăng nhập và hồ sơ bác sĩ cùng một bước.</p>

          <h3>Thông tin tài khoản</h3>

          <label htmlFor="dr-name">Họ và tên</label>
          <input id="dr-name" value={doctorAccountForm.name} onChange={(e) => setDoctorAccountForm((f) => ({ ...f, name: e.target.value }))} disabled={saving} required />

          <label htmlFor="dr-email">Email</label>
          <input id="dr-email" type="email" value={doctorAccountForm.email} onChange={(e) => setDoctorAccountForm((f) => ({ ...f, email: e.target.value }))} disabled={saving} required />

          <label htmlFor="dr-password">Mật khẩu tạm</label>
          <input id="dr-password" type="password" minLength={6} value={doctorAccountForm.password} onChange={(e) => setDoctorAccountForm((f) => ({ ...f, password: e.target.value }))} disabled={saving} required />

          <label htmlFor="dr-phone">Điện thoại</label>
          <input id="dr-phone" value={doctorAccountForm.phone} onChange={(e) => setDoctorAccountForm((f) => ({ ...f, phone: e.target.value }))} disabled={saving} />

          <h3>Hồ sơ bác sĩ</h3>

          <label htmlFor="dr-department">Khoa</label>
          <select id="dr-department" value={doctorAccountForm.department} onChange={(e) => setDoctorAccountForm((f) => ({ ...f, department: e.target.value }))} disabled={saving || loading}>
            <option value="">Chọn khoa</option>
            {departmentOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>

          <label htmlFor="dr-specialties">Chuyên khoa <span style={{ color: 'red' }}>*</span></label>
          <select
            id="dr-specialties"
            multiple
            size={5}
            value={doctorAccountForm.specialties}
            onChange={(e) => setDoctorAccountForm((f) => ({ ...f, specialties: Array.from(e.target.selectedOptions, (o) => o.value) }))}
            disabled={saving || loading}
            required
          >
            {specialtyOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
          <small className="muted">Giữ Ctrl (hoặc Cmd) để chọn nhiều chuyên khoa.</small>

          <label htmlFor="dr-qualifications">Bằng cấp</label>
          <input id="dr-qualifications" value={doctorAccountForm.qualifications} onChange={(e) => setDoctorAccountForm((f) => ({ ...f, qualifications: e.target.value }))} disabled={saving} placeholder="Ví dụ: Bác sĩ CK1, Thạc sĩ Y khoa..." />

          <label htmlFor="dr-experience">Số năm kinh nghiệm</label>
          <input id="dr-experience" type="number" min="0" value={doctorAccountForm.experienceYears} onChange={(e) => setDoctorAccountForm((f) => ({ ...f, experienceYears: e.target.value }))} disabled={saving} />

          <label htmlFor="dr-bio">Tiểu sử / Giới thiệu</label>
          <textarea id="dr-bio" rows="3" value={doctorAccountForm.bio} onChange={(e) => setDoctorAccountForm((f) => ({ ...f, bio: e.target.value }))} disabled={saving} placeholder="Mô tả ngắn về bác sĩ..." />

          <div className="actions">
            <button type="submit" disabled={saving || loading}>{saving ? 'Đang tạo...' : 'Tạo tài khoản bác sĩ'}</button>
            <button type="button" onClick={() => setDoctorAccountForm(getInitialDoctorAccountForm())} disabled={saving}>Đặt lại</button>
          </div>
        </form>
      )}
    </section>
  )
}
