import { httpClient } from './httpClient'

export async function getMyDoctorProfileApi() {
  const response = await httpClient.get('/api/doctors/me')
  return response.data
}

export async function getDoctorSchedulesApi(doctorId, filters = {}) {
  const params = new URLSearchParams()
  params.append('doctor', doctorId)
  if (filters.date) params.append('date', filters.date)

  const response = await httpClient.get('/api/schedules', { params })
  return response.data
}

export async function getDoctorAppointmentsApi(doctorId, filters = {}) {
  const params = new URLSearchParams()
  params.append('doctor', doctorId)
  if (filters.status) params.append('status', filters.status)

  const response = await httpClient.get('/api/appointments', { params })
  return response.data
}

export async function getAppointmentByIdApi(appointmentId) {
  const response = await httpClient.get(`/api/appointments/${appointmentId}`)
  return response.data
}

export async function updateAppointmentStatusApi(appointmentId, data) {
  const response = await httpClient.put(`/api/appointments/${appointmentId}`, data)
  return response.data
}

export async function cancelAppointmentApi(appointmentId, reason = '') {
  const response = await httpClient.post(`/api/appointments/${appointmentId}/cancel`, {
    cancelReason: reason,
  })
  return response.data
}
