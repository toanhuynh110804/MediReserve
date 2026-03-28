const Notification = require('../models/Notification');

exports.getAll = async (req, res) => {
  const query = { user: req.user._id };
  if (req.query.unread === 'true') query.readAt = null;

  const notifications = await Notification.find(query).sort('-createdAt');
  res.json(notifications);
};

exports.create = async (req, res) => {
  const notification = await Notification.create(req.body);
  res.status(201).json(notification);
};

exports.markRead = async (req, res) => {
  const notification = await Notification.findById(req.params.id);
  if (!notification) return res.status(404).json({ message: 'Notification không tồn tại' });
  if (!notification.user.equals(req.user._id)) return res.status(403).json({ message: 'Không có quyền' });
  notification.readAt = new Date();
  await notification.save();
  res.json(notification);
};

exports.deleteById = async (req, res) => {
  const notification = await Notification.findByIdAndDelete(req.params.id);
  if (!notification) return res.status(404).json({ message: 'Notification không tồn tại' });
  res.json({ message: 'Notification đã bị xóa' });
};
