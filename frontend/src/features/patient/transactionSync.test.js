import { describe, expect, it, vi } from 'vitest'
import {
  fetchPatientBookingSnapshot,
  normalizeOpenSchedules,
  resolveSelectedScheduleId,
} from './transactionSync'

describe('transactionSync helpers', () => {
  it('filters schedules to open status only', () => {
    const result = normalizeOpenSchedules([
      { _id: 's1', status: 'open' },
      { _id: 's2', status: 'closed' },
      { _id: 's3', status: 'cancelled' },
    ])

    expect(result).toEqual([{ _id: 's1', status: 'open' }])
  })

  it('keeps selected schedule if still present', () => {
    const selected = resolveSelectedScheduleId(
      [
        { _id: 's1', status: 'open' },
        { _id: 's2', status: 'open' },
      ],
      's2',
    )

    expect(selected).toBe('s2')
  })

  it('falls back to first open schedule when previous one disappears', () => {
    const selected = resolveSelectedScheduleId(
      [
        { _id: 's10', status: 'open' },
        { _id: 's11', status: 'open' },
      ],
      'old-id',
    )

    expect(selected).toBe('s10')
  })

  it('fetches unified snapshot for schedules/doctors/appointments', async () => {
    const getSchedules = vi
      .fn()
      .mockResolvedValueOnce([{ _id: 's1', status: 'open', date: '2026-04-02T00:00:00.000Z' }])
      .mockResolvedValueOnce([
        { _id: 's1', status: 'open', date: '2026-04-02T00:00:00.000Z' },
        { _id: 's2', status: 'open', date: '2026-04-05T00:00:00.000Z' },
      ])
    const getDoctors = vi.fn().mockResolvedValue([{ _id: 'd1' }])
    const getAppointments = vi.fn().mockResolvedValue([{ _id: 'a1' }])

    const result = await fetchPatientBookingSnapshot({
      dateFilter: '2026-04-02',
      departmentFilter: 'dep-1',
      getSchedules,
      getDoctors,
      getAppointments,
    })

    expect(getSchedules).toHaveBeenNthCalledWith(1, { date: '2026-04-02', department: 'dep-1' })
    expect(getSchedules).toHaveBeenNthCalledWith(2, { department: 'dep-1' })
    expect(result.openSchedules).toHaveLength(1)
    expect(result.doctors).toHaveLength(1)
    expect(result.appointments).toHaveLength(1)
    expect(result.availability).toMatchObject({
      hasAnyAvailableDoctor: true,
      hasAvailabilityOnSelectedDate: true,
      availableDateKeys: ['2026-04-02', '2026-04-05'],
    })
    expect(typeof result.fetchedAt).toBe('number')
  })

  it('returns unavailable status when department has no open schedules', async () => {
    const getSchedules = vi.fn().mockResolvedValueOnce([]).mockResolvedValueOnce([])
    const getDoctors = vi.fn().mockResolvedValue([])
    const getAppointments = vi.fn().mockResolvedValue([])

    const result = await fetchPatientBookingSnapshot({
      dateFilter: '2026-04-02',
      departmentFilter: 'dep-2',
      getSchedules,
      getDoctors,
      getAppointments,
    })

    expect(result.availability).toMatchObject({
      hasAnyAvailableDoctor: false,
      hasAvailabilityOnSelectedDate: false,
      availableDateKeys: [],
    })
  })
})
