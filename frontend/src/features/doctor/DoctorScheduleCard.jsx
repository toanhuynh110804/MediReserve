export function DoctorScheduleCard({ schedule }) {
  if (!schedule) return null

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  }

  const slotLabels = {
    morning: 'Sáng (08:00 - 11:00)',
    afternoon: 'Chiều (13:00 - 17:00)',
    evening: 'Tối (18:00 - 21:00)',
  }

  const available = Math.max((schedule.capacity || 1) - (schedule.bookedCount || 0), 0)

  return (
    <div className="status-box">
      <p>
        <strong>Ngày:</strong> {formatDate(schedule.date)}
      </p>
      <p>
        <strong>Khung giờ:</strong> {slotLabels[schedule.slot] || schedule.slot}
      </p>
      <p>
        <strong>Sức chứa:</strong> {schedule.capacity} chỗ
      </p>
      <p>
        <strong>Đã đặt:</strong> {schedule.bookedCount || 0} chỗ
      </p>
      <p>
        <strong>Còn trống:</strong> {available} chỗ
      </p>
      {schedule.room && (
        <p>
          <strong>Phòng:</strong> {schedule.room.roomNumber || 'N/A'}
        </p>
      )}
    </div>
  )
}
