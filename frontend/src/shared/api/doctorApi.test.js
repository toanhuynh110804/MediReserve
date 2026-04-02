import { describe, expect, it, vi } from 'vitest'
import {
  getDoctorSchedulesApi,
  getDoctorAppointmentsApi,
  getAppointmentByIdApi,
  updateAppointmentStatusApi,
  cancelAppointmentApi,
} from './doctorApi'
import { httpClient } from './httpClient'

vi.mock('./httpClient')

describe('doctorApi', () => {
  it('getDoctorSchedulesApi fetches doctor schedules', async () => {
    const mockData = [{ _id: '1', doctor: 'doc1', date: '2026-04-02', slot: 'morning' }]
    httpClient.get.mockResolvedValue({ data: mockData })

    const result = await getDoctorSchedulesApi('doc1')

    expect(httpClient.get).toHaveBeenCalledWith('/api/schedules', expect.any(Object))
    expect(result).toEqual(mockData)
  })

  it('getDoctorAppointmentsApi fetches doctor appointments with filters', async () => {
    const mockData = [{ _id: '1', doctor: 'doc1', status: 'pending' }]
    httpClient.get.mockResolvedValue({ data: mockData })

    const result = await getDoctorAppointmentsApi('doc1', { status: 'pending' })

    expect(httpClient.get).toHaveBeenCalledWith('/api/appointments', expect.any(Object))
    expect(result).toEqual(mockData)
  })

  it('getAppointmentByIdApi fetches single appointment', async () => {
    const mockData = { _id: '1', doctor: 'doc1', status: 'pending' }
    httpClient.get.mockResolvedValue({ data: mockData })

    const result = await getAppointmentByIdApi('1')

    expect(httpClient.get).toHaveBeenCalledWith('/api/appointments/1')
    expect(result).toEqual(mockData)
  })

  it('updateAppointmentStatusApi updates appointment', async () => {
    const payload = { status: 'confirmed' }
    const mockData = { _id: '1', ...payload }
    httpClient.put.mockResolvedValue({ data: mockData })

    const result = await updateAppointmentStatusApi('1', payload)

    expect(httpClient.put).toHaveBeenCalledWith('/api/appointments/1', payload)
    expect(result).toEqual(mockData)
  })

  it('cancelAppointmentApi cancels appointment', async () => {
    const mockData = { message: 'Appointment cancelled' }
    httpClient.post.mockResolvedValue({ data: mockData })

    const result = await cancelAppointmentApi('1', 'Emergency')

    expect(httpClient.post).toHaveBeenCalledWith('/api/appointments/1/cancel', {
      cancelReason: 'Emergency',
    })
    expect(result).toEqual(mockData)
  })
})
