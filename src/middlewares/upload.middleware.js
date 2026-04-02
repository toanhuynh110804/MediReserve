const fs = require('fs');
const path = require('path');
const multer = require('multer');

const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}-${safeName}`);
  },
});

const allowedMimeTypes = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
];

const upload = multer({
  storage,
  limits: {
    fileSize: Number(process.env.MAX_UPLOAD_SIZE_BYTES || 5 * 1024 * 1024),
  },
  fileFilter: (req, file, cb) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(new Error('Unsupported file type. Allowed: jpeg, png, webp, pdf'));
    }
    cb(null, true);
  },
});

const uploadSingle = (fieldName = 'file') => upload.single(fieldName);

module.exports = { uploadSingle };