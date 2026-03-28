const Invoice = require('../models/Invoice');

exports.create = async (req, res) => {
  const invoice = await Invoice.create(req.body);
  res.status(201).json(invoice);
};

exports.getAll = async (req, res) => {
  const query = {};
  if (req.query.patient) query.patient = req.query.patient;
  if (req.query.appointment) query.appointment = req.query.appointment;

  const invoices = await Invoice.find(query).populate('appointment patient doctor');
  res.json(invoices);
};

exports.getById = async (req, res) => {
  const invoice = await Invoice.findById(req.params.id).populate('appointment patient doctor');
  if (!invoice) return res.status(404).json({ message: 'Invoice không tồn tại' });
  res.json(invoice);
};

exports.updateById = async (req, res) => {
  const invoice = await Invoice.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('appointment patient doctor');
  if (!invoice) return res.status(404).json({ message: 'Invoice không tồn tại' });
  res.json(invoice);
};

exports.deleteById = async (req, res) => {
  const invoice = await Invoice.findByIdAndDelete(req.params.id);
  if (!invoice) return res.status(404).json({ message: 'Invoice không tồn tại' });
  res.json({ message: 'Invoice đã bị xóa' });
};
