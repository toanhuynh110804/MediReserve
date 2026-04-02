export function normalizeOpenSchedules(schedules = []) {
  return schedules.filter((item) => item?.status === 'open')
}

export function resolveSelectedScheduleId(openSchedules, currentId) {
  if (currentId && openSchedules.some((item) => item._id === currentId)) {
    return currentId
  }
  return openSchedules[0]?._id || ''
}

export async function fetchPatientBookingSnapshot({
  dateFilter,
  getSchedules,
  getDoctors,
  getAppointments,
}) {
  const [scheduleData, doctorData, appointmentData] = await Promise.all([
    getSchedules(dateFilter ? { date: dateFilter } : {}),
    getDoctors(),
    getAppointments(),
  ])

  const openSchedules = normalizeOpenSchedules(scheduleData || [])

  return {
    openSchedules,
    doctors: doctorData || [],
    appointments: appointmentData || [],
    fetchedAt: Date.now(),
  }
}
