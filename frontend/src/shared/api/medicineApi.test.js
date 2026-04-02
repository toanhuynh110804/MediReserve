import { describe, expect, it, vi } from 'vitest'
import { getMedicinesApi } from './medicineApi'
import { httpClient } from './httpClient'

vi.mock('./httpClient')

describe('medicineApi', () => {
  it('getMedicinesApi fetches medicine catalog', async () => {
    const mockData = [{ _id: 'med-1', name: 'Paracetamol' }]
    httpClient.get.mockResolvedValue({ data: mockData })

    const result = await getMedicinesApi()

    expect(httpClient.get).toHaveBeenCalledWith('/api/medicines')
    expect(result).toEqual(mockData)
  })
})