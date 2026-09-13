const axios = require('axios');

// WARNING: FOR TESTING ONLY - DO NOT USE IN PRODUCTION
const API_URL = process.env.API_URL || 'http://localhost:5000';
const TEST_EMAIL = process.env.TEST_EMAIL || 'test@example.com';
const WRONG_PASSWORD = process.env.TEST_PASSWORD || 'TestWrong123!';

async function testAccountLockout() {
  console.log('🧪 Testing Account Lockout Mechanism\n');
  console.log('=' .repeat(50));
  
  try {
    // Test 5 failed login attempts
    for (let i = 1; i <= 6; i++) {
      console.log(`\n📝 Attempt ${i}:`);
      
      try {
        const response = await axios.post(`${API_URL}/api/auth/login`, {
          email: TEST_EMAIL,
          password: WRONG_PASSWORD
        });
        
        console.log('✅ Login successful (unexpected!)');
      } catch (error) {
        if (error.response) {
          const status = error.response.status;
          const message = error.response.data.message;
          const attemptsLeft = error.response.data.attemptsLeft;
          
          if (status === 423) {
            console.log(`🔒 LOCKED: ${message}`);
            console.log('✅ Account lockout working correctly!');
            break;
          } else if (status === 400) {
            console.log(`❌ Failed: ${message}`);
            if (attemptsLeft !== undefined) {
              console.log(`⚠️  Attempts remaining: ${attemptsLeft}`);
            }
          } else {
            console.log(`❓ Status ${status}: ${message}`);
          }
        } else {
          console.log('❌ Network error:', error.message);
        }
      }
      
      // Small delay between attempts
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('✅ Test completed successfully!');
    console.log('\n📊 Expected behavior:');
    console.log('  - Attempts 1-4: Show remaining attempts');
    console.log('  - Attempt 5: Account locked for 30 minutes');
    console.log('  - Status 423: Account locked');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  }
}

// Run test
console.log('⚠️  Make sure:');
console.log('  1. Backend server is running (npm run dev)');
console.log('  2. Test user exists with email:', TEST_EMAIL);
console.log('  3. MongoDB is connected\n');

testAccountLockout();
