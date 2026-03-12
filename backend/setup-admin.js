const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');

const setupAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    const adminEmail = process.env.ADMIN_EMAIL || '1mikedwin@gmail.com';
    const newPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';

    // Find admin
    let admin = await User.findOne({ email: adminEmail });
    
    if (!admin) {
      console.log('❌ No admin found. Creating new admin...\n');
      
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
      console.log('✅ Admin created!\n');
    } else {
      console.log('✅ Admin found. Resetting password...\n');
      
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      admin.password = hashedPassword;
      admin.role = 'admin';
      admin.isVerified = true;
      admin.accountStatus = 'active';
      admin.failedLoginAttempts = 0;
      admin.accountLockedUntil = null;
      await admin.save();
      
      console.log('✅ Password reset complete!\n');
    }

    console.log('═══════════════════════════════════════');
    console.log('🔐 ADMIN LOGIN CREDENTIALS');
    console.log('═══════════════════════════════════════');
    console.log('');
    console.log('  Email:    ' + adminEmail);
    console.log('  Password: (check your .env file)');
    console.log('');
    console.log('═══════════════════════════════════════');
    console.log('');
    console.log('✅ You can now log in as admin!');
    console.log('');
    console.log('⚠️  IMPORTANT: Change this password after first login');
    console.log('');

    mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    mongoose.connection.close();
    process.exit(1);
  }
};

setupAdmin();
