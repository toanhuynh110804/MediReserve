const TestResult = require('../models/TestResult');

exports.create = async (req, res) => {
  const result = await TestResult.create(req.body);
  res.status(201).json(result);
};

exports.getAll = async (req, res) => {
  const query = {};
  if (req.query.patient) query.patient = req.query.patient;
  if (req.query.doctor) query.doctor = req.query.doctor;

  const results = await TestResult.find(query).populate('test patient doctor medicalRecord');
  res.json(results);
};

exports.getById = async (req, res) => {
  const result = await TestResult.findById(req.params.id).populate('test patient doctor medicalRecord');
  if (!result) return res.status(404).json({ message: 'TestResult không tồn tại' });
  res.json(result);
};

exports.updateById = async (req, res) => {
  const result = await TestResult.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('test patient doctor medicalRecord');
  if (!result) return res.status(404).json({ message: 'TestResult không tồn tại' });
  res.json(result);
};

exports.deleteById = async (req, res) => {
  const result = await TestResult.findByIdAndDelete(req.params.id);
  if (!result) return res.status(404).json({ message: 'TestResult không tồn tại' });
  res.json({ message: 'TestResult đã bị xóa' });
};
