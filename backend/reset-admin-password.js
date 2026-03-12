const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');

const resetAdminPassword = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const adminEmail = process.env.ADMIN_EMAIL || '1mikedwin@gmail.com';
    const newPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';

    const admin = await User.findOne({ email: adminEmail });
    
    if (!admin) {
      console.log('❌ Admin not found with email:', adminEmail);
      mongoose.connection.close();
      return;
    }

    console.log('📧 Admin found:', admin.email);
    console.log('👤 Current role:', admin.role);

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    // Update password
    admin.password = hashedPassword;
    admin.role = 'admin'; // Ensure role is admin
    admin.isVerified = true;
    admin.accountStatus = 'active';
    admin.failedLoginAttempts = 0;
    admin.accountLockedUntil = null;
    
    await admin.save();

    console.log('\n✅ Admin password reset successfully!');
    console.log('\n🔐 LOGIN CREDENTIALS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Email:    ', adminEmail);
    console.log('Password: ', newPassword);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n⚠️  Save these credentials securely!');

    mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    mongoose.connection.close();
    process.exit(1);
  }
};

resetAdminPassword();
