const Staff = require('../models/Staff');
const { getSystemHospitalId } = require('../config/systemHospital');

exports.create = async (req, res) => {
  const { user, department, title, role, status } = req.body;
  const data = { user, department, hospital: getSystemHospitalId() };
  if (title) data.title = title;
  if (role) data.role = role;
  if (status) data.status = status;

  const staff = await Staff.create(data);
  const populated = await Staff.findById(staff._id).populate('user hospital department');
  res.status(201).json(populated);
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
  const { department, title, role, status } = req.body;
  const update = { department, hospital: getSystemHospitalId() };
  if (title !== undefined) update.title = title;
  if (role) update.role = role;
  if (status) update.status = status;

  const staff = await Staff.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true }).populate('user hospital department');
  if (!staff) return res.status(404).json({ message: 'Staff không tồn tại' });
  res.json(staff);
};

exports.deleteById = async (req, res) => {
  const staff = await Staff.findByIdAndDelete(req.params.id);
  if (!staff) return res.status(404).json({ message: 'Staff không tồn tại' });
  res.json({ message: 'Staff đã bị xóa' });
};

