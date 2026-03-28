const Address = require('../models/Address');

exports.create = async (req, res) => {
  const address = await Address.create(req.body);
  res.status(201).json(address);
};

exports.getAll = async (req, res) => {
  const addresses = await Address.find();
  res.json(addresses);
};

exports.getById = async (req, res) => {
  const address = await Address.findById(req.params.id);
  if (!address) return res.status(404).json({ message: 'Address không tồn tại' });
  res.json(address);
};

exports.updateById = async (req, res) => {
  const address = await Address.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!address) return res.status(404).json({ message: 'Address không tồn tại' });
  res.json(address);
};

exports.deleteById = async (req, res) => {
  const address = await Address.findByIdAndDelete(req.params.id);
  if (!address) return res.status(404).json({ message: 'Address không tồn tại' });
  res.json({ message: 'Address đã bị xóa' });
};
