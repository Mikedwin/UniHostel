const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');

const createAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in the environment');
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log('Admin already exists:', existingAdmin.email);
      console.log('Role:', existingAdmin.role);

      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        existingAdmin.isVerified = true;
        existingAdmin.accountStatus = 'active';
        await existingAdmin.save();
        console.log('Updated user to admin role');
      }

      await mongoose.connection.close();
      return;
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    const admin = new User({
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
    console.log('Admin account created successfully');
    console.log('Email:', admin.email);
    console.log('Password: stored securely in the configured environment');

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error.message);
    await mongoose.connection.close().catch(() => {});
    process.exit(1);
  }
};

createAdmin();
