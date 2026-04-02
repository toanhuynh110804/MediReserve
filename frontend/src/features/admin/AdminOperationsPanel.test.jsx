import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { AdminOperationsPanel } from './AdminOperationsPanel'

vi.mock('../../shared/api/adminWorkspaceApi', () => ({
  getAdminDoctorsApi: vi.fn().mockResolvedValue([
    { _id: 'd1', user: { _id: 'u1', name: 'BS An', email: 'doctor@example.com' }, hospital: { name: 'BV A' }, department: { name: 'Nội' }, active: true, specialties: [] },
  ]),
  createDoctorApi: vi.fn().mockResolvedValue({ _id: 'd2' }),
  updateDoctorApi: vi.fn().mockResolvedValue({ _id: 'd1' }),
  deleteDoctorApi: vi.fn().mockResolvedValue({ message: 'ok' }),
  getRoomsApi: vi.fn().mockResolvedValue([{ _id: 'r1', code: 'P101', department: { _id: 'dep1', name: 'Nội' }, type: 'general', status: 'available' }]),
  createRoomApi: vi.fn().mockResolvedValue({ _id: 'r2' }),
  updateRoomApi: vi.fn().mockResolvedValue({ _id: 'r1' }),
  deleteRoomApi: vi.fn().mockResolvedValue({ message: 'ok' }),
  getAdminSchedulesApi: vi.fn().mockResolvedValue([{ _id: 's1', doctor: { user: { name: 'BS An' } }, room: { code: 'P101' }, date: '2026-04-02', slot: 'morning', status: 'open' }]),
  createScheduleApi: vi.fn().mockResolvedValue({ _id: 's2' }),
  updateScheduleApi: vi.fn().mockResolvedValue({ _id: 's1' }),
  deleteScheduleApi: vi.fn().mockResolvedValue({ message: 'ok' }),
  getAdminAppointmentsApi: vi.fn().mockResolvedValue([{ _id: 'a1', patient: { user: { name: 'BN A' } }, doctor: { user: { name: 'BS An' } }, date: '2026-04-02', time: 'morning', status: 'pending' }]),
}))

vi.mock('../../shared/api/userManagementApi', () => ({
  getUsersApi: vi.fn().mockResolvedValue([{ _id: 'u1', name: 'BS An', email: 'doctor@example.com' }]),
}))

vi.mock('../../shared/api/catalogApi', () => ({
  getHospitalsApi: vi.fn().mockResolvedValue([{ _id: 'h1', name: 'BV A' }]),
  getDepartmentsApi: vi.fn().mockResolvedValue([{ _id: 'dep1', name: 'Nội' }]),
  getSpecialtiesApi: vi.fn().mockResolvedValue([{ _id: 'sp1', name: 'Tim mạch' }]),
}))

describe('AdminOperationsPanel', () => {
  it('renders doctor management data', async () => {
    render(<AdminOperationsPanel />)

    expect(await screen.findByText('BS An')).toBeInTheDocument()
    expect(screen.getAllByText('BV A').length).toBeGreaterThan(0)
  })

  it('switches to appointments tab for read-only overview', async () => {
    render(<AdminOperationsPanel />)

    await screen.findByText('BS An')
    fireEvent.click(screen.getByRole('button', { name: 'Toàn bộ lịch hẹn' }))

    expect(await screen.findByText('BN A')).toBeInTheDocument()
    expect(screen.getByText('Admin chỉ giám sát, không trực tiếp tạo hoặc cập nhật lịch hẹn.')).toBeInTheDocument()
  })
})