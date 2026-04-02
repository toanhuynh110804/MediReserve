const FileUpload = require('../models/FileUpload');
const fs = require('fs');
const path = require('path');

exports.create = async (req, res) => {
  const uploadedFile = req.file;
  const fileUrl = uploadedFile ? `/uploads/${uploadedFile.filename}` : (req.body.url || req.body.fileUrl);
  if (!fileUrl) {
    return res.status(400).json({ message: 'Thiếu file upload hoặc URL file' });
  }

  const data = {
    owner: req.user._id,
    type: req.body.type || 'generic',
    filename: uploadedFile ? uploadedFile.originalname : (req.body.filename || 'untitled'),
    url: fileUrl,
    size: uploadedFile ? uploadedFile.size : req.body.size,
    mimeType: uploadedFile ? uploadedFile.mimetype : req.body.mimeType,
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

  if (typeof file.url === 'string' && file.url.startsWith('/uploads/')) {
    const absolutePath = path.join(process.cwd(), file.url.replace(/^\//, ''));
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
    }
  }

  await file.deleteOne();
  res.json({ message: 'Xóa file thành công' });
};
