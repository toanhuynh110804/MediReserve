const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  street: String,
  city: String,
  state: String,
  zip: String,
  country: String,
});

const hospitalSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    description: String,
    address: addressSchema,
    phone: String,
    email: String,
    website: String,
    departments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Department' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Hospital', hospitalSchema);
