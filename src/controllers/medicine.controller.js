const Medicine = require('../models/Medicine');

exports.create = async (req, res) => {
  const medicine = await Medicine.create(req.body);
  res.status(201).json(medicine);
};

exports.getAll = async (req, res) => {
  const medicines = await Medicine.find();
  res.json(medicines);
};

exports.getById = async (req, res) => {
  const medicine = await Medicine.findById(req.params.id);
  if (!medicine) return res.status(404).json({ message: 'Medicine không tồn tại' });
  res.json(medicine);
};

exports.updateById = async (req, res) => {
  const medicine = await Medicine.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!medicine) return res.status(404).json({ message: 'Medicine không tồn tại' });
  res.json(medicine);
};

exports.deleteById = async (req, res) => {
  const medicine = await Medicine.findByIdAndDelete(req.params.id);
  if (!medicine) return res.status(404).json({ message: 'Medicine không tồn tại' });
  res.json({ message: 'Medicine đã bị xóa' });
};