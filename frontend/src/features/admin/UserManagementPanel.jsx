import { useCallback, useEffect, useMemo, useState } from 'react'
import { getDepartmentsApi, getHospitalsApi } from '../../shared/api/catalogApi'
import {
  createRoleApi,
  createStaffApi,
  deleteRoleApi,
  deleteStaffApi,
  getRolesApi,
  getStaffsApi,
  getUsersApi,
  updateRoleApi,
  updateStaffApi,
} from '../../shared/api/userManagementApi'
import {
  buildRolePayload,
  buildStaffPayload,
  getInitialRoleForm,
  getInitialStaffForm,
} from './userManagementHelpers'

export function UserManagementPanel() {
  const [activeTab, setActiveTab] = useState('users')
  const [users, setUsers] = useState([])
  const [staffs, setStaffs] = useState([])
  const [roles, setRoles] = useState([])
  const [hospitals, setHospitals] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [editingStaff, setEditingStaff] = useState(null)
  const [editingRole, setEditingRole] = useState(null)
  const [userRoleFilter, setUserRoleFilter] = useState('all')
  const [staffForm, setStaffForm] = useState(() => getInitialStaffForm())
  const [roleForm, setRoleForm] = useState(() => getInitialRoleForm())

  const loadManagementData = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const [usersData, staffsData, rolesData, hospitalsData, departmentsData] = await Promise.all([
        getUsersApi(userRoleFilter === 'all' ? {} : { role: userRoleFilter }),
        getStaffsApi(),
        getRolesApi(),
        getHospitalsApi(),
        getDepartmentsApi(),
      ])

      setUsers(usersData)
      setStaffs(staffsData)
      setRoles(rolesData)
      setHospitals(hospitalsData)
      setDepartments(departmentsData)
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải dữ liệu quản trị người dùng.')
    } finally {
      setLoading(false)
    }
  }, [userRoleFilter])

  useEffect(() => {
    loadManagementData()
  }, [loadManagementData])

  const hospitalOptions = useMemo(
    () => hospitals.map((hospital) => ({ value: hospital._id, label: hospital.name })),
    [hospitals],
  )

  const departmentOptions = useMemo(
    () => departments.map((department) => ({ value: department._id, label: department.name })),
    [departments],
  )

  const staffUserOptions = useMemo(
    () => users.filter((user) => ['staff', 'admin'].includes(user.role)).map((user) => ({
      value: user._id,
      label: `${user.name} (${user.email})`,
    })),
    [users],
  )

  const handleStaffSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')

    try {
      const payload = buildStaffPayload(staffForm)

      if (editingStaff?._id) {
        await updateStaffApi(editingStaff._id, payload)
        setMessage('Đã cập nhật hồ sơ nhân sự.')
      } else {
        await createStaffApi(payload)
        setMessage('Đã tạo hồ sơ nhân sự mới.')
      }

      setEditingStaff(null)
      setStaffForm(getInitialStaffForm())
      await loadManagementData()
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể lưu hồ sơ nhân sự.')
    } finally {
      setSaving(false)
    }
  }

  const handleRoleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')

    try {
      const payload = buildRolePayload(roleForm)

      if (editingRole?._id) {
        await updateRoleApi(editingRole._id, payload)
        setMessage('Đã cập nhật role.')
      } else {
        await createRoleApi(payload)
        setMessage('Đã tạo role mới.')
      }

      setEditingRole(null)
      setRoleForm(getInitialRoleForm())
      await loadManagementData()
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể lưu role.')
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
      setMessage('Đã xóa hồ sơ nhân sự.')
      if (editingStaff?._id === staffId) {
        setEditingStaff(null)
        setStaffForm(getInitialStaffForm())
      }
      await loadManagementData()
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể xóa hồ sơ nhân sự.')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteRole = async (roleId) => {
    setSaving(true)
    setError('')
    setMessage('')
    try {
      await deleteRoleApi(roleId)
      setMessage('Đã xóa role.')
      if (editingRole?._id === roleId) {
        setEditingRole(null)
        setRoleForm(getInitialRoleForm())
      }
      await loadManagementData()
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể xóa role.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section>
      <h1>Quản lý người dùng và phân quyền</h1>
      <p>Admin theo dõi danh sách user, quản lý hồ sơ nhân sự và định nghĩa role nghiệp vụ.</p>

      {error && <p className="form-error">{error}</p>}
      {message && <p className="muted">{message}</p>}

      <div className="actions" style={{ flexWrap: 'wrap', marginBottom: '1rem' }}>
        <button type="button" onClick={() => setActiveTab('users')} disabled={loading || saving} style={activeTab === 'users' ? { backgroundColor: '#0f766e', color: '#fff' } : undefined}>Users</button>
        <button type="button" onClick={() => setActiveTab('staffs')} disabled={loading || saving} style={activeTab === 'staffs' ? { backgroundColor: '#0f766e', color: '#fff' } : undefined}>Nhân sự</button>
        <button type="button" onClick={() => setActiveTab('roles')} disabled={loading || saving} style={activeTab === 'roles' ? { backgroundColor: '#0f766e', color: '#fff' } : undefined}>Roles</button>
        <button type="button" onClick={loadManagementData} disabled={loading || saving}>{loading ? 'Đang tải...' : 'Làm mới'}</button>
      </div>

      {activeTab === 'users' && (
        <div className="panel">
          <h2>Danh sách user</h2>
          <label htmlFor="user-role-filter">Lọc theo role</label>
          <select id="user-role-filter" value={userRoleFilter} onChange={(event) => setUserRoleFilter(event.target.value)} disabled={loading || saving}>
            <option value="all">Tất cả</option>
            <option value="patient">Patient</option>
            <option value="doctor">Doctor</option>
            <option value="staff">Staff</option>
            <option value="admin">Admin</option>
          </select>

          {users.length === 0 ? (
            <p className="muted">Không có user phù hợp.</p>
          ) : (
            <table className="appointments-table">
              <thead>
                <tr>
                  <th>Tên</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Điện thoại</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td>{user.phone || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === 'staffs' && (
        <>
          <div className="panel">
            <h2>Danh sách nhân sự</h2>
            {staffs.length === 0 ? (
              <p className="muted">Chưa có hồ sơ nhân sự.</p>
            ) : (
              <table className="appointments-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Chức danh</th>
                    <th>Bệnh viện</th>
                    <th>Khoa</th>
                    <th>Vai trò nội bộ</th>
                    <th>Trạng thái</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {staffs.map((staff) => (
                    <tr key={staff._id}>
                      <td>{staff.user?.name || staff.user?.email || staff.user?._id || 'N/A'}</td>
                      <td>{staff.title || 'N/A'}</td>
                      <td>{staff.hospital?.name || 'N/A'}</td>
                      <td>{staff.department?.name || 'N/A'}</td>
                      <td>{staff.role}</td>
                      <td>{staff.status}</td>
                      <td>
                        <div className="actions" style={{ flexDirection: 'column', gap: '0.5rem' }}>
                          <button type="button" onClick={() => { setEditingStaff(staff); setStaffForm(getInitialStaffForm(staff)); }} disabled={saving}>Chỉnh sửa</button>
                          <button type="button" onClick={() => handleDeleteStaff(staff._id)} disabled={saving}>Xóa</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <form className="panel" onSubmit={handleStaffSubmit}>
            <h2>{editingStaff ? 'Cập nhật hồ sơ nhân sự' : 'Tạo hồ sơ nhân sự'}</h2>

            <label htmlFor="staff-user">User</label>
            <select id="staff-user" value={staffForm.user} onChange={(event) => setStaffForm((current) => ({ ...current, user: event.target.value }))} disabled={saving} required>
              <option value="">Chọn user</option>
              {staffUserOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>

            <label htmlFor="staff-title">Chức danh</label>
            <input id="staff-title" value={staffForm.title} onChange={(event) => setStaffForm((current) => ({ ...current, title: event.target.value }))} disabled={saving} />

            <label htmlFor="staff-hospital">Bệnh viện</label>
            <select id="staff-hospital" value={staffForm.hospital} onChange={(event) => setStaffForm((current) => ({ ...current, hospital: event.target.value }))} disabled={saving}>
              <option value="">Chọn bệnh viện</option>
              {hospitalOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>

            <label htmlFor="staff-department">Khoa</label>
            <select id="staff-department" value={staffForm.department} onChange={(event) => setStaffForm((current) => ({ ...current, department: event.target.value }))} disabled={saving}>
              <option value="">Chọn khoa</option>
              {departmentOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>

            <label htmlFor="staff-role">Vai trò nội bộ</label>
            <select id="staff-role" value={staffForm.role} onChange={(event) => setStaffForm((current) => ({ ...current, role: event.target.value }))} disabled={saving}>
              <option value="staff">staff</option>
              <option value="manager">manager</option>
              <option value="admin">admin</option>
            </select>

            <label htmlFor="staff-status">Trạng thái</label>
            <select id="staff-status" value={staffForm.status} onChange={(event) => setStaffForm((current) => ({ ...current, status: event.target.value }))} disabled={saving}>
              <option value="active">active</option>
              <option value="inactive">inactive</option>
            </select>

            <div className="actions">
              <button type="submit" disabled={saving}>{saving ? 'Đang lưu...' : editingStaff ? 'Lưu cập nhật' : 'Tạo mới'}</button>
              <button type="button" onClick={() => { setEditingStaff(null); setStaffForm(getInitialStaffForm()); }} disabled={saving}>Bỏ chọn</button>
            </div>
          </form>
        </>
      )}

      {activeTab === 'roles' && (
        <>
          <div className="panel">
            <h2>Danh sách role</h2>
            {roles.length === 0 ? (
              <p className="muted">Chưa có role nào.</p>
            ) : (
              <table className="appointments-table">
                <thead>
                  <tr>
                    <th>Tên role</th>
                    <th>Permissions</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {roles.map((role) => (
                    <tr key={role._id}>
                      <td>{role.name}</td>
                      <td>{Array.isArray(role.permissions) && role.permissions.length > 0 ? role.permissions.join(', ') : 'N/A'}</td>
                      <td>
                        <div className="actions" style={{ flexDirection: 'column', gap: '0.5rem' }}>
                          <button type="button" onClick={() => { setEditingRole(role); setRoleForm(getInitialRoleForm(role)); }} disabled={saving}>Chỉnh sửa</button>
                          <button type="button" onClick={() => handleDeleteRole(role._id)} disabled={saving}>Xóa</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <form className="panel" onSubmit={handleRoleSubmit}>
            <h2>{editingRole ? 'Cập nhật role' : 'Tạo role mới'}</h2>

            <label htmlFor="role-name">Tên role</label>
            <input id="role-name" value={roleForm.name} onChange={(event) => setRoleForm((current) => ({ ...current, name: event.target.value }))} disabled={saving} required />

            <label htmlFor="role-permissions">Permissions</label>
            <textarea id="role-permissions" rows="4" value={roleForm.permissions} onChange={(event) => setRoleForm((current) => ({ ...current, permissions: event.target.value }))} disabled={saving} placeholder="Mỗi dòng hoặc dấu phẩy là một permission" />

            <div className="actions">
              <button type="submit" disabled={saving}>{saving ? 'Đang lưu...' : editingRole ? 'Lưu cập nhật' : 'Tạo mới'}</button>
              <button type="button" onClick={() => { setEditingRole(null); setRoleForm(getInitialRoleForm()); }} disabled={saving}>Bỏ chọn</button>
            </div>
          </form>
        </>
      )}
    </section>
  )
}
