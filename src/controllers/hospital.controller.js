const Hospital = require('../models/Hospital');

exports.create = async (req, res) => {
  const hospital = await Hospital.create(req.body);
  res.status(201).json(hospital);
};

exports.getAll = async (req, res) => {
  const hospitals = await Hospital.find().populate('departments');
  res.json(hospitals);
};

exports.getById = async (req, res) => {
  const hospital = await Hospital.findById(req.params.id).populate('departments');
  if (!hospital) return res.status(404).json({ message: 'Hospital không tồn tại' });
  res.json(hospital);
};

exports.updateById = async (req, res) => {
  const hospital = await Hospital.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!hospital) return res.status(404).json({ message: 'Hospital không tồn tại' });
  res.json(hospital);
};

exports.deleteById = async (req, res) => {
  const hospital = await Hospital.findByIdAndDelete(req.params.id);
  if (!hospital) return res.status(404).json({ message: 'Hospital không tồn tại' });
  res.json({ message: 'Hospital đã bị xóa' });
};
