const Payment = require('../models/Payment');
const Invoice = require('../models/Invoice');

exports.create = async (req, res) => {
  const payment = await Payment.create(req.body);

  if (payment.invoice) {
    const invoice = await Invoice.findById(payment.invoice);
    if (invoice) {
      invoice.status = payment.status === 'completed' ? 'paid' : invoice.status;
      if (payment.amount) {
        const outstanding = invoice.total - payment.amount;
        invoice.status = outstanding <= 0 ? 'paid' : 'partial';
      }
      await invoice.save();
    }
  }

  res.status(201).json(payment);
};

exports.getAll = async (req, res) => {
  const query = {};
  if (req.query.invoice) query.invoice = req.query.invoice;
  if (req.query.patient) query.patient = req.query.patient;

  const payments = await Payment.find(query).populate('invoice appointment patient');
  res.json(payments);
};

exports.getById = async (req, res) => {
  const payment = await Payment.findById(req.params.id).populate('invoice appointment patient');
  if (!payment) return res.status(404).json({ message: 'Payment không tồn tại' });
  res.json(payment);
};

exports.updateById = async (req, res) => {
  const payment = await Payment.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('invoice appointment patient');
  if (!payment) return res.status(404).json({ message: 'Payment không tồn tại' });
  res.json(payment);
};

exports.deleteById = async (req, res) => {
  const payment = await Payment.findByIdAndDelete(req.params.id);
  if (!payment) return res.status(404).json({ message: 'Payment không tồn tại' });
  res.json({ message: 'Payment đã bị xóa' });
};
