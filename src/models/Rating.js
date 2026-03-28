const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
    hospital: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital' },
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
    score: { type: Number, required: true, min: 1, max: 5 },
    comment: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Rating', ratingSchema);
