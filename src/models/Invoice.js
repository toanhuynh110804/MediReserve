const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema(
  {
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
    items: [
      {
        title: String,
        amount: Number,
      },
    ],
    subTotal: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    status: { type: String, enum: ['unpaid', 'paid', 'partial', 'refunded'], default: 'unpaid' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Invoice', invoiceSchema);
