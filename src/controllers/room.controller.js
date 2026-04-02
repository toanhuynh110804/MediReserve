const Room = require('../models/Room');

exports.create = async (req, res) => {
  const room = await Room.create(req.body);
  res.status(201).json(room);
};

exports.getAll = async (req, res) => {
  const query = {};
  if (req.query.department) query.department = req.query.department;
  if (req.query.status) query.status = req.query.status;

  const rooms = await Room.find(query).populate('department');
  res.json(rooms);
};

exports.getById = async (req, res) => {
  const room = await Room.findById(req.params.id).populate('department');
  if (!room) return res.status(404).json({ message: 'Phòng không tồn tại' });
  res.json(room);
};

exports.updateById = async (req, res) => {
  const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('department');
  if (!room) return res.status(404).json({ message: 'Phòng không tồn tại' });
  res.json(room);
};

exports.deleteById = async (req, res) => {
  const room = await Room.findByIdAndDelete(req.params.id);
  if (!room) return res.status(404).json({ message: 'Phòng không tồn tại' });
  res.json({ message: 'Phòng đã bị xóa' });
};