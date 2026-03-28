const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema(
  {
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
    hospital: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital' },
    date: { type: Date, required: true },
    slot: { type: String, required: true },
    capacity: { type: Number, default: 1 },
    bookedCount: { type: Number, default: 0 },
    status: { type: String, enum: ['open', 'closed', 'cancelled'], default: 'open' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Schedule', scheduleSchema);
