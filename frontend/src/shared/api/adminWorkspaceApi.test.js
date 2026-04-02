import { describe, expect, it, vi } from 'vitest'
import {
  createDoctorApi,
  createRoomApi,
  createScheduleApi,
  deleteDoctorApi,
  deleteRoomApi,
  deleteScheduleApi,
  getAdminAppointmentsApi,
  getAdminDoctorsApi,
  getAdminSchedulesApi,
  getRoomsApi,
  updateDoctorApi,
  updateRoomApi,
  updateScheduleApi,
} from './adminWorkspaceApi'
import { httpClient } from './httpClient'

vi.mock('./httpClient')

describe('adminWorkspaceApi', () => {
  it('loads doctor, room, schedule, and appointment data', async () => {
    httpClient.get.mockResolvedValue({ data: [{ _id: '1' }] })

    await getAdminDoctorsApi()
    await getRoomsApi()
    await getAdminSchedulesApi({ status: 'open' })
    await getAdminAppointmentsApi({ status: 'pending' })

    expect(httpClient.get).toHaveBeenCalledWith('/api/doctors')
    expect(httpClient.get).toHaveBeenCalledWith('/api/rooms')
    expect(httpClient.get).toHaveBeenCalledWith('/api/schedules', { params: { status: 'open' } })
    expect(httpClient.get).toHaveBeenCalledWith('/api/appointments', { params: { status: 'pending' } })
  })

  it('creates, updates, and deletes admin managed resources', async () => {
    const payload = { name: 'payload' }
    httpClient.post.mockResolvedValue({ data: payload })
    httpClient.put.mockResolvedValue({ data: payload })
    httpClient.delete.mockResolvedValue({ data: { message: 'ok' } })

    await createDoctorApi(payload)
    await updateDoctorApi('d1', payload)
    await deleteDoctorApi('d1')
    await createRoomApi(payload)
    await updateRoomApi('r1', payload)
    await deleteRoomApi('r1')
    await createScheduleApi(payload)
    await updateScheduleApi('s1', payload)
    await deleteScheduleApi('s1')

    expect(httpClient.post).toHaveBeenCalledWith('/api/doctors', payload)
    expect(httpClient.put).toHaveBeenCalledWith('/api/doctors/d1', payload)
    expect(httpClient.delete).toHaveBeenCalledWith('/api/doctors/d1')
    expect(httpClient.post).toHaveBeenCalledWith('/api/rooms', payload)
    expect(httpClient.put).toHaveBeenCalledWith('/api/rooms/r1', payload)
    expect(httpClient.delete).toHaveBeenCalledWith('/api/rooms/r1')
    expect(httpClient.post).toHaveBeenCalledWith('/api/schedules', payload)
    expect(httpClient.put).toHaveBeenCalledWith('/api/schedules/s1', payload)
    expect(httpClient.delete).toHaveBeenCalledWith('/api/schedules/s1')
  })
})