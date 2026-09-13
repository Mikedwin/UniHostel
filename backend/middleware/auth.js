const jwt = require('jsonwebtoken');
const { verifyCsrfToken } = require('./csrf');
const { AUTH_COOKIE_NAME } = require('../utils/authCookies');

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

const getBearerToken = (req) => {
  const authHeader = req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.replace('Bearer ', '').trim();
  return token || null;
};

const verifyAuthToken = (token) => jwt.verify(token, process.env.JWT_SECRET, {
  algorithms: ['HS256'],
  maxAge: '30d'
});

const auth = (req, res, next) => {
  const cookieToken = req.cookies?.[AUTH_COOKIE_NAME] || null;
  const bearerToken = getBearerToken(req);
  const candidates = [
    { token: cookieToken, source: 'cookie' },
    { token: bearerToken, source: 'header' }
  ].filter(({ token }) => token);

  try {
    if (candidates.length === 0) {
      return res.status(401).json({ message: 'No authentication token, access denied' });
    }

    let verifiedUser = null;
    let authSource = null;
    let lastVerificationError = null;

    for (const candidate of candidates) {
      if (!candidate.token || candidate.token.length < 20 || candidate.token.length > 500) {
        continue;
      }

      try {
        const verified = verifyAuthToken(candidate.token);
        if (verified?.id && verified?.role) {
          verifiedUser = verified;
          authSource = candidate.source;
          break;
        }
      } catch (err) {
        lastVerificationError = err;
      }
    }

    if (!verifiedUser || !authSource) {
      if (lastVerificationError?.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired. Please login again.' });
      }

      if (lastVerificationError?.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Invalid token. Please login again.' });
      }

      return res.status(401).json({ message: 'Authentication failed' });
    }

    if (authSource === 'cookie' && !SAFE_METHODS.has(req.method)) {
      const csrfToken = req.headers['x-csrf-token'];
      if (!verifyCsrfToken(csrfToken, verifiedUser.id)) {
        return res.status(403).json({ message: 'Invalid CSRF token' });
      }
    }

    req.user = verifiedUser;
    req.authSource = authSource;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired. Please login again.' });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token. Please login again.' });
    }
    res.status(401).json({ message: 'Authentication failed' });
  }
};

const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    
    if (!req.user || !req.user.role) {
      return res.status(403).json({ message: 'Access denied: No role found' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied: Insufficient permissions' });
    }
    next();
  };
};

module.exports = { auth, checkRole };
