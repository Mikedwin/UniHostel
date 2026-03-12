const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');

const checkAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    const admin = await User.findOne({ email: process.env.ADMIN_EMAIL || '1mikedwin@gmail.com' });
    
    if (!admin) {
      console.log('❌ No admin found');
      mongoose.connection.close();
      return;
    }

    console.log('📋 ADMIN ACCOUNT DETAILS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Email:', admin.email);
    console.log('Role:', admin.role);
    console.log('Verified:', admin.isVerified);
    console.log('Status:', admin.accountStatus);
    console.log('Created:', admin.createdAt);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Try passwords from environment
    const passwordsToTry = [
      process.env.ADMIN_PASSWORD,
      'Admin@123456'
    ].filter(Boolean);

    console.log('🔍 Testing common passwords...\n');
    
    for (const pwd of passwordsToTry) {
      const isMatch = await bcrypt.compare(pwd, admin.password);
      if (isMatch) {
        console.log('✅ PASSWORD FOUND!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('Email:   ', admin.email);
        console.log('Password:', pwd);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        mongoose.connection.close();
        return;
      }
    }

    console.log('❌ None of the common passwords matched.\n');
    console.log('💡 SOLUTION: Run this command to reset password:');
    console.log('   node reset-admin-password.js\n');

    mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    mongoose.connection.close();
    process.exit(1);
  }
};

checkAdmin();
