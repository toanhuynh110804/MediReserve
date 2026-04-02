function getId(value) {
  if (!value) return undefined
  if (typeof value === 'string') return value
  if (typeof value === 'object' && value._id) return value._id
  return undefined
}

export function buildAppointmentPayload(schedule, notes = '') {
  const doctorId = getId(schedule?.doctor)
  const scheduleId = getId(schedule)
  const roomId = getId(schedule?.room)

  if (!doctorId || !scheduleId || !schedule?.date || !schedule?.slot) {
    throw new Error('Thiếu dữ liệu lịch khám để tạo lịch hẹn')
  }

  return {
    doctor: doctorId,
    schedule: scheduleId,
    room: roomId,
    date: schedule.date,
    time: schedule.slot,
    notes: notes || undefined,
  }
}
