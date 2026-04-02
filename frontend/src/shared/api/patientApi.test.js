import { describe, expect, it, vi } from 'vitest'
import { getPatientsApi } from './patientApi'
import { httpClient } from './httpClient'

vi.mock('./httpClient')

describe('patientApi', () => {
  it('gets patients', async () => {
    httpClient.get.mockResolvedValue({ data: [{ _id: 'p1' }] })

    const result = await getPatientsApi()

    expect(httpClient.get).toHaveBeenCalledWith('/api/patients')
    expect(result).toEqual([{ _id: 'p1' }])
  })
})
