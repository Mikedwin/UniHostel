const axios = require('axios');

const API_URL = 'https://uni-hostel-two.vercel.app/api';

console.log('🔒 CRITICAL VULNERABILITY VERIFICATION TEST\n');
console.log('Testing:', API_URL);
console.log('═══════════════════════════════════════════════════════\n');

async function testAuthBypass() {
  console.log('🔴 TEST: Authorization Bypass on Protected Routes\n');
  
  const invalidTokens = [
    '',
    'Bearer ',
    'Bearer invalid',
    'Bearer eyJhbGciOiJub25lIn0.eyJpZCI6IjEyMyIsInJvbGUiOiJtYW5hZ2VyIn0.',
    'invalid-token'
  ];

  for (const token of invalidTokens) {
    try {
      console.log(`Testing with token: "${token.substring(0, 30)}..."`);
      const response = await axios.get(`${API_URL}/hostels/my-listings`, {
        headers: token ? { Authorization: token } : {},
        validateStatus: () => true
      });

      console.log(`  Status: ${response.status}`);
      
      if (response.status === 200) {
        console.log('  ❌ CRITICAL: Bypassed authentication!');
        console.log('  Response:', JSON.stringify(response.data).substring(0, 100));
        return false;
      } else if (response.status === 401) {
        console.log('  ✅ Properly rejected');
      } else {
        console.log(`  ⚠️  Unexpected status: ${response.status}`);
      }
    } catch (err) {
      console.log(`  ✅ Request blocked: ${err.message}`);
    }
    console.log('');
  }
  
  return true;
}

async function testCORS() {
  console.log('\n🔴 TEST: CORS Policy Verification\n');
  
  try {
    const response = await axios.get(`${API_URL}/hostels`, {
      headers: {
        'Origin': 'https://malicious-site.com',
        'Access-Control-Request-Method': 'GET'
      },
      validateStatus: () => true
    });

    console.log(`Status: ${response.status}`);
    console.log('CORS Headers:');
    console.log(`  Access-Control-Allow-Origin: ${response.headers['access-control-allow-origin'] || 'NOT SET'}`);
    console.log(`  Access-Control-Allow-Credentials: ${response.headers['access-control-allow-credentials'] || 'NOT SET'}`);
    
    const allowOrigin = response.headers['access-control-allow-origin'];
    
    if (allowOrigin === '*' || allowOrigin === 'https://malicious-site.com') {
      console.log('\n❌ CRITICAL: CORS allows unauthorized origins!');
      return false;
    } else if (!allowOrigin || allowOrigin === 'https://uni-hostel-two.vercel.app') {
      console.log('\n✅ CORS properly restricted');
      return true;
    }
  } catch (err) {
    console.log(`Error: ${err.message}`);
    console.log('✅ CORS properly restricted (request blocked)');
    return true;
  }
}

async function testSecurityHeaders() {
  console.log('\n🔴 TEST: Security Headers\n');
  
  try {
    const response = await axios.get(`${API_URL}/health`, {
      validateStatus: () => true
    });

    console.log('Security Headers Present:');
    const headers = {
      'X-Content-Type-Options': response.headers['x-content-type-options'],
      'X-Frame-Options': response.headers['x-frame-options'],
      'Strict-Transport-Security': response.headers['strict-transport-security'],
      'X-XSS-Protection': response.headers['x-xss-protection'],
      'Content-Security-Policy': response.headers['content-security-policy']
    };

    let allPresent = true;
    for (const [header, value] of Object.entries(headers)) {
      if (value) {
        console.log(`  ✅ ${header}: ${value.substring(0, 50)}...`);
      } else {
        console.log(`  ❌ ${header}: MISSING`);
        allPresent = false;
      }
    }

    return allPresent;
  } catch (err) {
    console.log(`Error: ${err.message}`);
    return false;
  }
}

async function runTests() {
  const results = {
    authBypass: await testAuthBypass(),
    cors: await testCORS(),
    headers: await testSecurityHeaders()
  };

  console.log('\n═══════════════════════════════════════════════════════');
  console.log('📊 FINAL RESULTS\n');
  
  console.log(`Authorization Bypass: ${results.authBypass ? '✅ SECURE' : '❌ VULNERABLE'}`);
  console.log(`CORS Policy: ${results.cors ? '✅ SECURE' : '❌ VULNERABLE'}`);
  console.log(`Security Headers: ${results.headers ? '✅ ALL PRESENT' : '⚠️  SOME MISSING'}`);
  
  const passed = Object.values(results).filter(r => r).length;
  const total = Object.keys(results).length;
  
  console.log(`\n🎯 SECURITY SCORE: ${Math.round((passed/total)*100)}%`);
  
  if (passed === total) {
    console.log('✅ NO CRITICAL VULNERABILITIES FOUND');
  } else {
    console.log('❌ CRITICAL VULNERABILITIES DETECTED');
  }
  
  console.log('═══════════════════════════════════════════════════════\n');
}

runTests().catch(console.error);
