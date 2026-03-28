const mongoose = require('mongoose');

const insuranceSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    type: String,
    provider: String,
    policyNumber: String,
    coveragePercent: Number,
    validFrom: Date,
    validUntil: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Insurance', insuranceSchema);
