const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    schedule: { type: mongoose.Schema.Types.ObjectId, ref: 'Schedule', required: true },
    room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    status: { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled', 'no-show'], default: 'pending' },
    paymentStatus: { type: String, enum: ['unpaid', 'paid', 'partial', 'refunded'], default: 'unpaid' },
    notes: String,
    cancelReason: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Appointment', appointmentSchema);
