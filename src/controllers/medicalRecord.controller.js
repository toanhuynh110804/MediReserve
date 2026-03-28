const MedicalRecord = require('../models/MedicalRecord');

exports.create = async (req, res) => {
  const record = await MedicalRecord.create(req.body);
  res.status(201).json(record);
};

exports.getAll = async (req, res) => {
  const query = {};
  if (req.user.role === 'patient') {
    const Patient = require('../models/Patient');
    const patient = await Patient.findOne({ user: req.user._id });
    if (!patient) return res.status(404).json({ message: 'Không tìm thấy bệnh nhân' });
    query.patient = patient._id;
  }
  if (req.query.patient) query.patient = req.query.patient;
  if (req.query.doctor) query.doctor = req.query.doctor;

  const records = await MedicalRecord.find(query).populate('patient doctor appointment tests prescriptions');
  res.json(records);
};

exports.getById = async (req, res) => {
  const record = await MedicalRecord.findById(req.params.id).populate('patient doctor appointment tests prescriptions');
  if (!record) return res.status(404).json({ message: 'MedicalRecord không tồn tại' });
  res.json(record);
};

exports.updateById = async (req, res) => {
  const record = await MedicalRecord.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('patient doctor appointment tests prescriptions');
  if (!record) return res.status(404).json({ message: 'MedicalRecord không tồn tại' });
  res.json(record);
};

exports.deleteById = async (req, res) => {
  const record = await MedicalRecord.findByIdAndDelete(req.params.id);
  if (!record) return res.status(404).json({ message: 'MedicalRecord không tồn tại' });
  res.json({ message: 'MedicalRecord đã bị xóa' });
};
