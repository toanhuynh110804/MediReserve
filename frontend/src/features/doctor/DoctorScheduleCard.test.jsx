import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DoctorScheduleCard } from './DoctorScheduleCard'

describe('DoctorScheduleCard', () => {
  const mockSchedule = {
    _id: '1',
    date: '2026-04-02T08:00:00Z',
    slot: 'morning',
    capacity: 10,
    bookedCount: 3,
    room: { roomNumber: '101' },
  }

  it('renders schedule details', () => {
    render(<DoctorScheduleCard schedule={mockSchedule} />)
    expect(screen.getByText(/Ngày:/)).toBeInTheDocument()
    expect(screen.getByText(/Khung giờ:/)).toBeInTheDocument()
  })

  it('displays slot label', () => {
    render(<DoctorScheduleCard schedule={mockSchedule} />)
    expect(screen.getByText(/Sáng \(08:00 - 11:00\)/)).toBeInTheDocument()
  })

  it('calculates available slots', () => {
    render(<DoctorScheduleCard schedule={mockSchedule} />)
    expect(screen.getByText(/Còn trống/)).toBeInTheDocument()
    expect(screen.getByText(/7/)).toBeInTheDocument()
  })

  it('returns null when schedule is null', () => {
    const { container } = render(<DoctorScheduleCard schedule={null} />)
    expect(container.firstChild).toBeNull()
  })
})
