import { describe, expect, it } from 'vitest'
import {
  buildMedicalRecordPayload,
  buildPrescriptionPayload,
  canManageClinicalRecord,
  formatMultilineList,
  getMedicalRecordForAppointment,
  getPatientDisplayName,
  getPrescriptionForMedicalRecord,
  normalizePrescriptionItems,
  parseMultilineList,
} from './medicalRecordHelpers'

describe('medicalRecordHelpers', () => {
  it('parseMultilineList trims and removes empty values', () => {
    expect(parseMultilineList('Sốt\n\n Ho \n, Đau họng ')).toEqual(['Sốt', 'Ho', 'Đau họng'])
  })

  it('formatMultilineList joins values for textarea display', () => {
    expect(formatMultilineList(['Sốt', 'Ho'])).toBe('Sốt\nHo')
  })

  it('buildMedicalRecordPayload maps context and form fields', () => {
    const payload = buildMedicalRecordPayload(
      {
        diagnosis: 'Viêm họng ',
        symptoms: 'Sốt\nHo',
        notes: 'Uống nhiều nước ',
      },
      {
        appointmentId: 'apt-1',
        patientId: 'patient-1',
        doctorId: 'doctor-1',
      },
    )

    expect(payload).toEqual({
      appointment: 'apt-1',
      patient: 'patient-1',
      doctor: 'doctor-1',
      diagnosis: 'Viêm họng',
      symptoms: ['Sốt', 'Ho'],
      notes: 'Uống nhiều nước',
    })
  })

  it('normalizePrescriptionItems filters empty rows and coerces quantity', () => {
    expect(
      normalizePrescriptionItems([
        { medicine: 'med-1', dosage: '2 viên', quantity: '5', instructions: 'Sau ăn' },
        { medicine: '', dosage: ' ', quantity: '', instructions: ' ' },
      ]),
    ).toEqual([
      { medicine: 'med-1', dosage: '2 viên', quantity: 5, instructions: 'Sau ăn' },
    ])
  })

  it('buildPrescriptionPayload maps record context and items', () => {
    const payload = buildPrescriptionPayload(
      {
        note: 'Theo dõi thêm',
        status: 'active',
        items: [{ medicine: 'med-1', dosage: '1 viên', quantity: '7', instructions: 'Sáng' }],
      },
      {
        medicalRecordId: 'mr-1',
        patientId: 'patient-1',
        doctorId: 'doctor-1',
      },
    )

    expect(payload).toEqual({
      medicalRecord: 'mr-1',
      patient: 'patient-1',
      doctor: 'doctor-1',
      note: 'Theo dõi thêm',
      status: 'active',
      items: [{ medicine: 'med-1', dosage: '1 viên', quantity: 7, instructions: 'Sáng' }],
    })
  })

  it('finds medical record and prescription by relation id', () => {
    const records = [{ _id: 'mr-1', appointment: { _id: 'apt-1' } }]
    const prescriptions = [{ _id: 'pr-1', medicalRecord: { _id: 'mr-1' } }]

    expect(getMedicalRecordForAppointment(records, 'apt-1')).toEqual(records[0])
    expect(getPrescriptionForMedicalRecord(prescriptions, 'mr-1')).toEqual(prescriptions[0])
  })

  it('returns fallback patient label and clinical status rule', () => {
    expect(getPatientDisplayName({ patient: { _id: 'patient-123456' } })).toBe('BN 123456')
    expect(canManageClinicalRecord('confirmed')).toBe(true)
    expect(canManageClinicalRecord('pending')).toBe(false)
  })
})