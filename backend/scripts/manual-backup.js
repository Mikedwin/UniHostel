const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const User = require('../models/User');
const Hostel = require('../models/Hostel');
const Application = require('../models/Application');
const Transaction = require('../models/Transaction');

const backupDatabase = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    console.log('Fetching data...');
    const users = await User.find().select('-password').lean();
    const hostels = await Hostel.find().lean();
    const applications = await Application.find().lean();
    const transactions = await Transaction.find().lean();

    console.log(`Found: ${users.length} users, ${hostels.length} hostels, ${applications.length} applications, ${transactions.length} transactions`);

    const backupData = {
      timestamp: new Date().toISOString(),
      database: 'unihostel',
      collections: {
        users: users,
        hostels: hostels,
        applications: applications,
        transactions: transactions
      },
      stats: {
        totalUsers: users.length,
        totalHostels: hostels.length,
        totalApplications: applications.length,
        totalTransactions: transactions.length
      }
    };

    const backupDir = path.join(__dirname, '../backups/manual');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const date = new Date().toISOString().split('T')[0];
    const filename = `backup-${date}-${Date.now()}.json`;
    const filepath = path.join(backupDir, filename);

    fs.writeFileSync(filepath, JSON.stringify(backupData, null, 2));

    console.log(`\n✅ Backup completed successfully!`);
    console.log(`📁 File: ${filename}`);
    console.log(`📍 Location: ${filepath}`);
    console.log(`📊 Size: ${(fs.statSync(filepath).size / 1024).toFixed(2)} KB`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Backup failed:', err.message);
    process.exit(1);
  }
};

backupDatabase();
