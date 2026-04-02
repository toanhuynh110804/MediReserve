import { httpClient } from './httpClient'

export async function getMedicalRecordsApi(filters = {}) {
  const params = new URLSearchParams()
  if (filters.patient) params.append('patient', filters.patient)
  if (filters.doctor) params.append('doctor', filters.doctor)

  const response = await httpClient.get('/api/medical-records', { params })
  return response.data
}

export async function getMedicalRecordByIdApi(recordId) {
  const response = await httpClient.get(`/api/medical-records/${recordId}`)
  return response.data
}

export async function createMedicalRecordApi(data) {
  const response = await httpClient.post('/api/medical-records', data)
  return response.data
}

export async function updateMedicalRecordApi(recordId, data) {
  const response = await httpClient.put(`/api/medical-records/${recordId}`, data)
  return response.data
}