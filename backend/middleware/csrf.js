const crypto = require('crypto');

// Store for CSRF tokens (in production, use Redis)
const csrfTokens = new Map();

// Clean up old tokens every hour
setInterval(() => {
  const now = Date.now();
  for (const [token, data] of csrfTokens.entries()) {
    if (now - data.timestamp > 3600000) { // 1 hour
      csrfTokens.delete(token);
    }
  }
}, 3600000);

// Generate CSRF token
const generateCsrfToken = (userId) => {
  // Invalidate old tokens for this user
  for (const [token, data] of csrfTokens.entries()) {
    if (data.userId === userId) {
      csrfTokens.delete(token);
    }
  }
  
  const token = crypto.randomBytes(32).toString('hex');
  csrfTokens.set(token, {
    userId,
    timestamp: Date.now()
  });
  return token;
};

// Verify CSRF token
const verifyCsrfToken = (token, userId) => {
  if (!token || !userId) return false;
  
  const data = csrfTokens.get(token);
  if (!data) return false;
  if (data.userId !== userId) return false;
  if (Date.now() - data.timestamp > 3600000) { // 1 hour expiry
    csrfTokens.delete(token);
    return false;
  }
  return true;
};

// Invalidate CSRF token (on logout)
const invalidateCsrfToken = (token) => {
  if (token) {
    csrfTokens.delete(token);
  }
};

// Middleware to check CSRF token
const csrfProtection = (req, res, next) => {
  // Skip CSRF for GET, HEAD, OPTIONS
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Skip CSRF for public endpoints
  const publicEndpoints = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/forgot-password',
    '/api/auth/reset-password',
    '/api/auth/reset-verify',
    '/api/auth/reset-with-security'
  ];

  if (publicEndpoints.some(endpoint => req.path.startsWith(endpoint))) {
    return next();
  }

  // Check for CSRF token in header
  const token = req.headers['x-csrf-token'];
  
  if (!token) {
    return res.status(403).json({ message: 'CSRF token missing' });
  }

  // Verify token matches user
  if (!req.user || !verifyCsrfToken(token, req.user.id)) {
    return res.status(403).json({ message: 'Invalid CSRF token' });
  }

  next();
};

module.exports = { generateCsrfToken, csrfProtection, invalidateCsrfToken };
