import { describe, expect, it, vi } from 'vitest'
import {
  createMedicalRecordApi,
  getMedicalRecordByIdApi,
  getMedicalRecordsApi,
  updateMedicalRecordApi,
} from './medicalRecordApi'
import { httpClient } from './httpClient'

vi.mock('./httpClient')

describe('medicalRecordApi', () => {
  it('getMedicalRecordsApi fetches records with filters', async () => {
    const mockData = [{ _id: 'mr-1', doctor: 'doctor-1' }]
    httpClient.get.mockResolvedValue({ data: mockData })

    const result = await getMedicalRecordsApi({ doctor: 'doctor-1' })

    expect(httpClient.get).toHaveBeenCalledWith('/api/medical-records', expect.any(Object))
    expect(result).toEqual(mockData)
  })

  it('getMedicalRecordByIdApi fetches a record', async () => {
    const mockData = { _id: 'mr-1' }
    httpClient.get.mockResolvedValue({ data: mockData })

    const result = await getMedicalRecordByIdApi('mr-1')

    expect(httpClient.get).toHaveBeenCalledWith('/api/medical-records/mr-1')
    expect(result).toEqual(mockData)
  })

  it('createMedicalRecordApi creates a record', async () => {
    const payload = { appointment: 'apt-1', diagnosis: 'Cảm cúm' }
    const mockData = { _id: 'mr-1', ...payload }
    httpClient.post.mockResolvedValue({ data: mockData })

    const result = await createMedicalRecordApi(payload)

    expect(httpClient.post).toHaveBeenCalledWith('/api/medical-records', payload)
    expect(result).toEqual(mockData)
  })

  it('updateMedicalRecordApi updates a record', async () => {
    const payload = { diagnosis: 'Đau họng' }
    const mockData = { _id: 'mr-1', ...payload }
    httpClient.put.mockResolvedValue({ data: mockData })

    const result = await updateMedicalRecordApi('mr-1', payload)

    expect(httpClient.put).toHaveBeenCalledWith('/api/medical-records/mr-1', payload)
    expect(result).toEqual(mockData)
  })
})