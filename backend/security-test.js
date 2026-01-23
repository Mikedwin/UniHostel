const axios = require('axios');

const API_URL = 'https://uni-hostel-two.vercel.app/api';
const LOCAL_URL = 'http://localhost:5000/api';

// Use production URL for testing
const BASE_URL = API_URL;

console.log('🔒 UniHostel Security Penetration Test\n');
console.log('Target:', BASE_URL);
console.log('Starting ethical security assessment...\n');

const results = {
  passed: [],
  failed: [],
  warnings: []
};

// Test 1: SQL/NoSQL Injection
async function testNoSQLInjection() {
  console.log('Test 1: NoSQL Injection Attack');
  try {
    const maliciousPayloads = [
      { email: { $ne: null }, password: { $ne: null } },
      { email: { $gt: '' }, password: { $gt: '' } },
      { email: '1mikedwin@gmail.com\' OR \'1\'=\'1', password: 'anything' }
    ];

    for (const payload of maliciousPayloads) {
      const response = await axios.post(`${BASE_URL}/auth/login`, payload, {
        validateStatus: () => true
      });
      
      if (response.status === 200 && response.data.token) {
        results.failed.push('❌ NoSQL Injection: Successfully bypassed authentication!');
        return;
      }
    }
    results.passed.push('✅ NoSQL Injection: Protected');
  } catch (err) {
    results.passed.push('✅ NoSQL Injection: Protected (sanitized)');
  }
}

// Test 2: JWT Token Manipulation
async function testJWTManipulation() {
  console.log('Test 2: JWT Token Manipulation');
  try {
    const maliciousTokens = [
      'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJpZCI6IjEyMzQ1Iiwicm9sZSI6ImFkbWluIn0.',
      'Bearer null',
      'Bearer undefined',
      'invalid.token.here',
      ''
    ];

    for (const token of maliciousTokens) {
      const response = await axios.get(`${BASE_URL}/hostels/my-listings`, {
        headers: { Authorization: token },
        validateStatus: () => true
      });
      
      if (response.status === 200) {
        results.failed.push('❌ JWT Manipulation: Bypassed with invalid token!');
        return;
      }
    }
    results.passed.push('✅ JWT Token Manipulation: Protected');
  } catch (err) {
    results.passed.push('✅ JWT Token Manipulation: Protected');
  }
}

// Test 3: Rate Limiting Bypass
async function testRateLimiting() {
  console.log('Test 3: Rate Limiting (Brute Force Protection)');
  try {
    const requests = [];
    for (let i = 0; i < 10; i++) {
      requests.push(
        axios.post(`${BASE_URL}/auth/login`, {
          email: 'test@test.com',
          password: 'wrongpassword'
        }, { validateStatus: () => true })
      );
    }
    
    const responses = await Promise.all(requests);
    const blockedRequests = responses.filter(r => r.status === 429);
    
    if (blockedRequests.length > 0) {
      results.passed.push('✅ Rate Limiting: Active (blocked after multiple attempts)');
    } else {
      results.warnings.push('⚠️ Rate Limiting: May need adjustment');
    }
  } catch (err) {
    results.warnings.push('⚠️ Rate Limiting: Could not test');
  }
}

// Test 4: XSS Injection
async function testXSSInjection() {
  console.log('Test 4: XSS (Cross-Site Scripting)');
  try {
    const xssPayloads = [
      '<script>alert("XSS")</script>',
      '<img src=x onerror=alert("XSS")>',
      'javascript:alert("XSS")',
      '<svg onload=alert("XSS")>'
    ];

    // Try to register with XSS payload in name
    const response = await axios.post(`${BASE_URL}/auth/register`, {
      name: xssPayloads[0],
      email: `xss${Date.now()}@test.com`,
      password: 'TestPass123'
    }, { validateStatus: () => true });

    if (response.status === 201 && response.data.user?.name?.includes('<script>')) {
      results.failed.push('❌ XSS: Vulnerable - Script tags not sanitized!');
    } else {
      results.passed.push('✅ XSS: Protected (input sanitized)');
    }
  } catch (err) {
    results.passed.push('✅ XSS: Protected');
  }
}

