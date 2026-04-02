import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { PrescriptionForm } from './PrescriptionForm'

describe('PrescriptionForm', () => {
  const appointment = {
    _id: 'apt-1',
    patient: { _id: 'patient-1' },
  }

  const medicalRecord = { _id: 'mr-1' }
  const medicines = [{ _id: 'med-1', name: 'Paracetamol' }]

  it('shows placeholder when medical record is missing', () => {
    render(
      <PrescriptionForm
        appointment={appointment}
        doctorId="doctor-1"
        medicalRecord={null}
        medicines={medicines}
        onSubmit={vi.fn()}
      />,
    )

    expect(screen.getByText(/Tạo hoặc chọn hồ sơ y tế trước khi kê đơn thuốc/)).toBeInTheDocument()
  })

  it('prefills form from existing prescription', () => {
    render(
      <PrescriptionForm
        appointment={appointment}
        doctorId="doctor-1"
        medicalRecord={medicalRecord}
        medicines={medicines}
        prescription={{
          note: 'Tiếp tục dùng thuốc',
          status: 'fulfilled',
          items: [{ medicine: { _id: 'med-1' }, dosage: '1 viên', quantity: 5, instructions: 'Sau ăn' }],
        }}
        onSubmit={vi.fn()}
      />,
    )

    expect(screen.getByDisplayValue('Tiếp tục dùng thuốc')).toBeInTheDocument()
    expect(screen.getByLabelText('Trạng thái đơn thuốc')).toHaveValue('fulfilled')
    expect(screen.getByDisplayValue('1 viên')).toBeInTheDocument()
  })

  it('adds a new medicine row', () => {
    render(
      <PrescriptionForm
        appointment={appointment}
        doctorId="doctor-1"
        medicalRecord={medicalRecord}
        medicines={medicines}
        onSubmit={vi.fn()}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Thêm dòng thuốc' }))

    expect(screen.getByLabelText('Thuốc #2')).toBeInTheDocument()
  })

  it('submits normalized prescription payload', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)

    render(
      <PrescriptionForm
        appointment={appointment}
        doctorId="doctor-1"
        medicalRecord={medicalRecord}
        medicines={medicines}
        onSubmit={onSubmit}
      />,
    )

    fireEvent.change(screen.getByLabelText('Ghi chú đơn thuốc'), { target: { value: 'Dùng 5 ngày' } })
    fireEvent.change(screen.getByLabelText('Thuốc #1'), { target: { value: 'med-1' } })
    fireEvent.change(screen.getByLabelText('Liều dùng'), { target: { value: '2 viên/ngày' } })
    fireEvent.change(screen.getByLabelText('Số lượng'), { target: { value: '10' } })
    fireEvent.change(screen.getByLabelText('Hướng dẫn sử dụng'), { target: { value: 'Sau ăn sáng' } })
    fireEvent.submit(screen.getByRole('button', { name: 'Tạo đơn thuốc' }).closest('form'))

    expect(onSubmit).toHaveBeenCalledWith({
      medicalRecord: 'mr-1',
      patient: 'patient-1',
      doctor: 'doctor-1',
      note: 'Dùng 5 ngày',
      status: 'active',
      items: [{ medicine: 'med-1', dosage: '2 viên/ngày', quantity: 10, instructions: 'Sau ăn sáng' }],
    })
  })
})