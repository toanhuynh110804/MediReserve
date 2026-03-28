const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    code: { type: String, required: true },
    type: { type: String, default: 'general' },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
    capacity: { type: Number, default: 1 },
    status: { type: String, enum: ['available', 'unavailable'], default: 'available' },
    note: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Room', roomSchema);
