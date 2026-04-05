const Department = require('../models/Department');
const { getSystemHospitalId } = require('../config/systemHospital');

exports.create = async (req, res) => {
  const { name, description } = req.body;
  const department = await Department.create({
    name,
    description,
    hospital: getSystemHospitalId(),
  });
  const populated = await Department.findById(department._id).populate('hospital');
  res.status(201).json(populated);
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
  const { name, description } = req.body;
  const update = { name, description, hospital: getSystemHospitalId() };
  const department = await Department.findByIdAndUpdate(req.params.id, update, { new: true }).populate('hospital');
  if (!department) return res.status(404).json({ message: 'Department không tồn tại' });
  res.json(department);
};

exports.deleteById = async (req, res) => {
  const department = await Department.findByIdAndDelete(req.params.id);
  if (!department) return res.status(404).json({ message: 'Department không tồn tại' });
  res.json({ message: 'Department đã bị xóa' });
};
