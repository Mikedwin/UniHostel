const {
  sendPasswordResetEmail,
  sendApplicationSubmittedEmail,
  sendApplicationApprovedForPaymentEmail,
  sendPaymentSuccessEmail,
  sendFinalApprovalEmail,
  sendApplicationRejectedEmail,
  sendNewApplicationNotificationToManager
} = require('./utils/emailService');

require('dotenv').config();

const testEmail = process.env.EMAIL_USER || 'test@example.com';

async function testEmailNotifications() {
  console.log('🧪 Testing Email Notification System...\n');
  console.log('📧 Email User:', process.env.EMAIL_USER);
  console.log('🔑 Email Password Set:', process.env.EMAIL_PASSWORD !== 'your-gmail-app-password-here' ? 'YES ✅' : 'NO ❌');
  console.log('🌐 Frontend URL:', process.env.FRONTEND_URL);
  console.log('\n' + '='.repeat(60) + '\n');

  if (!process.env.EMAIL_PASSWORD || process.env.EMAIL_PASSWORD === 'your-gmail-app-password-here') {
    console.log('⚠️  EMAIL NOT CONFIGURED!');
    console.log('📝 To enable emails:');
    console.log('   1. Go to Google Account → Security → 2-Step Verification');
    console.log('   2. Generate App Password (Mail → Other)');
    console.log('   3. Update EMAIL_PASSWORD in .env');
    console.log('   4. Restart and run this test again\n');
    console.log('✅ Email functions will log to console instead\n');
  }

  const tests = [
    {
      name: '1. Application Submitted (Student)',
      fn: () => sendApplicationSubmittedEmail(
        testEmail,
        'John Doe',
        'Sunshine Hostel',
        '2 in a Room',
        'Fall 2024'
      )
    },
    {
      name: '2. New Application Alert (Manager)',
      fn: () => sendNewApplicationNotificationToManager(
        testEmail,
        'Manager Mike',
        'John Doe',
        'Sunshine Hostel',
        '2 in a Room'
      )
    },
    {
      name: '3. Application Approved for Payment',
      fn: () => sendApplicationApprovedForPaymentEmail(
        testEmail,
        'John Doe',
        'Sunshine Hostel',
        '2 in a Room',
        1500
      )
    },
    {
      name: '4. Payment Successful',
      fn: () => sendPaymentSuccessEmail(
        testEmail,
        'John Doe',
        'Sunshine Hostel',
        '2 in a Room',
        1500,
        'UNI-TEST-12345'
      )
    },
    {
      name: '5. Final Approval with Access Code',
      fn: () => sendFinalApprovalEmail(
        testEmail,
        'John Doe',
        'Sunshine Hostel',
        '2 in a Room',
        'UNI-1234567890-ABCD'
      )
    },
    {
      name: '6. Application Rejected',
      fn: () => sendApplicationRejectedEmail(
        testEmail,
        'John Doe',
        'Sunshine Hostel',
        '2 in a Room'
      )
    },
    {
      name: '7. Password Reset',
      fn: () => sendPasswordResetEmail(
        testEmail,
        'test-token-12345'
      )
    }
  ];

  for (const test of tests) {
    try {
      console.log(`📧 Testing: ${test.name}`);
      await test.fn();
      console.log(`   ✅ Success\n`);
    } catch (error) {
      console.log(`   ❌ Failed: ${error.message}\n`);
    }
  }

  console.log('='.repeat(60));
  console.log('\n✅ Email Notification Test Complete!');
  
  if (process.env.EMAIL_PASSWORD && process.env.EMAIL_PASSWORD !== 'your-gmail-app-password-here') {
    console.log(`\n📬 Check inbox: ${testEmail}`);
    console.log('   You should have received 7 test emails\n');
  } else {
    console.log('\n⚠️  Emails were logged but not sent (EMAIL_PASSWORD not configured)\n');
  }
}

testEmailNotifications().catch(console.error);