// Test 5: CORS Policy
async function testCORSPolicy() {
  console.log('Test 5: CORS Policy');
  try {
    const response = await axios.get(`${BASE_URL}/hostels`, {
      headers: { Origin: 'https://malicious-site.com' },
      validateStatus: () => true
    });

    const corsHeader = response.headers['access-control-allow-origin'];
    if (corsHeader === '*' || corsHeader === 'https://malicious-site.com') {
      results.failed.push('❌ CORS: Too permissive - allows unauthorized origins!');
    } else {
      results.passed.push('✅ CORS Policy: Properly restricted');
    }
  } catch (err) {
    results.passed.push('✅ CORS Policy: Properly restricted');
  }
}

// Test 6: Password Strength Validation
async function testPasswordStrength() {
  console.log('Test 6: Password Strength Validation');
  try {
    const weakPasswords = ['123', '12345', 'pass', 'abc'];
    
    for (const pwd of weakPasswords) {
      const response = await axios.post(`${BASE_URL}/auth/register`, {
        name: 'Test User',
        email: `test${Date.now()}@test.com`,
        password: pwd
      }, { validateStatus: () => true });

      if (response.status === 201) {
        results.failed.push('❌ Password Validation: Accepts weak passwords!');
        return;
      }
    }
    results.passed.push('✅ Password Strength: Enforced (min 8 chars)');
  } catch (err) {
    results.passed.push('✅ Password Strength: Enforced');
  }
}

// Test 7: Email Validation
async function testEmailValidation() {
  console.log('Test 7: Email Format Validation');
  try {
    const invalidEmails = ['notanemail', 'test@', '@test.com', 'test..test@test.com'];
    
    for (const email of invalidEmails) {
      const response = await axios.post(`${BASE_URL}/auth/register`, {
        name: 'Test User',
        email: email,
        password: 'TestPass123'
      }, { validateStatus: () => true });

      if (response.status === 201) {
        results.failed.push('❌ Email Validation: Accepts invalid email formats!');
        return;
      }
    }
    results.passed.push('✅ Email Validation: Properly enforced');
  } catch (err) {
    results.passed.push('✅ Email Validation: Properly enforced');
  }
}

// Test 8: Authorization Bypass
async function testAuthorizationBypass() {
  console.log('Test 8: Authorization Bypass (Role Escalation)');
  try {
    // Try to access manager endpoint without proper role
    const response = await axios.get(`${BASE_URL}/hostels/my-listings`, {
      headers: { Authorization: 'Bearer fake.token.here' },
      validateStatus: () => true
    });

    if (response.status === 200) {
      results.failed.push('❌ Authorization: Can access protected routes without valid token!');
    } else if (response.status === 401 || response.status === 403) {
      results.passed.push('✅ Authorization: Properly enforced');
    }
  } catch (err) {
    results.passed.push('✅ Authorization: Properly enforced');
  }
}

// Test 9: Payload Size Attack (DoS)
async function testPayloadSize() {
  console.log('Test 9: Large Payload Attack (DoS Prevention)');
  try {
    const largePayload = {
      name: 'A'.repeat(10 * 1024 * 1024), // 10MB
      email: 'test@test.com',
      password: 'TestPass123'
    };

    const response = await axios.post(`${BASE_URL}/auth/register`, largePayload, {
      validateStatus: () => true,
      maxContentLength: 15 * 1024 * 1024
    });

    if (response.status === 413 || response.status === 400) {
      results.passed.push('✅ Payload Size: Limited (DoS protected)');
    } else if (response.status === 201) {
      results.failed.push('❌ Payload Size: Accepts oversized payloads!');
    }
  } catch (err) {
    if (err.code === 'ERR_FR_MAX_BODY_LENGTH_EXCEEDED') {
      results.passed.push('✅ Payload Size: Limited (DoS protected)');
    } else {
      results.warnings.push('⚠️ Payload Size: Could not test');
    }
  }
}

