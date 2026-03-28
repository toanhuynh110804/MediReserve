const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema(
  {
    medicalRecord: { type: mongoose.Schema.Types.ObjectId, ref: 'MedicalRecord', required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    items: [
      {
        medicine: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine' },
        dosage: String,
        quantity: Number,
        instructions: String,
      },
    ],
    note: String,
    status: { type: String, enum: ['active', 'fulfilled', 'cancelled'], default: 'active' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Prescription', prescriptionSchema);
