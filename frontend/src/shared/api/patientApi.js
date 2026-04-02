import { httpClient } from './httpClient'

export async function getPatientsApi() {
  const response = await httpClient.get('/api/patients')
  return response.data
}
