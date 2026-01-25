require('dotenv').config();
const mongoose = require('mongoose');

async function testDataRetention() {
  console.log('🧪 Testing Data Retention System...\n');
  
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Database connected\n');
    
    // Import service
    const {
      cleanupOldLoginHistory,
      cleanupArchivedApplications,
      cleanupInactiveUnverifiedUsers,
      cleanupExpiredPasswordResetTokens,
      cleanupOldTransactions,
      runDataRetentionCleanup
    } = require('./services/dataRetention');
    
    console.log('✅ Data retention service loaded\n');
    
    // Test configuration
    console.log('📋 Configuration:');
    console.log(`   DATA_RETENTION_DAYS: ${process.env.DATA_RETENTION_DAYS || 730}`);
    console.log(`   INACTIVE_USER_DAYS: ${process.env.INACTIVE_USER_DAYS || 365}`);
    console.log(`   ARCHIVED_APPLICATION_DAYS: ${process.env.ARCHIVED_APPLICATION_DAYS || 180}`);
    console.log(`   LOGIN_HISTORY_DAYS: ${process.env.LOGIN_HISTORY_DAYS || 90}`);
    console.log(`   CLEANUP_SCHEDULE_HOUR: ${process.env.CLEANUP_SCHEDULE_HOUR || 2}\n`);
    
    // Test individual cleanup functions
    console.log('🧹 Testing Individual Cleanup Functions:\n');
    
    console.log('1. Testing cleanupOldLoginHistory...');
    const loginResult = await cleanupOldLoginHistory();
    console.log(`   ✅ Cleaned ${loginResult} users\n`);
    
    console.log('2. Testing cleanupArchivedApplications...');
    const appResult = await cleanupArchivedApplications();
    console.log(`   ✅ Deleted ${appResult} applications\n`);
    
    console.log('3. Testing cleanupInactiveUnverifiedUsers...');
    const userResult = await cleanupInactiveUnverifiedUsers();
    console.log(`   ✅ Deleted ${userResult} users\n`);
    
    console.log('4. Testing cleanupExpiredPasswordResetTokens...');
    const tokenResult = await cleanupExpiredPasswordResetTokens();
    console.log(`   ✅ Cleaned ${tokenResult} tokens\n`);
    
    console.log('5. Testing cleanupOldTransactions...');
    const txResult = await cleanupOldTransactions();
    console.log(`   ✅ Anonymized ${txResult} transactions\n`);
    
    // Test full cleanup
    console.log('🚀 Testing Full Cleanup:\n');
    const fullResults = await runDataRetentionCleanup();
    console.log('   Results:', fullResults);
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ ALL TESTS PASSED!');
    console.log('='.repeat(60));
    
    await mongoose.connection.close();
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

testDataRetention();
