const errorMiddleware = (err, req, res, next) => {
  console.error(err);
  if (err && (err.name === 'MulterError' || err.message?.includes('Unsupported file type'))) {
    return res.status(400).json({ success: false, message: err.message || 'Upload file không hợp lệ' });
  }

  const status = err.statusCode || 500;
  const message = err.message || 'Server Error';
  res.status(status).json({ success: false, message });
};

module.exports = errorMiddleware;
