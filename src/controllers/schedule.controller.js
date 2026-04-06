const Schedule = require('../models/Schedule');
const { getSystemHospitalId } = require('../config/systemHospital');

const schedulePopulate = [
  {
    path: 'doctor',
    populate: { path: 'user' },
  },
  'room',
  'department',
  'hospital',
];

exports.create = async (req, res) => {
  const data = { ...req.body, hospital: getSystemHospitalId() };
  const schedule = await Schedule.create(data);
  const populated = await Schedule.findById(schedule._id).populate(schedulePopulate);
  res.status(201).json(populated);
};

exports.getAll = async (req, res) => {
  const query = {};
  if (req.query.doctor) query.doctor = req.query.doctor;
  if (req.query.hospital) query.hospital = req.query.hospital;
  if (req.query.department) query.department = req.query.department;
  if (req.query.date) {
    const start = new Date(req.query.date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(req.query.date);
    end.setHours(23, 59, 59, 999);
    query.date = { $gte: start, $lte: end };
  }

  const schedules = await Schedule.find(query).populate(schedulePopulate);
  res.json(schedules);
};

exports.getById = async (req, res) => {
  const schedule = await Schedule.findById(req.params.id).populate(schedulePopulate);
  if (!schedule) return res.status(404).json({ message: 'Schedule không tồn tại' });
  res.json(schedule);
};

exports.updateById = async (req, res) => {
  const data = { ...req.body, hospital: getSystemHospitalId() };
  const schedule = await Schedule.findByIdAndUpdate(req.params.id, data, { new: true }).populate(schedulePopulate);
  if (!schedule) return res.status(404).json({ message: 'Schedule không tồn tại' });
  res.json(schedule);
};

exports.deleteById = async (req, res) => {
  const schedule = await Schedule.findByIdAndDelete(req.params.id);
  if (!schedule) return res.status(404).json({ message: 'Schedule không tồn tại' });
  res.json({ message: 'Schedule đã bị xóa' });
};
