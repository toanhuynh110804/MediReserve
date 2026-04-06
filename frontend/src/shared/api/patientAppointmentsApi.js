import { httpClient } from './httpClient'
import { buildAppointmentPayload } from '../../features/patient/appointmentPayload'

export async function getSchedulesApi(query = {}) {
  const { data } = await httpClient.get('/api/schedules', { params: query })
  return data
}

export async function getDoctorsApi() {
  const { data } = await httpClient.get('/api/doctors')
  return data
}

export async function getMyAppointmentsApi() {
  const { data } = await httpClient.get('/api/appointments')
  return data
}

export async function createAppointmentFromScheduleApi(schedule, notes = '', patientDetails = {}, bookingOptions = {}) {
  const payload = buildAppointmentPayload(schedule, notes, patientDetails, bookingOptions)
  const { data } = await httpClient.post('/api/appointments', payload)
  return data
}

export async function cancelAppointmentApi(appointmentId, cancelReason = '') {
  const { data } = await httpClient.post(`/api/appointments/${appointmentId}/cancel`, {
    cancelReason,
  })
  return data
}
