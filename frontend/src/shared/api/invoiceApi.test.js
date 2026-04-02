import { describe, expect, it, vi } from 'vitest'
import { getInvoicesApi, getInvoiceByIdApi, createInvoiceApi, updateInvoiceApi, deleteInvoiceApi } from './invoiceApi'
import { httpClient } from './httpClient'

vi.mock('./httpClient')

describe('invoiceApi', () => {
  it('getInvoicesApi fetches invoices with filters', async () => {
    const mockData = [{ _id: '1', patient: 'pat1', total: 500000 }]
    httpClient.get.mockResolvedValue({ data: mockData })

    const result = await getInvoicesApi({ patient: 'pat1' })

    expect(httpClient.get).toHaveBeenCalledWith('/api/invoices', expect.any(Object))
    expect(result).toEqual(mockData)
  })

  it('getInvoiceByIdApi fetches single invoice', async () => {
    const mockData = { _id: '1', patient: 'pat1', total: 500000 }
    httpClient.get.mockResolvedValue({ data: mockData })

    const result = await getInvoiceByIdApi('1')

    expect(httpClient.get).toHaveBeenCalledWith('/api/invoices/1')
    expect(result).toEqual(mockData)
  })

  it('createInvoiceApi creates invoice', async () => {
    const payload = { patient: 'pat1', total: 500000 }
    const mockData = { _id: '1', ...payload }
    httpClient.post.mockResolvedValue({ data: mockData })

    const result = await createInvoiceApi(payload)

    expect(httpClient.post).toHaveBeenCalledWith('/api/invoices', payload)
    expect(result).toEqual(mockData)
  })

  it('updateInvoiceApi updates invoice', async () => {
    const payload = { status: 'paid' }
    const mockData = { _id: '1', ...payload }
    httpClient.put.mockResolvedValue({ data: mockData })

    const result = await updateInvoiceApi('1', payload)

    expect(httpClient.put).toHaveBeenCalledWith('/api/invoices/1', payload)
    expect(result).toEqual(mockData)
  })

  it('deleteInvoiceApi deletes invoice', async () => {
    const mockData = { message: 'Invoice đã bị xóa' }
    httpClient.delete.mockResolvedValue({ data: mockData })

    const result = await deleteInvoiceApi('1')

    expect(httpClient.delete).toHaveBeenCalledWith('/api/invoices/1')
    expect(result).toEqual(mockData)
  })
})
