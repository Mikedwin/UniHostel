const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');

const checkAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail) {
      throw new Error('ADMIN_EMAIL must be set in the environment');
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const admin = await User.findOne({ email: adminEmail });

    if (!admin) {
      console.log('No admin found');
      await mongoose.connection.close();
      return;
    }

    console.log('Admin account details');
    console.log('Email:', admin.email);
    console.log('Role:', admin.role);
    console.log('Verified:', admin.isVerified);
    console.log('Status:', admin.accountStatus);
    console.log('Created:', admin.createdAt);

    if (!adminPassword) {
      console.log('ADMIN_PASSWORD is not set, so password verification was skipped.');
      await mongoose.connection.close();
      return;
    }

    const isMatch = await bcrypt.compare(adminPassword, admin.password);

    if (isMatch) {
      console.log('Configured ADMIN_PASSWORD matches the stored admin password.');
    } else {
      console.log('Configured ADMIN_PASSWORD does not match the stored admin password.');
      console.log('Run node reset-admin-password.js to rotate the admin password.');
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error.message);
    await mongoose.connection.close().catch(() => {});
    process.exit(1);
  }
};

checkAdmin();