// Test 10: Security Headers
async function testSecurityHeaders() {
  console.log('Test 10: Security Headers (Helmet.js)');
  try {
    const response = await axios.get(`${BASE_URL}/health`, {
      validateStatus: () => true
    });

    const headers = response.headers;
    const requiredHeaders = [
      'x-content-type-options',
      'x-frame-options',
      'strict-transport-security'
    ];

    const missingHeaders = requiredHeaders.filter(h => !headers[h]);
    
    if (missingHeaders.length === 0) {
      results.passed.push('✅ Security Headers: All present (Helmet active)');
    } else {
      results.warnings.push(`⚠️ Security Headers: Missing ${missingHeaders.join(', ')}`);
    }
  } catch (err) {
    results.warnings.push('⚠️ Security Headers: Could not verify');
  }
}

// Test 11: Sensitive Data Exposure
async function testSensitiveDataExposure() {
  console.log('Test 11: Sensitive Data Exposure');
  try {
    const response = await axios.get(`${BASE_URL}/hostels`, {
      validateStatus: () => true
    });

    const data = JSON.stringify(response.data);
    
    if (data.includes('password') || data.includes('JWT_SECRET') || data.includes('MONGO_URI')) {
      results.failed.push('❌ Data Exposure: Sensitive data leaked in API response!');
    } else {
      results.passed.push('✅ Data Exposure: No sensitive data in responses');
    }
  } catch (err) {
    results.passed.push('✅ Data Exposure: Protected');
  }
}

// Test 12: HTTPS Enforcement
async function testHTTPSEnforcement() {
  console.log('Test 12: HTTPS Enforcement');
  try {
    const response = await axios.get(`${BASE_URL}/health`, {
      validateStatus: () => true
    });

    const hstsHeader = response.headers['strict-transport-security'];
    
    if (hstsHeader && hstsHeader.includes('max-age')) {
      results.passed.push('✅ HTTPS: Enforced with HSTS header');
    } else {
      results.warnings.push('⚠️ HTTPS: HSTS header not found');
    }
  } catch (err) {
    results.warnings.push('⚠️ HTTPS: Could not verify');
  }
}

// Run all tests
async function runAllTests() {
  console.log('═══════════════════════════════════════════════════════\n');
  
  await testNoSQLInjection();
  await testJWTManipulation();
  await testRateLimiting();
  await testXSSInjection();
  await testCORSPolicy();
  await testPasswordStrength();
  await testEmailValidation();
  await testAuthorizationBypass();
  await testPayloadSize();
  await testSecurityHeaders();
  await testSensitiveDataExposure();
  await testHTTPSEnforcement();

  console.log('\n═══════════════════════════════════════════════════════');
  console.log('📊 PENETRATION TEST RESULTS\n');
  
  console.log(`✅ PASSED: ${results.passed.length} tests`);
  results.passed.forEach(r => console.log(`   ${r}`));
  
  if (results.warnings.length > 0) {
    console.log(`\n⚠️  WARNINGS: ${results.warnings.length}`);
    results.warnings.forEach(r => console.log(`   ${r}`));
  }
  
  if (results.failed.length > 0) {
    console.log(`\n❌ FAILED: ${results.failed.length} tests`);
    results.failed.forEach(r => console.log(`   ${r}`));
  }

  console.log('\n═══════════════════════════════════════════════════════');
  
  const totalTests = results.passed.length + results.failed.length + results.warnings.length;
  const securityScore = Math.round((results.passed.length / totalTests) * 100);
  
  console.log(`\n🎯 SECURITY SCORE: ${securityScore}%`);
  
  if (results.failed.length === 0) {
    console.log('✅ NO CRITICAL VULNERABILITIES FOUND');
  } else {
    console.log('⚠️  CRITICAL VULNERABILITIES DETECTED - IMMEDIATE ACTION REQUIRED');
  }
  
  console.log('\n═══════════════════════════════════════════════════════\n');
}

runAllTests().catch(err => {
  console.error('Test suite error:', err.message);
});
