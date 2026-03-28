const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
    hospital: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital' },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: String,
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Review', reviewSchema);
