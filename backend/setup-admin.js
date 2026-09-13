const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');

const setupAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const newPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !newPassword) {
      throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in the environment');
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    let admin = await User.findOne({ email: adminEmail });

    if (!admin) {
      console.log('No admin found. Creating new admin.');

      const hashedPassword = await bcrypt.hash(newPassword, 12);
      admin = new User({
        name: 'Admin',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        isVerified: true,
        accountStatus: 'active',
        tosAccepted: true,
        tosAcceptedAt: new Date(),
        privacyPolicyAccepted: true,
        privacyPolicyAcceptedAt: new Date()
      });
      await admin.save();
      console.log('Admin created');
    } else {
      console.log('Admin found. Resetting password.');

      const hashedPassword = await bcrypt.hash(newPassword, 12);
      admin.password = hashedPassword;
      admin.role = 'admin';
      admin.isVerified = true;
      admin.accountStatus = 'active';
      admin.failedLoginAttempts = 0;
      admin.accountLockedUntil = null;
      await admin.save();

      console.log('Password reset complete');
    }

    console.log('Admin email:', adminEmail);
    console.log('Password: stored securely in the configured environment');

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error.message);
    await mongoose.connection.close().catch(() => {});
    process.exit(1);
  }
};

setupAdmin();
