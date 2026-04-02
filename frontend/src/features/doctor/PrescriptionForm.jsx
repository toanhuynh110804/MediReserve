import { useState } from 'react'
import { buildPrescriptionPayload } from './medicalRecordHelpers'

function createEmptyItem() {
  return {
    medicine: '',
    dosage: '',
    quantity: '',
    instructions: '',
  }
}

function getInitialFormValues(prescription) {
  if (!prescription) {
    return {
      note: '',
      status: 'active',
      items: [createEmptyItem()],
    }
  }

  return {
    note: prescription.note || '',
    status: prescription.status || 'active',
    items:
      prescription.items?.length > 0
        ? prescription.items.map((item) => ({
            medicine: item.medicine?._id || item.medicine || '',
            dosage: item.dosage || '',
            quantity: item.quantity || '',
            instructions: item.instructions || '',
          }))
        : [createEmptyItem()],
  }
}

export function PrescriptionForm({
  appointment,
  doctorId,
  medicalRecord,
  medicines,
  prescription,
  onSubmit,
  disabled = false,
}) {
  const [formValues, setFormValues] = useState(() => getInitialFormValues(prescription))

  if (!medicalRecord || !appointment) {
    return (
      <div className="panel">
        <h3>Đơn thuốc</h3>
        <p className="muted">Tạo hoặc chọn hồ sơ y tế trước khi kê đơn thuốc.</p>
      </div>
    )
  }

  const handleRootChange = (event) => {
    const { name, value } = event.target
    setFormValues((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const handleItemChange = (index, field, value) => {
    setFormValues((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) => {
        if (itemIndex !== index) {
          return item
        }

        return {
          ...item,
          [field]: value,
        }
      }),
    }))
  }

  const addItem = () => {
    setFormValues((current) => ({
      ...current,
      items: [...current.items, createEmptyItem()],
    }))
  }

  const removeItem = (index) => {
    setFormValues((current) => ({
      ...current,
      items:
        current.items.length === 1
          ? [createEmptyItem()]
          : current.items.filter((_, itemIndex) => itemIndex !== index),
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    await onSubmit(
      buildPrescriptionPayload(formValues, {
        medicalRecordId: medicalRecord._id,
        patientId: appointment.patient?._id,
        doctorId,
      }),
    )
  }

  return (
    <form className="panel" onSubmit={handleSubmit}>
      <h3>{prescription ? 'Cập nhật đơn thuốc' : 'Kê đơn thuốc'}</h3>

      <label htmlFor="prescription-note">Ghi chú đơn thuốc</label>
      <textarea
        id="prescription-note"
        name="note"
        rows="3"
        value={formValues.note}
        onChange={handleRootChange}
        placeholder="Lưu ý khi dùng thuốc hoặc theo dõi thêm"
        disabled={disabled}
      />

      <label htmlFor="prescription-status">Trạng thái đơn thuốc</label>
      <select
        id="prescription-status"
        name="status"
        value={formValues.status}
        onChange={handleRootChange}
        disabled={disabled}
      >
        <option value="active">Đang hiệu lực</option>
        <option value="fulfilled">Đã cấp phát</option>
        <option value="cancelled">Đã hủy</option>
      </select>

      <div>
        <p><strong>Thuốc kê đơn</strong></p>
        {formValues.items.map((item, index) => (
          <div key={`${index}-${item.medicine}`} className="panel" style={{ marginBottom: '0.75rem' }}>
            <label htmlFor={`medicine-${index}`}>Thuốc #{index + 1}</label>
            <select
              id={`medicine-${index}`}
              value={item.medicine}
              onChange={(event) => handleItemChange(index, 'medicine', event.target.value)}
              disabled={disabled}
            >
              <option value="">Chọn thuốc</option>
              {medicines.map((medicine) => (
                <option key={medicine._id} value={medicine._id}>
                  {medicine.name}
                </option>
              ))}
            </select>

            <label htmlFor={`dosage-${index}`}>Liều dùng</label>
            <input
              id={`dosage-${index}`}
              value={item.dosage}
              onChange={(event) => handleItemChange(index, 'dosage', event.target.value)}
              placeholder="Ví dụ: 2 viên x 3 lần/ngày"
              disabled={disabled}
            />

            <label htmlFor={`quantity-${index}`}>Số lượng</label>
            <input
              id={`quantity-${index}`}
              type="number"
              min="0"
              value={item.quantity}
              onChange={(event) => handleItemChange(index, 'quantity', event.target.value)}
              disabled={disabled}
            />

            <label htmlFor={`instructions-${index}`}>Hướng dẫn sử dụng</label>
            <input
              id={`instructions-${index}`}
              value={item.instructions}
              onChange={(event) => handleItemChange(index, 'instructions', event.target.value)}
              placeholder="Ví dụ: uống sau ăn"
              disabled={disabled}
            />

            <button type="button" onClick={() => removeItem(index)} disabled={disabled}>
              Xóa dòng thuốc
            </button>
          </div>
        ))}
      </div>

      <div className="actions">
        <button type="button" onClick={addItem} disabled={disabled}>
          Thêm dòng thuốc
        </button>
        <button type="submit" disabled={disabled || !doctorId || !appointment.patient?._id}>
          {prescription ? 'Lưu cập nhật đơn thuốc' : 'Tạo đơn thuốc'}
        </button>
      </div>
    </form>
  )
}