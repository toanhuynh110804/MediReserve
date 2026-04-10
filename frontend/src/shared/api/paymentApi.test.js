import { describe, expect, it, vi } from 'vitest'
import { getPaymentsApi, getPaymentByIdApi, createPaymentApi, updatePaymentApi, deletePaymentApi } from './paymentApi'
import { httpClient } from './httpClient'

vi.mock('./httpClient')

describe('paymentApi', () => {
  it('getPaymentsApi fetches payments with filters', async () => {
    const mockData = [{ _id: '1', patient: 'pat1', amount: 500000 }]
    httpClient.get.mockResolvedValue({ data: mockData })

    const result = await getPaymentsApi({ patient: 'pat1' })

    expect(httpClient.get).toHaveBeenCalledWith('/api/payments', expect.any(Object))
    expect(result).toEqual(mockData)
  })

  it('getPaymentByIdApi fetches single payment', async () => {
    const mockData = { _id: '1', patient: 'pat1', amount: 500000 }
    httpClient.get.mockResolvedValue({ data: mockData })

    const result = await getPaymentByIdApi('1')

    expect(httpClient.get).toHaveBeenCalledWith('/api/payments/1')
    expect(result).toEqual(mockData)
  })

  it('createPaymentApi creates payment', async () => {
    const payload = { patient: 'pat1', amount: 500000 }
    const mockData = { _id: '1', ...payload }
    httpClient.post.mockResolvedValue({ data: mockData })

    const result = await createPaymentApi(payload)

    expect(httpClient.post).toHaveBeenCalledWith('/api/payments', payload)
    expect(result).toEqual(mockData)
  })

  it('updatePaymentApi updates payment', async () => {
    const payload = { status: 'completed' }
    const mockData = { _id: '1', ...payload }
    httpClient.put.mockResolvedValue({ data: mockData })

    const result = await updatePaymentApi('1', payload)

    expect(httpClient.put).toHaveBeenCalledWith('/api/payments/1', payload)
    expect(result).toEqual(mockData)
  })

  it('deletePaymentApi deletes payment', async () => {
    const mockData = { message: 'Payment đã bị xóa' }
    httpClient.delete.mockResolvedValue({ data: mockData })

    const result = await deletePaymentApi('1')

    expect(httpClient.delete).toHaveBeenCalledWith('/api/payments/1')
    expect(result).toEqual(mockData)
  })
})
