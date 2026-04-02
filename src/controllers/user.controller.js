const User = require('../models/User');

/** Danh sách User (không trả password). Admin có thể lọc ?role=patient|doctor|admin|staff */
exports.getAll = async (req, res) => {
  const query = {};
  if (req.user?.role === 'staff') {
    const requestedRole = req.query.role;
    if (requestedRole && requestedRole !== 'patient') {
      return res.status(403).json({ message: 'Nhân viên chỉ được xem user bệnh nhân' });
    }
    query.role = 'patient';
  }
  if (req.query.role) {
    query.role = req.query.role;
  }
  const users = await User.find(query).select('-password').sort({ createdAt: -1 });
  res.json(users);
};
