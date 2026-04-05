const User = require('../models/User');
const bcrypt = require('bcryptjs');

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

/** Admin tạo tài khoản user nội bộ (staff/doctor/patient) */
exports.createByAdmin = async (req, res) => {
  const { name, email, password, role, phone, address } = req.body;

  if (!['staff', 'doctor', 'patient'].includes(role)) {
    return res.status(400).json({ message: 'Admin chỉ được tạo tài khoản staff, doctor hoặc patient' });
  }

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(400).json({ message: 'Email đã tồn tại' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role,
    phone,
    address,
  });

  return res.status(201).json({
    user: {
      _id: user._id,
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
    },
  });
};
