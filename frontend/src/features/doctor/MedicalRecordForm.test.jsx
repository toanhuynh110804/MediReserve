import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { MedicalRecordForm } from './MedicalRecordForm'

describe('MedicalRecordForm', () => {
  const appointment = {
    _id: 'apt-1',
    patient: { _id: 'patient-1' },
  }

  it('renders empty placeholder when no appointment is selected', () => {
    render(<MedicalRecordForm appointment={null} doctorId="doctor-1" onSubmit={vi.fn()} />)

    expect(screen.getByText(/Chọn một lịch hẹn đã xác nhận/)).toBeInTheDocument()
  })

  it('prefills form from existing record', () => {
    render(
      <MedicalRecordForm
        appointment={appointment}
        doctorId="doctor-1"
        medicalRecord={{ diagnosis: 'Cảm cúm', symptoms: ['Sốt'], notes: 'Theo dõi' }}
        onSubmit={vi.fn()}
      />,
    )

    expect(screen.getByDisplayValue('Cảm cúm')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Sốt')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Theo dõi')).toBeInTheDocument()
  })

  it('submits normalized medical record payload', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)

    render(<MedicalRecordForm appointment={appointment} doctorId="doctor-1" onSubmit={onSubmit} />)

    fireEvent.change(screen.getByLabelText('Chẩn đoán'), { target: { value: 'Viêm họng' } })
    fireEvent.change(screen.getByLabelText('Triệu chứng'), { target: { value: 'Sốt\nHo' } })
    fireEvent.change(screen.getByLabelText('Ghi chú khám bệnh'), { target: { value: 'Tái khám sau 3 ngày' } })
    fireEvent.submit(screen.getByRole('button', { name: 'Tạo hồ sơ' }).closest('form'))

    expect(onSubmit).toHaveBeenCalledWith({
      appointment: 'apt-1',
      patient: 'patient-1',
      doctor: 'doctor-1',
      diagnosis: 'Viêm họng',
      symptoms: ['Sốt', 'Ho'],
      notes: 'Tái khám sau 3 ngày',
    })
  })
})