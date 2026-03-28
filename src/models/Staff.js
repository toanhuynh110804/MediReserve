const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    hospital: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital' },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
    title: String,
    role: { type: String, enum: ['staff', 'admin', 'manager'], default: 'staff' },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Staff', staffSchema);
