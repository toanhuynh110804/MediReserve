import { describe, expect, it } from 'vitest'
import { canTransitionStatus, getAppointmentPatientLabel, renderAppointmentStatus } from './appointmentHelpers'

describe('appointmentHelpers', () => {
  it('renderAppointmentStatus returns correct label and color', () => {
    const result = renderAppointmentStatus('pending')
    expect(result.label).toBe('Chờ phê duyệt')
    expect(result.color).toBe('#fbc02d')
  })

  it('renderAppointmentStatus handles unknown status', () => {
    const result = renderAppointmentStatus('unknown')
    expect(result.label).toBe('unknown')
    expect(result.color).toBe('#999')
  })

  it('canTransitionStatus validates valid transitions', () => {
    expect(canTransitionStatus('pending', 'confirmed')).toBe(true)
    expect(canTransitionStatus('pending', 'cancelled')).toBe(true)
    expect(canTransitionStatus('confirmed', 'completed')).toBe(true)
  })

  it('canTransitionStatus rejects invalid transitions', () => {
    expect(canTransitionStatus('pending', 'completed')).toBe(false)
    expect(canTransitionStatus('completed', 'confirmed')).toBe(false)
    expect(canTransitionStatus('cancelled', 'pending')).toBe(false)
  })

  it('getAppointmentPatientLabel falls back to patient code when name is missing', () => {
    expect(getAppointmentPatientLabel({ patient: { _id: 'patient-123456' } })).toBe('BN 123456')
  })

  it('getAppointmentPatientLabel prefers patient details snapshot', () => {
    expect(getAppointmentPatientLabel({ patientDetails: { fullName: 'Bệnh nhân A' } })).toBe('Bệnh nhân A')
  })
})
