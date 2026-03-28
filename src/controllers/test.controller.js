const Test = require('../models/Test');

exports.create = async (req, res) => {
  const test = await Test.create(req.body);
  res.status(201).json(test);
};

exports.getAll = async (req, res) => {
  const tests = await Test.find();
  res.json(tests);
};

exports.getById = async (req, res) => {
  const test = await Test.findById(req.params.id);
  if (!test) return res.status(404).json({ message: 'Test không tồn tại' });
  res.json(test);
};

exports.updateById = async (req, res) => {
  const test = await Test.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!test) return res.status(404).json({ message: 'Test không tồn tại' });
  res.json(test);
};

exports.deleteById = async (req, res) => {
  const test = await Test.findByIdAndDelete(req.params.id);
  if (!test) return res.status(404).json({ message: 'Test không tồn tại' });
  res.json({ message: 'Test đã bị xóa' });
};
