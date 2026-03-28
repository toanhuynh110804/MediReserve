const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    invoice: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', required: true },
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
    method: { type: String, enum: ['cash', 'card', 'insurance', 'online'], default: 'cash' },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'completed', 'failed', 'refunded'], default: 'pending' },
    transactionId: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);
