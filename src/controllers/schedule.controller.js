const Schedule = require('../models/Schedule');

exports.create = async (req, res) => {
  const schedule = await Schedule.create(req.body);
  res.status(201).json(schedule);
};

exports.getAll = async (req, res) => {
  const query = {};
  if (req.query.doctor) query.doctor = req.query.doctor;
  if (req.query.hospital) query.hospital = req.query.hospital;
  if (req.query.department) query.department = req.query.department;
  if (req.query.date) query.date = new Date(req.query.date);

  const schedules = await Schedule.find(query).populate('doctor room department hospital');
  res.json(schedules);
};

exports.getById = async (req, res) => {
  const schedule = await Schedule.findById(req.params.id).populate('doctor room department hospital');
  if (!schedule) return res.status(404).json({ message: 'Schedule không tồn tại' });
  res.json(schedule);
};

exports.updateById = async (req, res) => {
  const schedule = await Schedule.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('doctor room department hospital');
  if (!schedule) return res.status(404).json({ message: 'Schedule không tồn tại' });
  res.json(schedule);
};

exports.deleteById = async (req, res) => {
  const schedule = await Schedule.findByIdAndDelete(req.params.id);
  if (!schedule) return res.status(404).json({ message: 'Schedule không tồn tại' });
  res.json({ message: 'Schedule đã bị xóa' });
};
