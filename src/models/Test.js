const mongoose = require('mongoose');

const testSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,
    cost: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Test', testSchema);
