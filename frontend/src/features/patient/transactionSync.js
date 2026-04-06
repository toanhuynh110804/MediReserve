export function normalizeOpenSchedules(schedules = []) {
  return schedules.filter((item) => item?.status === 'open')
}

function toDateKey(value) {
  const date = new Date(value)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function buildAvailability(openDepartmentSchedules, dateFilter) {
  const availableCountByDate = openDepartmentSchedules.reduce((acc, schedule) => {
    const key = toDateKey(schedule.date)
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})

  const availableDateKeys = Object.keys(availableCountByDate).sort((a, b) => a.localeCompare(b))
  const selectedDateKey = dateFilter || ''
  const hasAvailabilityOnSelectedDate = selectedDateKey
    ? Boolean(availableCountByDate[selectedDateKey])
    : availableDateKeys.length > 0

  return {
    hasAnyAvailableDoctor: availableDateKeys.length > 0,
    hasAvailabilityOnSelectedDate,
    availableDateKeys,
    availableCountByDate,
  }
}

export function resolveSelectedScheduleId(openSchedules, currentId) {
  if (currentId && openSchedules.some((item) => item._id === currentId)) {
    return currentId
  }
  return openSchedules[0]?._id || ''
}

export async function fetchPatientBookingSnapshot({
  dateFilter,
  departmentFilter,
  getSchedules,
  getDoctors,
  getAppointments,
}) {
  const scheduleQuery = {}
  if (dateFilter) {
    scheduleQuery.date = dateFilter
  }
  if (departmentFilter) {
    scheduleQuery.department = departmentFilter
  }

  const departmentScheduleQuery = departmentFilter
    ? { department: departmentFilter }
    : null

  const [scheduleData, doctorData, appointmentData, departmentScheduleData] = await Promise.all([
    getSchedules(scheduleQuery),
    getDoctors(),
    getAppointments(),
    departmentScheduleQuery ? getSchedules(departmentScheduleQuery) : Promise.resolve([]),
  ])

  const openSchedules = normalizeOpenSchedules(scheduleData || [])
  const availability = departmentFilter
    ? buildAvailability(normalizeOpenSchedules(departmentScheduleData || []), dateFilter)
    : null

  return {
    openSchedules,
    doctors: doctorData || [],
    appointments: appointmentData || [],
    availability,
    fetchedAt: Date.now(),
  }
}
