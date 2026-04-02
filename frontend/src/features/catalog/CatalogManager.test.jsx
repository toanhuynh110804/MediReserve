import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { CatalogManager } from './CatalogManager'
import { CATALOG_SCOPE_GROUPS } from './catalogConfig'

vi.mock('../../shared/api/catalogApi', () => ({
  getHospitalsApi: vi.fn().mockResolvedValue([{ _id: 'h1', name: 'BV A', address: { city: 'Huế' } }]),
  getDepartmentsApi: vi.fn().mockResolvedValue([{ _id: 'd1', name: 'Khoa Nội', hospital: { _id: 'h1', name: 'BV A' } }]),
  getSpecialtiesApi: vi.fn().mockResolvedValue([{ _id: 's1', name: 'Tim mạch' }]),
  getInsurancesApi: vi.fn().mockResolvedValue([{ _id: 'i1', provider: 'BHYT', patient: { _id: 'p1', user: { name: 'A' } } }]),
  createHospitalApi: vi.fn().mockResolvedValue({ _id: 'h2' }),
  updateHospitalApi: vi.fn().mockResolvedValue({ _id: 'h1' }),
  deleteHospitalApi: vi.fn().mockResolvedValue({ message: 'ok' }),
  createDepartmentApi: vi.fn().mockResolvedValue({ _id: 'd2' }),
  updateDepartmentApi: vi.fn().mockResolvedValue({ _id: 'd1' }),
  deleteDepartmentApi: vi.fn().mockResolvedValue({ message: 'ok' }),
  createSpecialtyApi: vi.fn().mockResolvedValue({ _id: 's2' }),
  updateSpecialtyApi: vi.fn().mockResolvedValue({ _id: 's1' }),
  deleteSpecialtyApi: vi.fn().mockResolvedValue({ message: 'ok' }),
  createInsuranceApi: vi.fn().mockResolvedValue({ _id: 'i2' }),
  updateInsuranceApi: vi.fn().mockResolvedValue({ _id: 'i1' }),
  deleteInsuranceApi: vi.fn().mockResolvedValue({ message: 'ok' }),
  createMedicineApi: vi.fn().mockResolvedValue({ _id: 'm2' }),
  updateMedicineApi: vi.fn().mockResolvedValue({ _id: 'm1' }),
  deleteMedicineApi: vi.fn().mockResolvedValue({ message: 'ok' }),
}))

vi.mock('../../shared/api/medicineApi', () => ({
  getMedicinesApi: vi.fn().mockResolvedValue([{ _id: 'm1', name: 'Paracetamol', price: 1000, stock: 50 }]),
}))

vi.mock('../../shared/api/patientApi', () => ({
  getPatientsApi: vi.fn().mockResolvedValue([{ _id: 'p1', user: { name: 'Nguyễn Văn A' } }]),
}))

describe('CatalogManager', () => {
  it('renders only structural tabs for admin', async () => {
    render(
      <CatalogManager
        role="admin"
        catalogKeys={CATALOG_SCOPE_GROUPS.admin}
        title="Khu vực quản trị"
        description="Danh mục"
      />,
    )

    expect(await screen.findByText('BV A')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Tạo mới' })).toBeEnabled()
    expect(screen.queryByRole('button', { name: 'Thuốc' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Bảo hiểm' })).not.toBeInTheDocument()
  })

  it('renders only operational tabs for staff', async () => {
    render(
      <CatalogManager
        role="staff"
        catalogKeys={CATALOG_SCOPE_GROUPS.staff}
        title="Khu vực nhân viên"
        description="Danh mục"
      />,
    )

    expect(await screen.findByText('Paracetamol')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Bệnh viện' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Tạo mới' })).toBeEnabled()

    fireEvent.click(screen.getByRole('button', { name: 'Bảo hiểm' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Tạo mới' })).toBeEnabled()
    })
  })
})
