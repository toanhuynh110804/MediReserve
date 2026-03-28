const Staff = require('../models/Staff');

exports.create = async (req, res) => {
  const staff = await Staff.create(req.body);
  res.status(201).json(staff);
};

exports.getAll = async (req, res) => {
  const staffs = await Staff.find().populate('user hospital department');
  res.json(staffs);
};

exports.getById = async (req, res) => {
  const staff = await Staff.findById(req.params.id).populate('user hospital department');
  if (!staff) return res.status(404).json({ message: 'Staff không tồn tại' });
  res.json(staff);
};

exports.updateById = async (req, res) => {
  const staff = await Staff.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('user hospital department');
  if (!staff) return res.status(404).json({ message: 'Staff không tồn tại' });
  res.json(staff);
};

exports.deleteById = async (req, res) => {
  const staff = await Staff.findByIdAndDelete(req.params.id);
  if (!staff) return res.status(404).json({ message: 'Staff không tồn tại' });
  res.json({ message: 'Staff đã bị xóa' });
};
