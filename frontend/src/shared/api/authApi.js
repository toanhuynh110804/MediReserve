import { httpClient } from './httpClient'

export async function loginApi(payload) {
  const { data } = await httpClient.post('/api/auth/login', payload)
  return data
}

export async function registerApi(payload) {
  const { data } = await httpClient.post('/api/auth/register', payload)
  return data
}

export async function profileApi() {
  const { data } = await httpClient.get('/api/auth/profile')
  return data
}