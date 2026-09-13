const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');

const createManager = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Manager details from environment variables
    const managerEmail = process.env.MANAGER_EMAIL;
    const managerPassword = process.env.MANAGER_PASSWORD;
    const managerName = process.env.MANAGER_NAME || 'Manager';

    if (!managerEmail || !managerPassword) {
      console.error('❌ Error: MANAGER_EMAIL and MANAGER_PASSWORD must be set in .env file');
      mongoose.connection.close();
      process.exit(1);
    }

    if (managerPassword.length < 8) {
      console.error('❌ Error: MANAGER_PASSWORD must be at least 8 characters');
      mongoose.connection.close();
      process.exit(1);
    }

    // Check if manager already exists
    const existingManager = await User.findOne({ email: managerEmail });

    if (existingManager) {
      console.log('⚠️  User already exists:', existingManager.email);
      console.log('Current role:', existingManager.role);
      
      // Update to manager if not already
      if (existingManager.role !== 'manager') {
        existingManager.role = 'manager';
        existingManager.isVerified = true;
        existingManager.accountStatus = 'active';
        await existingManager.save();
        console.log('✅ Updated user to manager role');
      } else {
        console.log('✅ User is already a manager');
      }
      
      console.log('\n🔐 Login credentials:');
      console.log('Email:', existingManager.email);
      console.log('Password: (use your existing password)');
      
      mongoose.connection.close();
      return;
    }

    // Create new manager
    const hashedPassword = await bcrypt.hash(managerPassword, 12);

    const securityQuestion = process.env.MANAGER_SECURITY_QUESTION || 'What is your email address?';
    const securityAnswerPlain = process.env.MANAGER_SECURITY_ANSWER || managerEmail.toLowerCase().trim();
    const hashedSecurityAnswer = await bcrypt.hash(securityAnswerPlain.toLowerCase().trim(), 12);

    const manager = new User({
      name: managerName,
      email: managerEmail,
      password: hashedPassword,
      role: 'manager',
      isVerified: true,
      accountStatus: 'active',
      securityQuestion: securityQuestion,
      securityAnswer: hashedSecurityAnswer,
      tosAccepted: true,
      tosAcceptedAt: new Date(),
      privacyPolicyAccepted: true,
      privacyPolicyAcceptedAt: new Date()
    });

    await manager.save();
    console.log('✅ Manager account created successfully!');
    console.log('\n🔐 Login credentials:');
    console.log('Email:', manager.email);
    console.log('\n⚠️  IMPORTANT: Change the password after first login!');

    mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    mongoose.connection.close();
    process.exit(1);
  }
};

createManager();
