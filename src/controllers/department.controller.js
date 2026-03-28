const Department = require('../models/Department');

exports.create = async (req, res) => {
  const department = await Department.create(req.body);
  res.status(201).json(department);
};

exports.getAll = async (req, res) => {
  const departments = await Department.find().populate('hospital');
  res.json(departments);
};

exports.getById = async (req, res) => {
  const department = await Department.findById(req.params.id).populate('hospital');
  if (!department) return res.status(404).json({ message: 'Department không tồn tại' });
  res.json(department);
};

exports.updateById = async (req, res) => {
  const department = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!department) return res.status(404).json({ message: 'Department không tồn tại' });
  res.json(department);
};

exports.deleteById = async (req, res) => {
  const department = await Department.findByIdAndDelete(req.params.id);
  if (!department) return res.status(404).json({ message: 'Department không tồn tại' });
  res.json({ message: 'Department đã bị xóa' });
};
