import { httpClient } from './httpClient'

export async function getInvoicesApi(filters = {}) {
  const params = new URLSearchParams()
  if (filters.patient) params.append('patient', filters.patient)
  if (filters.appointment) params.append('appointment', filters.appointment)

  const response = await httpClient.get('/api/invoices', { params })
  return response.data
}

export async function getInvoiceByIdApi(invoiceId) {
  const response = await httpClient.get(`/api/invoices/${invoiceId}`)
  return response.data
}

export async function createInvoiceApi(data) {
  const response = await httpClient.post('/api/invoices', data)
  return response.data
}

export async function updateInvoiceApi(invoiceId, data) {
  const response = await httpClient.put(`/api/invoices/${invoiceId}`, data)
  return response.data
}

export async function deleteInvoiceApi(invoiceId) {
  const response = await httpClient.delete(`/api/invoices/${invoiceId}`)
  return response.data
}
