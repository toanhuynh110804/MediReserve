import { ROLE_HOME_PATH, ROLES } from '../shared/constants/roles'

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
    [ROLES.staff]: [
      { to: '/nhan-vien', label: 'Khu nhân viên' },
      { to: '/tro-chuyen', label: 'Chat bệnh nhân' },
    ],
    [ROLES.patient]: [
      { to: '/benh-nhan', label: 'Khu bệnh nhân' },
      { to: '/thanh-toan', label: 'Thanh toán' },
      { to: '/tro-chuyen', label: 'Chat hỗ trợ' },
    ],
  }

  const authItems = roleItems[role] || []

  if (role && ROLE_HOME_PATH[role] && !authItems.some((item) => item.to === ROLE_HOME_PATH[role])) {
    authItems.unshift({ to: ROLE_HOME_PATH[role], label: 'Khu vực của tôi' })
  }

  if (role && role !== ROLES.patient) {
    authItems.push({ to: '/quan-ly-tep', label: 'Tệp đính kèm' })
  }

  return [...publicItems, ...authItems]
}
