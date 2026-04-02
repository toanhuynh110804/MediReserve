import { describe, expect, it, vi } from 'vitest'
import {
  createDepartmentApi,
  createHospitalApi,
  createInsuranceApi,
  createMedicineApi,
  createSpecialtyApi,
  deleteHospitalApi,
  deleteInsuranceApi,
  deleteMedicineApi,
  getDepartmentsApi,
  getHospitalsApi,
  getInsurancesApi,
  getSpecialtiesApi,
  updateDepartmentApi,
  updateHospitalApi,
  updateInsuranceApi,
  updateMedicineApi,
  updateSpecialtyApi,
} from './catalogApi'
import { httpClient } from './httpClient'

vi.mock('./httpClient')

describe('catalogApi', () => {
  it('gets hospitals', async () => {
    httpClient.get.mockResolvedValue({ data: [{ _id: 'h1' }] })
    const result = await getHospitalsApi()
    expect(httpClient.get).toHaveBeenCalledWith('/api/hospitals')
    expect(result).toEqual([{ _id: 'h1' }])
  })

  it('creates and updates hospital', async () => {
    const payload = { name: 'Hospital A' }
    httpClient.post.mockResolvedValue({ data: payload })
    httpClient.put.mockResolvedValue({ data: payload })

    await createHospitalApi(payload)
    await updateHospitalApi('h1', payload)

    expect(httpClient.post).toHaveBeenCalledWith('/api/hospitals', payload)
    expect(httpClient.put).toHaveBeenCalledWith('/api/hospitals/h1', payload)
  })

  it('deletes hospital', async () => {
    httpClient.delete.mockResolvedValue({ data: { message: 'ok' } })
    await deleteHospitalApi('h1')
    expect(httpClient.delete).toHaveBeenCalledWith('/api/hospitals/h1')
  })

  it('gets and mutates departments', async () => {
    const payload = { name: 'Khoa Nội', hospital: 'h1' }
    httpClient.get.mockResolvedValue({ data: [payload] })
    httpClient.post.mockResolvedValue({ data: payload })
    httpClient.put.mockResolvedValue({ data: payload })

    await getDepartmentsApi()
    await createDepartmentApi(payload)
    await updateDepartmentApi('d1', payload)

    expect(httpClient.get).toHaveBeenCalledWith('/api/departments')
    expect(httpClient.post).toHaveBeenCalledWith('/api/departments', payload)
    expect(httpClient.put).toHaveBeenCalledWith('/api/departments/d1', payload)
  })

  it('gets and mutates specialties', async () => {
    const payload = { name: 'Tim mạch' }
    httpClient.get.mockResolvedValue({ data: [payload] })
    httpClient.post.mockResolvedValue({ data: payload })
    httpClient.put.mockResolvedValue({ data: payload })

    await getSpecialtiesApi()
    await createSpecialtyApi(payload)
    await updateSpecialtyApi('s1', payload)

    expect(httpClient.get).toHaveBeenCalledWith('/api/specialties')
    expect(httpClient.post).toHaveBeenCalledWith('/api/specialties', payload)
    expect(httpClient.put).toHaveBeenCalledWith('/api/specialties/s1', payload)
  })

  it('creates, updates, and deletes medicine', async () => {
    const payload = { name: 'Paracetamol' }
    httpClient.post.mockResolvedValue({ data: payload })
    httpClient.put.mockResolvedValue({ data: payload })
    httpClient.delete.mockResolvedValue({ data: { message: 'ok' } })

    await createMedicineApi(payload)
    await updateMedicineApi('m1', payload)
    await deleteMedicineApi('m1')

    expect(httpClient.post).toHaveBeenCalledWith('/api/medicines', payload)
    expect(httpClient.put).toHaveBeenCalledWith('/api/medicines/m1', payload)
    expect(httpClient.delete).toHaveBeenCalledWith('/api/medicines/m1')
  })

  it('gets, creates, updates, and deletes insurance', async () => {
    const payload = { patient: 'p1', provider: 'BHYT' }
    httpClient.get.mockResolvedValue({ data: [payload] })
    httpClient.post.mockResolvedValue({ data: payload })
    httpClient.put.mockResolvedValue({ data: payload })
    httpClient.delete.mockResolvedValue({ data: { message: 'ok' } })

    await getInsurancesApi()
    await createInsuranceApi(payload)
    await updateInsuranceApi('i1', payload)
    await deleteInsuranceApi('i1')

    expect(httpClient.get).toHaveBeenCalledWith('/api/insurances')
    expect(httpClient.post).toHaveBeenCalledWith('/api/insurances', payload)
    expect(httpClient.put).toHaveBeenCalledWith('/api/insurances/i1', payload)
    expect(httpClient.delete).toHaveBeenCalledWith('/api/insurances/i1')
  })
})
