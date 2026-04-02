import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { StaffOperationsPanel } from './StaffOperationsPanel'

vi.mock('../../shared/api/userManagementApi', () => ({
  getUsersApi: vi.fn().mockResolvedValue([{ _id: 'u1', name: 'BN A', email: 'patient@example.com' }]),
}))

vi.mock('../../shared/api/patientApi', () => ({
  getPatientsApi: vi.fn().mockResolvedValue([{ _id: 'p1', user: { _id: 'u1', name: 'BN A', email: 'patient@example.com' }, gender: 'Nam', bloodType: 'O' }]),
}))

vi.mock('../../shared/api/patientAppointmentsApi', () => ({
  getDoctorsApi: vi.fn().mockResolvedValue([{ _id: 'd1', user: { name: 'BS An' } }]),
  getSchedulesApi: vi.fn().mockResolvedValue([{ _id: 's1', doctor: { _id: 'd1' }, date: '2026-04-02', slot: 'morning', status: 'open' }]),
}))

vi.mock('../../shared/api/staffWorkspaceApi', () => ({
  getStaffAppointmentsApi: vi.fn().mockResolvedValue([{ _id: 'a1', patient: { user: { name: 'BN A' } }, doctor: { user: { name: 'BS An' } }, date: '2026-04-02', status: 'pending' }]),
  createStaffAppointmentApi: vi.fn().mockResolvedValue({ _id: 'a2' }),
  markAppointmentArrivedApi: vi.fn().mockResolvedValue({ _id: 'a1' }),
  cancelStaffAppointmentApi: vi.fn().mockResolvedValue({ _id: 'a1' }),
  createPatientApi: vi.fn().mockResolvedValue({ _id: 'p2' }),
  updatePatientApi: vi.fn().mockResolvedValue({ _id: 'p1' }),
}))

describe('StaffOperationsPanel', () => {
  it('renders patient intake data', async () => {
    render(<StaffOperationsPanel />)

    expect(await screen.findByText('BN A')).toBeInTheDocument()
    expect(screen.getByLabelText('Tìm kiếm bệnh nhân')).toHaveValue('')
  })

  it('switches to appointments tab', async () => {
    render(<StaffOperationsPanel />)

    await screen.findByText('BN A')
    fireEvent.click(screen.getByRole('button', { name: 'Lịch khám' }))

    expect(await screen.findByText('Nhân viên là người tạo lịch khám thủ công cho bệnh nhân tại quầy tiếp nhận.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Đã đến' })).toBeInTheDocument()
  })
})