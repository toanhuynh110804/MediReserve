import { httpClient } from './httpClient'
import { buildAppointmentPayload } from '../../features/patient/appointmentPayload'

export async function getStaffAppointmentsApi(filters = {}) {
  const response = await httpClient.get('/api/appointments', { params: filters })
  return response.data
}

export async function getStaffRoomsApi() {
  const response = await httpClient.get('/api/rooms')
  return response.data
}

export async function createStaffScheduleApi(data) {
  const response = await httpClient.post('/api/schedules', data)
  return response.data
}

export async function createStaffAppointmentApi(schedule, patientId, notes = '') {
  const payload = {
    ...buildAppointmentPayload(schedule, notes),
    patient: patientId,
  }
  const response = await httpClient.post('/api/appointments', payload)
  return response.data
}

export async function markAppointmentArrivedApi(appointmentId) {
  const response = await httpClient.put(`/api/appointments/${appointmentId}`, { status: 'confirmed' })
  return response.data
}

export async function cancelStaffAppointmentApi(appointmentId, cancelReason = '') {
  const response = await httpClient.post(`/api/appointments/${appointmentId}/cancel`, { cancelReason })
  return response.data
}

export async function createPatientApi(data) {
  const response = await httpClient.post('/api/patients', data)
  return response.data
}

export async function updatePatientApi(patientId, data) {
  const response = await httpClient.put(`/api/patients/${patientId}`, data)
  return response.data
}