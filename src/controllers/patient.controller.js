const Patient = require('../models/Patient');

exports.create = async (req, res) => {
  const patient = await Patient.create(req.body);
  res.status(201).json(patient);
};

exports.getAll = async (req, res) => {
  const patients = await Patient.find().populate('user');
  res.json(patients);
};

exports.getById = async (req, res) => {
  const patient = await Patient.findById(req.params.id).populate('user');
  if (!patient) return res.status(404).json({ message: 'Patient không tồn tại' });
  res.json(patient);
};

exports.updateById = async (req, res) => {
  const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('user');
  if (!patient) return res.status(404).json({ message: 'Patient không tồn tại' });
  res.json(patient);
};

exports.deleteById = async (req, res) => {
  const patient = await Patient.findByIdAndDelete(req.params.id);
  if (!patient) return res.status(404).json({ message: 'Patient không tồn tại' });
  res.json({ message: 'Patient đã bị xóa' });
};

exports.myProfile = async (req, res) => {
  const patient = await Patient.findOne({ user: req.user._id }).populate('user');
  if (!patient) return res.status(404).json({ message: 'Không tìm thấy thông tin bệnh nhân' });
  res.json(patient);
};
