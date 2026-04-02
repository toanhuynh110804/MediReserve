import { useState } from 'react'
import { buildMedicalRecordPayload, formatMultilineList } from './medicalRecordHelpers'

const EMPTY_FORM = {
  diagnosis: '',
  symptoms: '',
  notes: '',
}

function getInitialFormValues(medicalRecord) {
  if (!medicalRecord) {
    return EMPTY_FORM
  }

  return {
    diagnosis: medicalRecord.diagnosis || '',
    symptoms: formatMultilineList(medicalRecord.symptoms),
    notes: medicalRecord.notes || '',
  }
}

export function MedicalRecordForm({ appointment, doctorId, medicalRecord, onSubmit, disabled = false }) {
  const [formValues, setFormValues] = useState(() => getInitialFormValues(medicalRecord))

  if (!appointment) {
    return (
      <div className="panel">
        <h3>Hồ sơ y tế</h3>
        <p className="muted">Chọn một lịch hẹn đã xác nhận hoặc hoàn thành để lập hồ sơ y tế.</p>
      </div>
    )
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormValues((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    await onSubmit(
      buildMedicalRecordPayload(formValues, {
        appointmentId: appointment._id,
        patientId: appointment.patient?._id,
        doctorId,
      }),
    )
  }

  return (
    <form className="panel" onSubmit={handleSubmit}>
      <h3>{medicalRecord ? 'Cập nhật hồ sơ y tế' : 'Tạo hồ sơ y tế'}</h3>

      <label htmlFor="medical-diagnosis">Chẩn đoán</label>
      <input
        id="medical-diagnosis"
        name="diagnosis"
        value={formValues.diagnosis}
        onChange={handleChange}
        placeholder="Ví dụ: Viêm họng cấp"
        disabled={disabled}
        required
      />

      <label htmlFor="medical-symptoms">Triệu chứng</label>
      <textarea
        id="medical-symptoms"
        name="symptoms"
        rows="4"
        value={formValues.symptoms}
        onChange={handleChange}
        placeholder="Mỗi dòng một triệu chứng"
        disabled={disabled}
      />

      <label htmlFor="medical-notes">Ghi chú khám bệnh</label>
      <textarea
        id="medical-notes"
        name="notes"
        rows="4"
        value={formValues.notes}
        onChange={handleChange}
        placeholder="Hướng dẫn theo dõi, dặn dò tái khám..."
        disabled={disabled}
      />

      <button type="submit" disabled={disabled || !doctorId || !appointment.patient?._id}>
        {medicalRecord ? 'Lưu cập nhật hồ sơ' : 'Tạo hồ sơ'}
      </button>
    </form>
  )
}