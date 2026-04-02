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
    )

    expect(payload).toEqual({
      doctor: 'doctor-1',
      schedule: 'schedule-1',
      room: 'room-1',
      date: '2026-04-10T00:00:00.000Z',
      time: 'morning',
      notes: 'Khám đau đầu',
    })
  })

  it('throws if critical schedule fields are missing', () => {
    expect(() => buildAppointmentPayload({})).toThrow('Thiếu dữ liệu lịch khám để tạo lịch hẹn')
  })
})
