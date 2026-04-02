import { httpClient } from './httpClient'

export async function getPrescriptionsApi(filters = {}) {
  const params = new URLSearchParams()
  if (filters.patient) params.append('patient', filters.patient)
  if (filters.doctor) params.append('doctor', filters.doctor)

  const response = await httpClient.get('/api/prescriptions', { params })
  return response.data
}

export async function getPrescriptionByIdApi(prescriptionId) {
  const response = await httpClient.get(`/api/prescriptions/${prescriptionId}`)
  return response.data
}

export async function createPrescriptionApi(data) {
  const response = await httpClient.post('/api/prescriptions', data)
  return response.data
}

export async function updatePrescriptionApi(prescriptionId, data) {
  const response = await httpClient.put(`/api/prescriptions/${prescriptionId}`, data)
  return response.data
}