const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ 
      email: process.env.ADMIN_EMAIL || '1mikedwin@gmail.com' 
    });

    if (existingAdmin) {
      console.log('⚠️  Admin already exists:', existingAdmin.email);
      console.log('Role:', existingAdmin.role);
      
      // Update to admin if not already
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        existingAdmin.isVerified = true;
        existingAdmin.accountStatus = 'active';
        await existingAdmin.save();
        console.log('✅ Updated user to admin role');
      }
      
      mongoose.connection.close();
      return;
    }

    // Create new admin
    const hashedPassword = await bcrypt.hash(
      process.env.ADMIN_PASSWORD || 'Admin@123456', 
      12
    );

    const admin = new User({
      name: 'Admin',
      email: process.env.ADMIN_EMAIL || '1mikedwin@gmail.com',
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
    console.log('✅ Admin account created successfully!');
    console.log('Email:', admin.email);
    console.log('Password: (check your .env file)');
    console.log('\n🔐 Use these credentials to login as admin');

    mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    mongoose.connection.close();
    process.exit(1);
  }
};

createAdmin();
