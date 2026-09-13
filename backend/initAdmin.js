const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');

const initAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminUsername = process.env.ADMIN_USERNAME;

    if (!adminEmail || !adminPassword || !adminUsername) {
      throw new Error('ADMIN_EMAIL, ADMIN_PASSWORD, and ADMIN_USERNAME must be set in the environment');
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log(`Admin account already exists: ${adminEmail}`);
      console.log(`Role: ${existingAdmin.role}`);
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 12);
    const admin = new User({
      name: adminUsername,
      email: adminEmail,
      password: hashedPassword,
      role: 'admin'
    });

    await admin.save();
    console.log('Admin account created successfully');
    console.log(`Email: ${adminEmail}`);
    console.log('Role: admin');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message || err);
    process.exit(1);
  }
};

initAdmin();
