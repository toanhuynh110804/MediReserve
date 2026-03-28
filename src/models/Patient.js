const mongoose = require('mongoose');

const insuranceSchema = new mongoose.Schema({
  provider: String,
  policyNumber: String,
  coverage: String,
  validUntil: Date,
});

const patientSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    dateOfBirth: Date,
    gender: String,
    bloodType: String,
    medicalHistory: [String],
    allergies: [String],
    insurance: insuranceSchema,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Patient', patientSchema);
