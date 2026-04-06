const mongoose = require('mongoose');

const patientDetailsSchema = new mongoose.Schema(
  {
    fullName: String,
    email: String,
    phone: String,
    dateOfBirth: Date,
    gender: String,
    bloodType: String,
    address: String,
    symptoms: [String],
    medicalHistory: [String],
    allergies: [String],
    reasonForVisit: String,
    insurance: {
      provider: String,
      policyNumber: String,
      coverage: String,
      validUntil: Date,
    },
  },
  { _id: false }
);

const appointmentSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    schedule: { type: mongoose.Schema.Types.ObjectId, ref: 'Schedule', required: true },
    room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    status: { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled', 'no-show'], default: 'pending' },
    notes: String,
    patientDetails: patientDetailsSchema,
    cancelReason: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Appointment', appointmentSchema);
