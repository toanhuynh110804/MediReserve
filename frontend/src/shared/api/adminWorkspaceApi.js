import { httpClient } from './httpClient'

export async function getAdminDoctorsApi() {
  const response = await httpClient.get('/api/doctors')
  return response.data
}

export async function createDoctorApi(data) {
  const response = await httpClient.post('/api/doctors', data)
  return response.data
}

export async function updateDoctorApi(doctorId, data) {
  const response = await httpClient.put(`/api/doctors/${doctorId}`, data)
  return response.data
}

export async function deleteDoctorApi(doctorId) {
  const response = await httpClient.delete(`/api/doctors/${doctorId}`)
  return response.data
}

export async function getRoomsApi() {
  const response = await httpClient.get('/api/rooms')
  return response.data
}

export async function createRoomApi(data) {
  const response = await httpClient.post('/api/rooms', data)
  return response.data
}

export async function updateRoomApi(roomId, data) {
  const response = await httpClient.put(`/api/rooms/${roomId}`, data)
  return response.data
}

export async function deleteRoomApi(roomId) {
  const response = await httpClient.delete(`/api/rooms/${roomId}`)
  return response.data
}

export async function getAdminSchedulesApi(filters = {}) {
  const response = await httpClient.get('/api/schedules', { params: filters })
  return response.data
}

export async function createScheduleApi(data) {
  const response = await httpClient.post('/api/schedules', data)
  return response.data
}

export async function updateScheduleApi(scheduleId, data) {
  const response = await httpClient.put(`/api/schedules/${scheduleId}`, data)
  return response.data
}

export async function deleteScheduleApi(scheduleId) {
  const response = await httpClient.delete(`/api/schedules/${scheduleId}`)
  return response.data
}

export async function getAdminAppointmentsApi(filters = {}) {
  const response = await httpClient.get('/api/appointments', { params: filters })
  return response.data
}