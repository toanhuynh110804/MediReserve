const Review = require('../models/Review');

exports.create = async (req, res) => {
  const review = await Review.create({ ...req.body, patient: req.user._id });
  res.status(201).json(review);
};

exports.getAll = async (req, res) => {
  const query = {};

  if (req.query.doctor) query.doctor = req.query.doctor;
  if (req.query.hospital) query.hospital = req.query.hospital;
  if (req.user.role === 'patient') query.patient = req.user._id;

  const reviews = await Review.find(query).populate('patient doctor hospital appointment');
  res.json(reviews);
};

exports.getById = async (req, res) => {
  const review = await Review.findById(req.params.id).populate('patient doctor hospital appointment');
  if (!review) return res.status(404).json({ message: 'Review không tồn tại' });
  res.json(review);
};

exports.updateById = async (req, res) => {
  const review = await Review.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('patient doctor hospital appointment');
  if (!review) return res.status(404).json({ message: 'Review không tồn tại' });
  res.json(review);
};

exports.deleteById = async (req, res) => {
  const review = await Review.findByIdAndDelete(req.params.id);
  if (!review) return res.status(404).json({ message: 'Review không tồn tại' });
  res.json({ message: 'Review đã bị xóa' });
};
