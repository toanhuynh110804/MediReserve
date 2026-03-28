const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');

const createToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret', {
    expiresIn: process.env.JWT_EXPIRE || '1d',
  });
};

exports.register = async (req, res) => {
  const { name, email, password, role, phone, address } = req.body;
  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ message: 'Email đã tồn tại' });
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashedPassword, role: role || 'patient', phone, address });
  if (user.role === 'patient') {
    await Patient.create({ user: user._id });
  }
  if (user.role === 'doctor') {
    await Doctor.create({ user: user._id });
  }
  const token = createToken(user);
  res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
  const matched = await bcrypt.compare(password, user.password);
  if (!matched) return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
  const token = createToken(user);
  res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
};

exports.profile = async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  res.json({ user });
};
