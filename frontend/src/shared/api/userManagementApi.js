import { httpClient } from './httpClient'

export async function getUsersApi(filters = {}) {
  const params = new URLSearchParams()
  if (filters.role) params.append('role', filters.role)

  const response = await httpClient.get('/api/users', { params })
  return response.data
}

export async function getStaffsApi() {
  const response = await httpClient.get('/api/staff')
  return response.data
}

export async function createStaffApi(data) {
  const response = await httpClient.post('/api/staff', data)
  return response.data
}

export async function updateStaffApi(staffId, data) {
  const response = await httpClient.put(`/api/staff/${staffId}`, data)
  return response.data
}

export async function deleteStaffApi(staffId) {
  const response = await httpClient.delete(`/api/staff/${staffId}`)
  return response.data
}

export async function getRolesApi() {
  const response = await httpClient.get('/api/roles')
  return response.data
}

export async function createRoleApi(data) {
  const response = await httpClient.post('/api/roles', data)
  return response.data
}

export async function updateRoleApi(roleId, data) {
  const response = await httpClient.put(`/api/roles/${roleId}`, data)
  return response.data
}

export async function deleteRoleApi(roleId) {
  const response = await httpClient.delete(`/api/roles/${roleId}`)
  return response.data
}
