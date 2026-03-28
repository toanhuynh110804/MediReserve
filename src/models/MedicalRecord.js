const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    diagnosis: String,
    symptoms: [String],
    notes: String,
    tests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'TestResult' }],
    prescriptions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Prescription' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);
