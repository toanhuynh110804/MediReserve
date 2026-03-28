const Role = require('../models/Role');

exports.create = async (req, res) => {
  const role = await Role.create(req.body);
  res.status(201).json(role);
};

exports.getAll = async (req, res) => {
  const roles = await Role.find();
  res.json(roles);
};

exports.getById = async (req, res) => {
  const role = await Role.findById(req.params.id);
  if (!role) return res.status(404).json({ message: 'Role không tồn tại' });
  res.json(role);
};

exports.updateById = async (req, res) => {
  const role = await Role.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!role) return res.status(404).json({ message: 'Role không tồn tại' });
  res.json(role);
};

exports.deleteById = async (req, res) => {
  const role = await Role.findByIdAndDelete(req.params.id);
  if (!role) return res.status(404).json({ message: 'Role không tồn tại' });
  res.json({ message: 'Role đã bị xóa' });
};
