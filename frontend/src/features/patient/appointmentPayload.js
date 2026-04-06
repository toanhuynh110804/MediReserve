function getId(value) {
  if (!value) return undefined
  if (typeof value === 'string') return value
  if (typeof value === 'object' && value._id) return value._id
  return undefined
}

function normalizeMultilineList(value = '') {
  return value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean)
}

export function buildAppointmentPayload(schedule, notes = '', patientDetails = {}, bookingOptions = {}) {
  const doctorId = getId(schedule?.doctor)
  const scheduleId = getId(schedule)
  const roomId = getId(schedule?.room)
  const departmentId = getId(schedule?.department) || bookingOptions.departmentId

  if (!doctorId || !scheduleId || !schedule?.date || !schedule?.slot) {
    throw new Error('Thiếu dữ liệu lịch khám để tạo lịch hẹn')
  }

  return {
    doctor: doctorId,
    schedule: scheduleId,
    room: roomId,
    department: departmentId,
    date: schedule.date,
    time: schedule.slot,
    notes: notes || undefined,
    patientDetails: {
      fullName: patientDetails.fullName?.trim() || '',
      email: patientDetails.email?.trim() || '',
      phone: patientDetails.phone?.trim() || '',
      dateOfBirth: patientDetails.dateOfBirth || undefined,
      gender: patientDetails.gender?.trim() || '',
      bloodType: patientDetails.bloodType?.trim() || '',
      address: patientDetails.address?.trim() || '',
      symptoms: normalizeMultilineList(patientDetails.symptoms),
      medicalHistory: normalizeMultilineList(patientDetails.medicalHistory),
      allergies: normalizeMultilineList(patientDetails.allergies),
      reasonForVisit: patientDetails.reasonForVisit?.trim() || '',
      insurance: {
        provider: patientDetails.insuranceProvider?.trim() || '',
        policyNumber: patientDetails.insurancePolicyNumber?.trim() || '',
        coverage: patientDetails.insuranceCoverage?.trim() || '',
        validUntil: patientDetails.insuranceValidUntil || undefined,
      },
    },
  }
}
