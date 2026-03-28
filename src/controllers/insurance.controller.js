const Insurance = require('../models/Insurance');

exports.create = async (req, res) => {
  const insurance = await Insurance.create(req.body);
  res.status(201).json(insurance);
};

exports.getAll = async (req, res) => {
  const insurances = await Insurance.find().populate('patient');
  res.json(insurances);
};

exports.getById = async (req, res) => {
  const insurance = await Insurance.findById(req.params.id).populate('patient');
  if (!insurance) return res.status(404).json({ message: 'Insurance không tồn tại' });
  res.json(insurance);
};

exports.updateById = async (req, res) => {
  const insurance = await Insurance.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('patient');
  if (!insurance) return res.status(404).json({ message: 'Insurance không tồn tại' });
  res.json(insurance);
};

exports.deleteById = async (req, res) => {
  const insurance = await Insurance.findByIdAndDelete(req.params.id);
  if (!insurance) return res.status(404).json({ message: 'Insurance không tồn tại' });
  res.json({ message: 'Insurance đã bị xóa' });
};