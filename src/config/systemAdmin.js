const bcrypt = require('bcryptjs');
const User = require('../models/User');

async function ensureSystemAdminAccount() {
  const admins = await User.find({ role: 'admin' }).sort({ createdAt: 1 }).lean();

  if (admins.length > 1) {
    console.warn(
      `[security] Found ${admins.length} admin accounts. Policy expects exactly one system admin account.`
    );
  }

  if (admins.length > 0) {
    return;
  }

  const systemAdminName = process.env.SYSTEM_ADMIN_NAME || 'System Administrator';
  const systemAdminEmail = process.env.SYSTEM_ADMIN_EMAIL || 'admin@medireserve.com';
  const systemAdminPassword = process.env.SYSTEM_ADMIN_PASSWORD || 'ChangeMe123!';

  const hashedPassword = await bcrypt.hash(systemAdminPassword, 10);

  await User.create({
    name: systemAdminName,
    email: systemAdminEmail.toLowerCase(),
    password: hashedPassword,
    role: 'admin',
  });

  console.log(
    `[security] Created system admin account: ${systemAdminEmail}. Change SYSTEM_ADMIN_PASSWORD immediately in production.`
  );
}

module.exports = { ensureSystemAdminAccount };
