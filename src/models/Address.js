const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema(
  {
    street: String,
    city: String,
    district: String,
    ward: String,
    state: String,
    zip: String,
    country: String,
    coords: {
      lat: Number,
      lng: Number,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Address', addressSchema);
