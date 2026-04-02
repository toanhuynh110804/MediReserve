import { describe, expect, it, vi } from 'vitest'
import {
  createPrescriptionApi,
  getPrescriptionByIdApi,
  getPrescriptionsApi,
  updatePrescriptionApi,
} from './prescriptionApi'
import { httpClient } from './httpClient'

vi.mock('./httpClient')

describe('prescriptionApi', () => {
  it('getPrescriptionsApi fetches prescriptions with filters', async () => {
    const mockData = [{ _id: 'pr-1', doctor: 'doctor-1' }]
    httpClient.get.mockResolvedValue({ data: mockData })

    const result = await getPrescriptionsApi({ doctor: 'doctor-1' })

    expect(httpClient.get).toHaveBeenCalledWith('/api/prescriptions', expect.any(Object))
    expect(result).toEqual(mockData)
  })

  it('getPrescriptionByIdApi fetches a prescription', async () => {
    const mockData = { _id: 'pr-1' }
    httpClient.get.mockResolvedValue({ data: mockData })

    const result = await getPrescriptionByIdApi('pr-1')

    expect(httpClient.get).toHaveBeenCalledWith('/api/prescriptions/pr-1')
    expect(result).toEqual(mockData)
  })

  it('createPrescriptionApi creates a prescription', async () => {
    const payload = { medicalRecord: 'mr-1', status: 'active' }
    const mockData = { _id: 'pr-1', ...payload }
    httpClient.post.mockResolvedValue({ data: mockData })

    const result = await createPrescriptionApi(payload)

    expect(httpClient.post).toHaveBeenCalledWith('/api/prescriptions', payload)
    expect(result).toEqual(mockData)
  })

  it('updatePrescriptionApi updates a prescription', async () => {
    const payload = { status: 'fulfilled' }
    const mockData = { _id: 'pr-1', ...payload }
    httpClient.put.mockResolvedValue({ data: mockData })

    const result = await updatePrescriptionApi('pr-1', payload)

    expect(httpClient.put).toHaveBeenCalledWith('/api/prescriptions/pr-1', payload)
    expect(result).toEqual(mockData)
  })
})