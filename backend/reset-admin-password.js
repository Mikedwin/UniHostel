const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');

const resetAdminPassword = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const newPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !newPassword) {
      throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in the environment');
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const admin = await User.findOne({ email: adminEmail });

    if (!admin) {
      console.log('Admin not found with email:', adminEmail);
      await mongoose.connection.close();
      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    admin.password = hashedPassword;
    admin.role = 'admin';
    admin.isVerified = true;
    admin.accountStatus = 'active';
    admin.failedLoginAttempts = 0;
    admin.accountLockedUntil = null;

    await admin.save();

    console.log('Admin password reset successfully');
    console.log('Email:', adminEmail);
    console.log('Password: stored securely in the configured environment');

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error.message);
    await mongoose.connection.close().catch(() => {});
    process.exit(1);
  }
};

resetAdminPassword();
