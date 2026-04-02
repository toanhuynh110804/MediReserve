import axios from 'axios'
import { ENV } from '../constants/env'
import { authStorage } from '../utils/authStorage'

export const httpClient = axios.create({
  baseURL: ENV.apiBaseUrl,
  timeout: 15000,
})

httpClient.interceptors.request.use((config) => {
  const token = authStorage.getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      authStorage.clearToken()
      authStorage.clearUser()
    }
    return Promise.reject(error)
  },
)
