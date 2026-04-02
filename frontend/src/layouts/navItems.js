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

  const authItems = [{ to: '/app', label: 'Điểm vào hệ thống' }]

  if (role && ROLE_HOME_PATH[role]) {
    authItems.push({ to: ROLE_HOME_PATH[role], label: 'Khu vực của tôi' })
  }

  if (role === ROLES.admin && ROLE_HOME_PATH[role] !== '/quan-tri') {
    authItems.push({ to: '/quan-tri', label: 'Quản trị' })
  }

  return [...publicItems, ...authItems]
}
