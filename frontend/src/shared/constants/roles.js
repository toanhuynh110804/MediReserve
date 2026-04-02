export const ROLES = {
  patient: 'patient',
  doctor: 'doctor',
  staff: 'staff',
  admin: 'admin',
}

export const ROLE_LABELS = {
  [ROLES.patient]: 'Bệnh nhân',
  [ROLES.doctor]: 'Bác sĩ',
  [ROLES.staff]: 'Nhân viên',
  [ROLES.admin]: 'Quản trị viên',
}

export const ROLE_HOME_PATH = {
  [ROLES.patient]: '/benh-nhan',
  [ROLES.doctor]: '/bac-si',
  [ROLES.staff]: '/nhan-vien',
  [ROLES.admin]: '/quan-tri',
}
