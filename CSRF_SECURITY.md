# CSRF Protection Security Documentation

## Implementation Overview

UniHostel uses custom CSRF (Cross-Site Request Forgery) protection to prevent malicious websites from making unauthorized requests on behalf of authenticated users.

## How It Works

### 1. Token Generation
- CSRF token generated on login
- 32-byte random hex string (256-bit entropy)
- Stored server-side with user ID and timestamp
- Sent to client alongside JWT token

### 2. Token Storage
- **Server:** In-memory Map (use Redis in production for scaling)
- **Client:** localStorage (not accessible to other origins)

### 3. Token Validation
- Required for all state-changing requests (POST, PUT, PATCH, DELETE)
- Sent in `X-CSRF-Token` header
- Validated against user ID from JWT
- 1-hour expiry

### 4. Token Lifecycle
- **Created:** On login
- **Invalidated:** On logout or new login
- **Expired:** After 1 hour of inactivity
- **Cleaned:** Hourly cleanup of expired tokens

## Protected Endpoints

### Critical Operations (CSRF Required)
- ✅ Password changes
- ✅ Security question setup
- ✅ Hostel creation/update/deletion
- ✅ Application submission/status changes
- ✅ Payment operations
- ✅ Transaction processing

### Public Operations (No CSRF)
- ✅ Login/Register
- ✅ Password reset requests
- ✅ GET requests (read-only)

## Security Features

### 1. Token Rotation
- Old tokens invalidated on new login
- Prevents token reuse across sessions

### 2. User Binding
- Token tied to specific user ID
- Cannot be used by different user

### 3. Time-Limited
- 1-hour expiry
- Reduces window of opportunity for attacks

### 4. Logout Cleanup
- Tokens invalidated on logout
- Prevents use of stolen tokens after logout

## Attack Prevention

### CSRF Attack Scenario
```
1. User logs into UniHostel
2. User visits malicious site evil.com
3. evil.com tries to make request to UniHostel
4. Browser sends JWT (automatic)
5. But CSRF token is NOT sent (localStorage not accessible)
6. Request REJECTED ✅
```

### Why It's Secure
- **Same-Origin Policy:** Malicious sites cannot read localStorage
- **Custom Header:** `X-CSRF-Token` cannot be set by simple forms
- **Token Validation:** Server checks token matches user

## Production Recommendations

### 1. Use Redis for Token Storage
```javascript
const redis = require('redis');
const client = redis.createClient();

const generateCsrfToken = async (userId) => {
  const token = crypto.randomBytes(32).toString('hex');
  await client.setex(`csrf:${token}`, 3600, userId);
  return token;
};
```

### 2. Implement Token Rotation
- Rotate tokens every 15 minutes
- Issue new token with each request
- Maintain sliding window

### 3. Add Rate Limiting
- Limit CSRF validation failures
- Block IPs with repeated failures

### 4. Monitor & Alert
- Log CSRF validation failures
- Alert on suspicious patterns
- Track token usage metrics

## Testing CSRF Protection

### Valid Request
```bash
curl -X POST https://unihostel.com/api/applications \
  -H "Authorization: Bearer JWT_TOKEN" \
  -H "X-CSRF-Token: CSRF_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"hostelId":"123","roomType":"Single"}'
# Response: 201 Created ✅
```

### Invalid Request (No CSRF Token)
```bash
curl -X POST https://unihostel.com/api/applications \
  -H "Authorization: Bearer JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"hostelId":"123","roomType":"Single"}'
# Response: 403 Forbidden - CSRF token missing ❌
```

### Invalid Request (Wrong Token)
```bash
curl -X POST https://unihostel.com/api/applications \
  -H "Authorization: Bearer JWT_TOKEN" \
  -H "X-CSRF-Token: WRONG_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"hostelId":"123","roomType":"Single"}'
# Response: 403 Forbidden - Invalid CSRF token ❌
```

## Limitations & Considerations

### Current Limitations
1. **In-Memory Storage:** Tokens lost on server restart
2. **No Horizontal Scaling:** Tokens not shared across servers
3. **1-Hour Window:** Stolen tokens valid for up to 1 hour

### Mitigation Strategies
1. Use Redis for persistent, shared storage
2. Implement token rotation (shorter validity)
3. Add additional verification (IP checks, device fingerprinting)
4. Monitor for suspicious activity

## Compliance

### OWASP Top 10
- ✅ A01:2021 - Broken Access Control (CSRF protection)
- ✅ A04:2021 - Insecure Design (Defense in depth)
- ✅ A07:2021 - Identification and Authentication Failures (Token validation)

### Best Practices
- ✅ Double Submit Cookie pattern (modified with JWT)
- ✅ Custom request headers
- ✅ Token expiration
- ✅ Logout cleanup
- ✅ Origin validation (CORS)

## Maintenance

### Regular Tasks
- Monitor token storage size
- Review CSRF failure logs
- Update token expiry based on usage patterns
- Test CSRF protection after updates

### Emergency Response
If CSRF vulnerability discovered:
1. Invalidate all tokens immediately
2. Force re-login for all users
3. Patch vulnerability
4. Notify affected users
5. Review logs for exploitation attempts
