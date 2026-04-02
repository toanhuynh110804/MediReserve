import { httpClient } from './httpClient'

export async function getPaymentsApi(filters = {}) {
  const params = new URLSearchParams()
  if (filters.invoice) params.append('invoice', filters.invoice)
  if (filters.patient) params.append('patient', filters.patient)

  const response = await httpClient.get('/api/payments', { params })
  return response.data
}

export async function getPaymentByIdApi(paymentId) {
  const response = await httpClient.get(`/api/payments/${paymentId}`)
  return response.data
}

export async function createPaymentApi(data) {
  const response = await httpClient.post('/api/payments', data)
  return response.data
}

export async function updatePaymentApi(paymentId, data) {
  const response = await httpClient.put(`/api/payments/${paymentId}`, data)
  return response.data
}

export async function deletePaymentApi(paymentId) {
  const response = await httpClient.delete(`/api/payments/${paymentId}`)
  return response.data
}
