const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const User = require('../models/User');
const Hostel = require('../models/Hostel');
const Application = require('../models/Application');
const Transaction = require('../models/Transaction');

const restoreDatabase = async (backupFilePath) => {
  try {
    console.log('🔄 Starting database restore...\n');

    // Check if backup file exists
    if (!fs.existsSync(backupFilePath)) {
      console.error('❌ Backup file not found:', backupFilePath);
      console.log('\n📁 Available backups:');
      const backupDir = path.join(__dirname, '../backups/manual');
      if (fs.existsSync(backupDir)) {
        const files = fs.readdirSync(backupDir);
        files.forEach(file => console.log(`   - ${file}`));
      }
      process.exit(1);
    }

    // Read backup file
    console.log('📖 Reading backup file...');
    const backupData = JSON.parse(fs.readFileSync(backupFilePath, 'utf8'));
    console.log(`✅ Backup from: ${backupData.timestamp}`);
    console.log(`📊 Contains: ${backupData.stats.totalUsers} users, ${backupData.stats.totalHostels} hostels, ${backupData.stats.totalApplications} applications\n`);

    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Ask for confirmation
    console.log('⚠️  WARNING: This will DELETE all current data and restore from backup!');
    console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...\n');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Hostel.deleteMany({});
    await Application.deleteMany({});
    await Transaction.deleteMany({});
    console.log('✅ Existing data cleared\n');

    // Restore data
    console.log('📥 Restoring data...');
    
    if (backupData.collections.users.length > 0) {
      await User.insertMany(backupData.collections.users);
      console.log(`✅ Restored ${backupData.collections.users.length} users`);
    }

    if (backupData.collections.hostels.length > 0) {
      await Hostel.insertMany(backupData.collections.hostels);
      console.log(`✅ Restored ${backupData.collections.hostels.length} hostels`);
    }

    if (backupData.collections.applications.length > 0) {
      await Application.insertMany(backupData.collections.applications);
      console.log(`✅ Restored ${backupData.collections.applications.length} applications`);
    }

    if (backupData.collections.transactions.length > 0) {
      await Transaction.insertMany(backupData.collections.transactions);
      console.log(`✅ Restored ${backupData.collections.transactions.length} transactions`);
    }

    console.log('\n✅ Database restore completed successfully!');
    console.log('🚀 Your web app is back on track!\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Restore failed:', err.message);
    process.exit(1);
  }
};

// Get backup file from command line argument
const backupFile = process.argv[2];

if (!backupFile) {
  console.log('Usage: npm run restore <backup-file-name>');
  console.log('\nExample:');
  console.log('  npm run restore backup-2026-01-24-1769262554742.json');
  console.log('\nOr provide full path:');
  console.log('  npm run restore "C:\\path\\to\\backup.json"');
  process.exit(1);
}

// If only filename provided, look in backups/manual folder
const backupPath = path.isAbsolute(backupFile) 
  ? backupFile 
  : path.join(__dirname, '../backups/manual', backupFile);

restoreDatabase(backupPath);
