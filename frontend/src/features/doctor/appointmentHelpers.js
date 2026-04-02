export function renderAppointmentStatus(status) {
  const statusMap = {
    pending: { label: 'Chờ phê duyệt', color: '#fbc02d' },
    confirmed: { label: 'Đã xác nhận', color: '#388e3c' },
    completed: { label: 'Hoàn thành', color: '#1976d2' },
    cancelled: { label: 'Bị hủy', color: '#d32f2f' },
    'no-show': { label: 'Không xuất hiện', color: '#666' },
  }
  return statusMap[status] || { label: status, color: '#999' }
}

export function getAppointmentPatientLabel(appointment) {
  const explicitName = appointment?.patient?.user?.name || appointment?.patient?.name
  if (explicitName) {
    return explicitName
  }

  if (appointment?.patient?._id) {
    return `BN ${appointment.patient._id.slice(-6)}`
  }

  return 'N/A'
}

export function canTransitionStatus(currentStatus, targetStatus) {
  const transitions = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['completed', 'cancelled'],
    completed: [],
    cancelled: [],
    'no-show': [],
  }
  return transitions[currentStatus]?.includes(targetStatus) ?? false
}
