/**
 * DateSelect – ba dropdown Ngày / Tháng / Năm thay cho <input type="date">
 * value / onChange theo định dạng YYYY-MM-DD (giống input[type=date])
 */
import { useMemo } from 'react'

const MONTHS = [
  { value: '01', label: 'Tháng 1' },
  { value: '02', label: 'Tháng 2' },
  { value: '03', label: 'Tháng 3' },
  { value: '04', label: 'Tháng 4' },
  { value: '05', label: 'Tháng 5' },
  { value: '06', label: 'Tháng 6' },
  { value: '07', label: 'Tháng 7' },
  { value: '08', label: 'Tháng 8' },
  { value: '09', label: 'Tháng 9' },
  { value: '10', label: 'Tháng 10' },
  { value: '11', label: 'Tháng 11' },
  { value: '12', label: 'Tháng 12' },
]

function daysInMonth(year, month) {
  if (!year || !month) return 31
  return new Date(Number(year), Number(month), 0).getDate()
}

function padTwo(n) {
  return String(n).padStart(2, '0')
}

/**
 * @param {{ value: string, onChange: (v: string) => void, disabled?: boolean, minYear?: number, maxYear?: number }} props
 */
export function DateSelect({ value, onChange, disabled, minYear, maxYear }) {
  const parts = value ? value.split('-') : ['', '', '']
  const year  = parts[0] || ''
  const month = parts[1] || ''
  const day   = parts[2] || ''

  const currentYear = new Date().getFullYear()
  const min = minYear ?? currentYear - 100
  const max = maxYear ?? currentYear + 10

  const years = useMemo(() => {
    const arr = []
    for (let y = max; y >= min; y--) arr.push(y)
    return arr
  }, [min, max])

  const days = useMemo(() => {
    const count = daysInMonth(year, month)
    return Array.from({ length: count }, (_, i) => padTwo(i + 1))
  }, [year, month])

  function emit(newYear, newMonth, newDay) {
    if (!newYear || !newMonth || !newDay) {
      // trả chuỗi rỗng khi chưa đủ
      onChange('')
      return
    }
    onChange(`${newYear}-${newMonth}-${newDay}`)
  }

  function handleYear(e) {
    const v = e.target.value
    // clamp day nếu tháng 2
    const clampedDay = day && daysInMonth(v, month) < Number(day)
      ? padTwo(daysInMonth(v, month))
      : day
    emit(v, month, clampedDay)
  }

  function handleMonth(e) {
    const v = e.target.value
    const clampedDay = day && daysInMonth(year, v) < Number(day)
      ? padTwo(daysInMonth(year, v))
      : day
    emit(year, v, clampedDay)
  }

  function handleDay(e) {
    emit(year, month, e.target.value)
  }

  const selectStyle = { flex: 1 }

  return (
    <span style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
      <select value={day} onChange={handleDay} disabled={disabled} style={selectStyle} aria-label="Ngày">
        <option value="">Ngày</option>
        {days.map((d) => <option key={d} value={d}>{Number(d)}</option>)}
      </select>
      <select value={month} onChange={handleMonth} disabled={disabled} style={selectStyle} aria-label="Tháng">
        <option value="">Tháng</option>
        {MONTHS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
      </select>
      <select value={year} onChange={handleYear} disabled={disabled} style={selectStyle} aria-label="Năm">
        <option value="">Năm</option>
        {years.map((y) => <option key={y} value={String(y)}>{y}</option>)}
      </select>
    </span>
  )
}
