const FileUpload = require('../models/FileUpload');

exports.create = async (req, res) => {
  const data = {
    owner: req.user._id,
    type: req.body.type || 'generic',
    filename: req.body.filename || 'untitled',
    url: req.body.url || req.body.fileUrl,
    size: req.body.size,
    mimeType: req.body.mimeType,
    meta: req.body.meta,
  };
  const file = await FileUpload.create(data);
  res.status(201).json(file);
};

exports.getAll = async (req, res) => {
  const query = { owner: req.user._id };
  const files = await FileUpload.find(query).sort('-createdAt');
  res.json(files);
};

exports.getById = async (req, res) => {
  const file = await FileUpload.findById(req.params.id);
  if (!file) return res.status(404).json({ message: 'File không tồn tại' });
  if (!file.owner.equals(req.user._id) && req.user.role !== 'admin') return res.status(403).json({ message: 'Không có quyền truy cập' });
  res.json(file);
};

exports.deleteById = async (req, res) => {
  const file = await FileUpload.findById(req.params.id);
  if (!file) return res.status(404).json({ message: 'File không tồn tại' });
  if (!file.owner.equals(req.user._id) && req.user.role !== 'admin') return res.status(403).json({ message: 'Không có quyền truy cập' });
  await file.deleteOne();
  res.json({ message: 'Xóa file thành công' });
};
