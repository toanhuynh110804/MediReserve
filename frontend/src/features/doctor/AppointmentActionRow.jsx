import { useState } from 'react'
import { renderAppointmentStatus, canTransitionStatus } from './appointmentHelpers'

export function AppointmentActionRow({ appointment, onStatusChange, disabled = false }) {
  const [updatingStatus, setUpdatingStatus] = useState(null)

  const status = renderAppointmentStatus(appointment.status)

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handleStatusChange = async (newStatus) => {
    if (!canTransitionStatus(appointment.status, newStatus)) {
      return
    }
    setUpdatingStatus(newStatus)
    try {
      await onStatusChange(appointment._id, { status: newStatus })
    } finally {
      setUpdatingStatus(null)
    }
  }

  const getAvailableTransitions = () => {
    const transitions = {
      pending: [
        { status: 'confirmed', label: 'Xác nhận' },
        { status: 'cancelled', label: 'Hủy' },
      ],
      confirmed: [
        { status: 'completed', label: 'Hoàn thành' },
        { status: 'cancelled', label: 'Hủy' },
      ],
    }
    return transitions[appointment.status] || []
  }

  return (
    <tr>
      <td>{appointment._id?.slice(-8)}</td>
      <td>{appointment.patient?.user?.name || 'N/A'}</td>
      <td>{formatDate(appointment.date)}</td>
      <td>
        <span style={{ color: status.color, fontWeight: 'bold' }}>
          {status.label}
        </span>
      </td>
      <td>
        <div className="actions" style={{ flexDirection: 'column', gap: '0.5rem' }}>
          {getAvailableTransitions().map((trans) => (
            <button
              key={trans.status}
              type="button"
              onClick={() => handleStatusChange(trans.status)}
              disabled={
                updatingStatus !== null || disabled || updatingStatus === trans.status
              }
              style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}
            >
              {updatingStatus === trans.status ? 'Đang...' : trans.label}
            </button>
          ))}
        </div>
      </td>
    </tr>
  )
}
