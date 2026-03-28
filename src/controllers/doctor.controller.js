const Doctor = require('../models/Doctor');

exports.create = async (req, res) => {
  const doctor = await Doctor.create(req.body);
  res.status(201).json(doctor);
};

exports.getAll = async (req, res) => {
  const doctors = await Doctor.find().populate('user specialties hospital department');
  res.json(doctors);
};

exports.getById = async (req, res) => {
  const doctor = await Doctor.findById(req.params.id).populate('user specialties hospital department');
  if (!doctor) return res.status(404).json({ message: 'Doctor không tồn tại' });
  res.json(doctor);
};

exports.updateById = async (req, res) => {
  const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('user specialties hospital department');
  if (!doctor) return res.status(404).json({ message: 'Doctor không tồn tại' });
  res.json(doctor);
};

exports.deleteById = async (req, res) => {
  const doctor = await Doctor.findByIdAndDelete(req.params.id);
  if (!doctor) return res.status(404).json({ message: 'Doctor không tồn tại' });
  res.json({ message: 'Doctor đã bị xóa' });
};

exports.myProfile = async (req, res) => {
  const doctor = await Doctor.findOne({ user: req.user._id }).populate('user specialties hospital department');
  if (!doctor) return res.status(404).json({ message: 'Không tìm thấy thông tin bác sĩ' });
  res.json(doctor);
};
