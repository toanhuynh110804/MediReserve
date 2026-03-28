const Rating = require('../models/Rating');

exports.create = async (req, res) => {
  const data = { ...req.body };
  if (req.user.role === 'patient') data.patient = data.patient || req.user._id;
  const rating = await Rating.create(data);
  res.status(201).json(rating);
};

exports.getAll = async (req, res) => {
  const query = {};
  if (req.query.doctor) query.doctor = req.query.doctor;
  if (req.query.hospital) query.hospital = req.query.hospital;
  if (req.query.appointment) query.appointment = req.query.appointment;

  const ratings = await Rating.find(query).populate('patient doctor hospital appointment');
  res.json(ratings);
};

exports.getById = async (req, res) => {
  const rating = await Rating.findById(req.params.id).populate('patient doctor hospital appointment');
  if (!rating) return res.status(404).json({ message: 'Rating không tồn tại' });
  res.json(rating);
};

exports.updateById = async (req, res) => {
  const rating = await Rating.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('patient doctor hospital appointment');
  if (!rating) return res.status(404).json({ message: 'Rating không tồn tại' });
  res.json(rating);
};

exports.deleteById = async (req, res) => {
  const rating = await Rating.findByIdAndDelete(req.params.id);
  if (!rating) return res.status(404).json({ message: 'Rating không tồn tại' });
  res.json({ message: 'Rating đã bị xóa' });
};
