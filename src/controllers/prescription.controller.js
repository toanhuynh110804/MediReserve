const Prescription = require('../models/Prescription');

exports.create = async (req, res) => {
  const prescription = await Prescription.create(req.body);
  res.status(201).json(prescription);
};

exports.getAll = async (req, res) => {
  const query = {};
  if (req.query.patient) query.patient = req.query.patient;
  if (req.query.doctor) query.doctor = req.query.doctor;

  const prescriptions = await Prescription.find(query)
    .populate('patient doctor medicalRecord items.medicine');
  res.json(prescriptions);
};

exports.getById = async (req, res) => {
  const prescription = await Prescription.findById(req.params.id).populate('patient doctor medicalRecord items.medicine');
  if (!prescription) return res.status(404).json({ message: 'Prescription không tồn tại' });
  res.json(prescription);
};

exports.updateById = async (req, res) => {
  const prescription = await Prescription.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('patient doctor medicalRecord items.medicine');
  if (!prescription) return res.status(404).json({ message: 'Prescription không tồn tại' });
  res.json(prescription);
};

exports.deleteById = async (req, res) => {
  const prescription = await Prescription.findByIdAndDelete(req.params.id);
  if (!prescription) return res.status(404).json({ message: 'Prescription không tồn tại' });
  res.json({ message: 'Prescription đã bị xóa' });
};
