import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { UserManagementPanel } from './UserManagementPanel'

vi.mock('../../shared/api/userManagementApi', () => ({
  getUsersApi: vi.fn().mockResolvedValue([
    { _id: 'u1', name: 'Admin A', email: 'admin@example.com', role: 'admin', phone: '0123' },
    { _id: 'u2', name: 'Staff B', email: 'staff@example.com', role: 'staff', phone: '0456' },
  ]),
  getStaffsApi: vi.fn().mockResolvedValue([
    {
      _id: 's1',
      user: { _id: 'u2', name: 'Staff B', email: 'staff@example.com' },
      hospital: { _id: 'h1', name: 'BV A' },
      department: { _id: 'd1', name: 'Khoa Nội' },
      title: 'Điều phối',
      role: 'staff',
      status: 'active',
    },
  ]),
  getRolesApi: vi.fn().mockResolvedValue([{ _id: 'r1', name: 'auditor', permissions: ['users.read'] }]),
  createStaffApi: vi.fn().mockResolvedValue({ _id: 's2' }),
  updateStaffApi: vi.fn().mockResolvedValue({ _id: 's1' }),
  deleteStaffApi: vi.fn().mockResolvedValue({ message: 'ok' }),
  createRoleApi: vi.fn().mockResolvedValue({ _id: 'r2' }),
  updateRoleApi: vi.fn().mockResolvedValue({ _id: 'r1' }),
  deleteRoleApi: vi.fn().mockResolvedValue({ message: 'ok' }),
}))

vi.mock('../../shared/api/catalogApi', () => ({
  getHospitalsApi: vi.fn().mockResolvedValue([{ _id: 'h1', name: 'BV A' }]),
  getDepartmentsApi: vi.fn().mockResolvedValue([{ _id: 'd1', name: 'Khoa Nội' }]),
}))

describe('UserManagementPanel', () => {
  it('renders users list and allows filtering control', async () => {
    render(<UserManagementPanel />)

    expect(await screen.findByText('Admin A')).toBeInTheDocument()
    expect(screen.getByLabelText('Lọc theo role')).toHaveValue('all')
  })

  it('switches to staff tab and prefills edit form', async () => {
    render(<UserManagementPanel />)

    await screen.findByText('Admin A')

    fireEvent.click(screen.getByRole('button', { name: 'Nhân sự' }))

    expect(await screen.findByText('Điều phối')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Chỉnh sửa' }))

    await waitFor(() => {
      expect(screen.getByLabelText('Chức danh')).toHaveValue('Điều phối')
    })
  })

  it('switches to roles tab and shows role data', async () => {
    render(<UserManagementPanel />)

    await screen.findByText('Admin A')

    fireEvent.click(screen.getByRole('button', { name: 'Roles' }))

    expect(await screen.findByText('auditor')).toBeInTheDocument()
    expect(screen.getByText('users.read')).toBeInTheDocument()
  })
})
