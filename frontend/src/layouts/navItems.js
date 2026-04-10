import { ROLE_HOME_PATH, ROLES } from '../shared/constants/roles'

// Các vai trò không cần hiển thị link Trang chủ vì có khu vực riêng
const ROLES_WITHOUT_HOME = [ROLES.doctor, ROLES.staff, ROLES.admin]

export function buildNavItems(isAuthenticated, role) {
  const publicItems = [
    { to: '/', label: 'Trang chủ' },
  ]

  if (!isAuthenticated) {
    return [
      ...publicItems,
      { to: '/login', label: 'Đăng nhập' },
      { to: '/register', label: 'Đăng ký' },
    ]
  }

  const roleItems = {
    [ROLES.admin]: [{ to: '/quan-tri', label: 'Quản trị' }],
    [ROLES.doctor]: [{ to: '/bac-si', label: 'Khu bác sĩ' }],
    [ROLES.staff]: [{ to: '/nhan-vien', label: 'Khu nhân viên' }],
    [ROLES.patient]: [{ to: '/benh-nhan', label: 'Khu bệnh nhân' }],
  }

  const authItems = roleItems[role] || []

  if (role && ROLE_HOME_PATH[role] && !authItems.some((item) => item.to === ROLE_HOME_PATH[role])) {
    authItems.unshift({ to: ROLE_HOME_PATH[role], label: 'Khu vực của tôi' })
  }

  if (role && role !== ROLES.patient) {
    authItems.push({ to: '/quan-ly-tep', label: 'Hồ sơ bệnh án' })
  }

  // Bác sĩ, nhân viên, admin không cần link Trang chủ
  const baseItems = ROLES_WITHOUT_HOME.includes(role) ? [] : publicItems

  return [...baseItems, ...authItems]
}
