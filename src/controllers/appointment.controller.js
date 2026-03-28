const Appointment = require('../models/Appointment');
const Schedule = require('../models/Schedule');

exports.create = async (req, res) => {
  const data = req.body;
  if (!data.patient && req.user.role === 'patient') {
    const Patient = require('../models/Patient');
    const patient = await Patient.findOne({ user: req.user._id });
    if (!patient) return res.status(400).json({ message: 'Cannot find patient profile' });
    data.patient = patient._id;
  }

  const schedule = await Schedule.findById(data.schedule);
  if (!schedule || schedule.status !== 'open') return res.status(400).json({ message: 'Schedule không hợp lệ' });
  if (schedule.bookedCount >= schedule.capacity) return res.status(400).json({ message: 'Slot đã đầy' });

  const appointment = await Appointment.create(data);
  schedule.bookedCount += 1;
  if (schedule.bookedCount >= schedule.capacity) schedule.status = 'closed';
  await schedule.save();

  res.status(201).json(appointment);
};

exports.getAll = async (req, res) => {
  const query = {};
  if (req.user.role === 'patient') {
    const Patient = require('../models/Patient');
    const patient = await Patient.findOne({ user: req.user._id });
    if (!patient) return res.status(404).json({ message: 'Bệnh nhân không tìm thấy' });
    query.patient = patient._id;
  }
  if (req.user.role === 'doctor') {
    const Doctor = require('../models/Doctor');
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) return res.status(404).json({ message: 'Bác sĩ không tìm thấy' });
    query.doctor = doctor._id;
  }
  if (req.query.status) query.status = req.query.status;

  const appointments = await Appointment.find(query).populate('patient doctor schedule room');
  res.json(appointments);
};

exports.getById = async (req, res) => {
  const appointment = await Appointment.findById(req.params.id).populate('patient doctor schedule room');
  if (!appointment) return res.status(404).json({ message: 'Appointment không tồn tại' });
  res.json(appointment);
};

exports.updateById = async (req, res) => {
  const appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('patient doctor schedule room');
  if (!appointment) return res.status(404).json({ message: 'Appointment không tồn tại' });
  res.json(appointment);
};

exports.cancel = async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) return res.status(404).json({ message: 'Appointment không tồn tại' });
  appointment.status = 'cancelled';
  appointment.cancelReason = req.body.cancelReason || 'Hủy bởi người dùng';
  await appointment.save();
  res.json(appointment);
};
