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
}))

describe('StaffOperationsPanel', () => {
  it('renders appointment management workspace', async () => {
    render(<StaffOperationsPanel />)

    expect(await screen.findByRole('heading', { name: 'Tạo lịch khám cho bệnh nhân' })).toBeInTheDocument()
    expect(screen.getByText('Khu vực nhân viên hành chính')).toBeInTheDocument()
  })

  it('shows appointment actions without patient profile form', async () => {
    render(<StaffOperationsPanel />)

    await screen.findByRole('heading', { name: 'Danh sách lịch khám' })

    expect(screen.getByText('Nhân viên chỉ dùng khu vực này để xử lý lịch khám cho bệnh nhân đã có tài khoản/hồ sơ nền trong hệ thống.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Đã đến' })).toBeInTheDocument()
    expect(screen.queryByText('Tạo hồ sơ bệnh nhân')).not.toBeInTheDocument()
  })
})