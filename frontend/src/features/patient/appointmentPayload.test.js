import { describe, expect, it } from 'vitest'
import { buildAppointmentPayload } from './appointmentPayload'

describe('buildAppointmentPayload', () => {
  it('creates valid payload from populated schedule object', () => {
    const payload = buildAppointmentPayload(
      {
        _id: 'schedule-1',
        doctor: { _id: 'doctor-1' },
        room: { _id: 'room-1' },
        date: '2026-04-10T00:00:00.000Z',
        slot: 'morning',
      },
      'Khám đau đầu',
      {
        fullName: 'Nguyen Van A',
        email: 'a@example.com',
        phone: '0901234567',
        dateOfBirth: '1998-04-01',
        gender: 'Nam',
        bloodType: 'O+',
        address: 'Thu Duc, TP HCM',
        symptoms: 'Sot\nDau hong',
        medicalHistory: 'Hen suyễn',
        allergies: 'Hai san',
        reasonForVisit: 'Khám tổng quát',
        insuranceProvider: 'BHYT',
        insurancePolicyNumber: 'BHYT-01',
        insuranceCoverage: '80%',
        insuranceValidUntil: '2026-12-31',
      },
    )

    expect(payload).toEqual({
      doctor: 'doctor-1',
      schedule: 'schedule-1',
      room: 'room-1',
      department: undefined,
      date: '2026-04-10T00:00:00.000Z',
      time: 'morning',
      notes: 'Khám đau đầu',
      patientDetails: {
        fullName: 'Nguyen Van A',
        email: 'a@example.com',
        phone: '0901234567',
        dateOfBirth: '1998-04-01',
        gender: 'Nam',
        bloodType: 'O+',
        address: 'Thu Duc, TP HCM',
        symptoms: ['Sot', 'Dau hong'],
        medicalHistory: ['Hen suyễn'],
        allergies: ['Hai san'],
        reasonForVisit: 'Khám tổng quát',
        insurance: {
          provider: 'BHYT',
          policyNumber: 'BHYT-01',
          coverage: '80%',
          validUntil: '2026-12-31',
        },
      },
    })
  })

  it('uses booking options for department', () => {
    const payload = buildAppointmentPayload(
      {
        _id: 'schedule-1',
        doctor: { _id: 'doctor-1' },
        date: '2026-04-10T00:00:00.000Z',
        slot: 'morning',
      },
      '',
      { fullName: 'A' },
      { departmentId: 'dep-1' },
    )

    expect(payload.department).toBe('dep-1')
  })

  it('throws if critical schedule fields are missing', () => {
    expect(() => buildAppointmentPayload({})).toThrow('Thiếu dữ liệu lịch khám để tạo lịch hẹn')
  })
})
