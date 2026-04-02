import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { AppointmentActionRow } from './AppointmentActionRow'

describe('AppointmentActionRow', () => {
  const mockAppointment = {
    _id: '123456789',
    status: 'pending',
    date: '2026-04-02T09:00:00Z',
    patient: { user: { name: 'Nguyễn Văn A' } },
  }

  const mockOnStatusChange = vi.fn()
  const mockOnOpenClinicalWorkspace = vi.fn()

  it('renders appointment details in row', () => {
    render(
      <table>
        <tbody>
          <AppointmentActionRow
            appointment={mockAppointment}
            onStatusChange={mockOnStatusChange}
            onOpenClinicalWorkspace={mockOnOpenClinicalWorkspace}
          />
        </tbody>
      </table>,
    )
    expect(screen.getByText(/23456789/)).toBeInTheDocument()
    expect(screen.getByText(/Nguyễn Văn A/)).toBeInTheDocument()
  })

  it('displays pending appointment actions', async () => {
    render(
      <table>
        <tbody>
          <AppointmentActionRow
            appointment={mockAppointment}
            onStatusChange={mockOnStatusChange}
            onOpenClinicalWorkspace={mockOnOpenClinicalWorkspace}
          />
        </tbody>
      </table>,
    )

    const buttons = screen.getAllByRole('button')
    expect(buttons.map((b) => b.textContent)).toContain('Hồ sơ khám')
    expect(buttons.map((b) => b.textContent)).toContain('Xác nhận')
    expect(buttons.map((b) => b.textContent)).toContain('Hủy')
  })

  it('disables actions when disabled prop is true', () => {
    render(
      <table>
        <tbody>
          <AppointmentActionRow
            appointment={mockAppointment}
            onStatusChange={mockOnStatusChange}
            onOpenClinicalWorkspace={mockOnOpenClinicalWorkspace}
            disabled={true}
          />
        </tbody>
      </table>,
    )

    const buttons = screen.getAllByRole('button')
    buttons.forEach((btn) => {
      expect(btn).toBeDisabled()
    })
  })

  it('shows status with correct color', () => {
    render(
      <table>
        <tbody>
          <AppointmentActionRow
            appointment={mockAppointment}
            onStatusChange={mockOnStatusChange}
            onOpenClinicalWorkspace={mockOnOpenClinicalWorkspace}
          />
        </tbody>
      </table>,
    )

    const status = screen.getByText('Chờ phê duyệt')
    expect(status).toHaveStyle({ color: '#fbc02d' })
  })

  it('opens clinical workspace when button is clicked', () => {
    render(
      <table>
        <tbody>
          <AppointmentActionRow
            appointment={mockAppointment}
            onStatusChange={mockOnStatusChange}
            onOpenClinicalWorkspace={mockOnOpenClinicalWorkspace}
          />
        </tbody>
      </table>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Hồ sơ khám' }))

    expect(mockOnOpenClinicalWorkspace).toHaveBeenCalledWith(mockAppointment)
  })
})
