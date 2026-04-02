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
    const getSchedules = vi.fn().mockResolvedValue([{ _id: 's1', status: 'open' }])
    const getDoctors = vi.fn().mockResolvedValue([{ _id: 'd1' }])
    const getAppointments = vi.fn().mockResolvedValue([{ _id: 'a1' }])

    const result = await fetchPatientBookingSnapshot({
      dateFilter: '2026-04-02',
      getSchedules,
      getDoctors,
      getAppointments,
    })

    expect(getSchedules).toHaveBeenCalledWith({ date: '2026-04-02' })
    expect(result.openSchedules).toHaveLength(1)
    expect(result.doctors).toHaveLength(1)
    expect(result.appointments).toHaveLength(1)
    expect(typeof result.fetchedAt).toBe('number')
  })
})
