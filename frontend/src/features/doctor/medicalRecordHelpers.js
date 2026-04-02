export function parseMultilineList(value) {
  return value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean)
}

export function formatMultilineList(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return ''
  }

  return items.join('\n')
}

export function buildMedicalRecordPayload(formValues, context) {
  return {
    appointment: context.appointmentId,
    patient: context.patientId,
    doctor: context.doctorId,
    diagnosis: formValues.diagnosis.trim(),
    symptoms: parseMultilineList(formValues.symptoms),
    notes: formValues.notes.trim(),
  }
}

export function normalizePrescriptionItems(items) {
  return items
    .map((item) => ({
      medicine: item.medicine,
      dosage: item.dosage.trim(),
      quantity: Number(item.quantity) || 0,
      instructions: item.instructions.trim(),
    }))
    .filter((item) => item.medicine || item.dosage || item.quantity > 0 || item.instructions)
}

export function buildPrescriptionPayload(formValues, context) {
  return {
    medicalRecord: context.medicalRecordId,
    patient: context.patientId,
    doctor: context.doctorId,
    note: formValues.note.trim(),
    status: formValues.status,
    items: normalizePrescriptionItems(formValues.items),
  }
}

export function getMedicalRecordForAppointment(records, appointmentId) {
  return records.find((record) => record.appointment?._id === appointmentId || record.appointment === appointmentId) || null
}

export function getPrescriptionForMedicalRecord(prescriptions, medicalRecordId) {
  return prescriptions.find(
    (prescription) =>
      prescription.medicalRecord?._id === medicalRecordId ||
      prescription.medicalRecord === medicalRecordId,
  ) || null
}

export function getPatientDisplayName(appointment) {
  const explicitName = appointment?.patient?.user?.name || appointment?.patient?.name
  if (explicitName) {
    return explicitName
  }

  if (appointment?.patient?._id) {
    return `BN ${appointment.patient._id.slice(-6)}`
  }

  return 'N/A'
}

export function canManageClinicalRecord(status) {
  return ['confirmed', 'completed'].includes(status)
}