const Specialty = require('../models/Specialty');

exports.create = async (req, res) => {
  const specialty = await Specialty.create(req.body);
  res.status(201).json(specialty);
};

exports.getAll = async (req, res) => {
  const specialties = await Specialty.find();
  res.json(specialties);
};

exports.getById = async (req, res) => {
  const specialty = await Specialty.findById(req.params.id);
  if (!specialty) return res.status(404).json({ message: 'Specialty không tồn tại' });
  res.json(specialty);
};

exports.updateById = async (req, res) => {
  const specialty = await Specialty.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!specialty) return res.status(404).json({ message: 'Specialty không tồn tại' });
  res.json(specialty);
};

exports.deleteById = async (req, res) => {
  const specialty = await Specialty.findByIdAndDelete(req.params.id);
  if (!specialty) return res.status(404).json({ message: 'Specialty không tồn tại' });
  res.json({ message: 'Specialty đã bị xóa' });
};
