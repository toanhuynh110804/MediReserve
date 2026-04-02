import { describe, expect, it, vi } from 'vitest'
import {
  cancelStaffAppointmentApi,
  createPatientApi,
  createStaffAppointmentApi,
  getStaffAppointmentsApi,
  markAppointmentArrivedApi,
  updatePatientApi,
} from './staffWorkspaceApi'
import { httpClient } from './httpClient'

vi.mock('./httpClient')
vi.mock('../../features/patient/appointmentPayload', () => ({
  buildAppointmentPayload: vi.fn().mockReturnValue({ schedule: 'schedule-1', doctor: 'doctor-1' }),
}))

describe('staffWorkspaceApi', () => {
  it('loads appointments', async () => {
    httpClient.get.mockResolvedValue({ data: [{ _id: 'a1' }] })

    const result = await getStaffAppointmentsApi({ status: 'pending' })

    expect(httpClient.get).toHaveBeenCalledWith('/api/appointments', { params: { status: 'pending' } })
    expect(result).toEqual([{ _id: 'a1' }])
  })

  it('creates and updates staff-managed records', async () => {
    const payload = { user: 'u1' }
    httpClient.post.mockResolvedValue({ data: payload })
    httpClient.put.mockResolvedValue({ data: payload })

    await createStaffAppointmentApi({ _id: 'schedule-1' }, 'patient-1', 'note')
    await markAppointmentArrivedApi('a1')
    await cancelStaffAppointmentApi('a1', 'cancel')
    await createPatientApi(payload)
    await updatePatientApi('p1', payload)

    expect(httpClient.post).toHaveBeenCalledWith('/api/appointments', {
      schedule: 'schedule-1',
      doctor: 'doctor-1',
      patient: 'patient-1',
    })
    expect(httpClient.put).toHaveBeenCalledWith('/api/appointments/a1', { status: 'confirmed' })
    expect(httpClient.post).toHaveBeenCalledWith('/api/appointments/a1/cancel', { cancelReason: 'cancel' })
    expect(httpClient.post).toHaveBeenCalledWith('/api/patients', payload)
    expect(httpClient.put).toHaveBeenCalledWith('/api/patients/p1', payload)
  })
})