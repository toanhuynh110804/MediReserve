import { httpClient } from './httpClient'

export async function getHospitalsApi() {
  const response = await httpClient.get('/api/hospitals')
  return response.data
}

export async function createHospitalApi(data) {
  const response = await httpClient.post('/api/hospitals', data)
  return response.data
}

export async function updateHospitalApi(hospitalId, data) {
  const response = await httpClient.put(`/api/hospitals/${hospitalId}`, data)
  return response.data
}

export async function deleteHospitalApi(hospitalId) {
  const response = await httpClient.delete(`/api/hospitals/${hospitalId}`)
  return response.data
}

export async function getDepartmentsApi() {
  const response = await httpClient.get('/api/departments')
  return response.data
}

export async function createDepartmentApi(data) {
  const response = await httpClient.post('/api/departments', data)
  return response.data
}

export async function updateDepartmentApi(departmentId, data) {
  const response = await httpClient.put(`/api/departments/${departmentId}`, data)
  return response.data
}

export async function deleteDepartmentApi(departmentId) {
  const response = await httpClient.delete(`/api/departments/${departmentId}`)
  return response.data
}

export async function getSpecialtiesApi() {
  const response = await httpClient.get('/api/specialties')
  return response.data
}

export async function createSpecialtyApi(data) {
  const response = await httpClient.post('/api/specialties', data)
  return response.data
}

export async function updateSpecialtyApi(specialtyId, data) {
  const response = await httpClient.put(`/api/specialties/${specialtyId}`, data)
  return response.data
}

export async function deleteSpecialtyApi(specialtyId) {
  const response = await httpClient.delete(`/api/specialties/${specialtyId}`)
  return response.data
}

export async function createMedicineApi(data) {
  const response = await httpClient.post('/api/medicines', data)
  return response.data
}

export async function updateMedicineApi(medicineId, data) {
  const response = await httpClient.put(`/api/medicines/${medicineId}`, data)
  return response.data
}

export async function deleteMedicineApi(medicineId) {
  const response = await httpClient.delete(`/api/medicines/${medicineId}`)
  return response.data
}

export async function getInsurancesApi() {
  const response = await httpClient.get('/api/insurances')
  return response.data
}

export async function createInsuranceApi(data) {
  const response = await httpClient.post('/api/insurances', data)
  return response.data
}

export async function updateInsuranceApi(insuranceId, data) {
  const response = await httpClient.put(`/api/insurances/${insuranceId}`, data)
  return response.data
}

export async function deleteInsuranceApi(insuranceId) {
  const response = await httpClient.delete(`/api/insurances/${insuranceId}`)
  return response.data
}
