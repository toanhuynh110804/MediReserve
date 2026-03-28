const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    specialties: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Specialty' }],
    hospital: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital' },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
    qualifications: String,
    experienceYears: Number,
    bio: String,
    phone: String,
    rating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Doctor', doctorSchema);
