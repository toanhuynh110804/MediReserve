const mongoose = require('mongoose');

const shiftSchema = new mongoose.Schema(
  {
    staff: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    type: { type: String, enum: ['morning', 'afternoon', 'evening', 'night'], default: 'morning' },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Shift', shiftSchema);
