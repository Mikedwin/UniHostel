const Visitor = require('../models/Visitor');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { AUTH_COOKIE_NAME } = require('../utils/authCookies');

const parseUserAgent = (userAgent) => {
  if (!userAgent) return { device: 'Unknown', browser: 'Unknown', os: 'Unknown' };
  
  // Device detection
  let device = 'Desktop';
  if (/mobile/i.test(userAgent)) device = 'Mobile';
  if (/tablet|ipad/i.test(userAgent)) device = 'Tablet';
  
  // Browser detection
  let browser = 'Unknown';
  if (/chrome/i.test(userAgent) && !/edg/i.test(userAgent)) browser = 'Chrome';
  else if (/safari/i.test(userAgent) && !/chrome/i.test(userAgent)) browser = 'Safari';
  else if (/firefox/i.test(userAgent)) browser = 'Firefox';
  else if (/edg/i.test(userAgent)) browser = 'Edge';
  else if (/opera|opr/i.test(userAgent)) browser = 'Opera';
  
  // OS detection
  let os = 'Unknown';
  if (/windows/i.test(userAgent)) os = 'Windows';
  else if (/mac/i.test(userAgent)) os = 'macOS';
  else if (/linux/i.test(userAgent)) os = 'Linux';
  else if (/android/i.test(userAgent)) os = 'Android';
  else if (/ios|iphone|ipad/i.test(userAgent)) os = 'iOS';
  
  return { device, browser, os };
};

const getClientIp = (req) => {
  const forwardedFor = req.headers['x-forwarded-for'];

  if (typeof forwardedFor === 'string' && forwardedFor.trim()) {
    return forwardedFor.split(',')[0].trim();
  }

  return req.ip || req.connection?.remoteAddress || 'Unknown';
};

const decodeUserFromToken = (token) => {
  if (!token) {
    return {};
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256'],
      maxAge: '30d'
    });

    if (decoded && decoded.id) {
      return {
        userId: decoded.id,
        userRole: decoded.role
      };
    }
  } catch (err) {
    // Invalid or expired token - keep visitor as guest
  }

  return {};
};

const getUserFromRequest = (req) => {
  const cookieToken = req.cookies?.[AUTH_COOKIE_NAME];
  if (cookieToken) {
    const cookieAuthData = decodeUserFromToken(cookieToken);
    if (cookieAuthData.userId) {
      return cookieAuthData;
    }
  }

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return decodeUserFromToken(authHeader.substring(7));
  }

  return {};
};

const recordVisitorEvent = async (req, overrides = {}) => {
  if (mongoose.connection.readyState !== 1) {
    throw new Error('Visitor tracking unavailable: database is not connected');
  }

  const userAgent = req.get('user-agent');
  const { device, browser, os } = parseUserAgent(userAgent);
  const authData = getUserFromRequest(req);

  const visitorData = {
    ip: getClientIp(req),
    userAgent,
    device,
    browser,
    os,
    url: overrides.url || req.originalUrl || req.url,
    method: overrides.method || req.method,
    eventType: overrides.eventType || 'request',
    source: overrides.source || 'server',
    sessionId: overrides.sessionId,
    pageTitle: overrides.pageTitle,
    referrer: overrides.referrer || req.get('referer'),
    ...authData
  };

  return Visitor.create(visitorData);
};

const trackVisitor = async (req, res, next) => {
  // Skip tracking entirely - run in background without blocking
  next();
  
  try {
    // Skip tracking for health checks and static files
    if (req.url === '/' || req.url === '/api/health' || req.url.includes('/api-docs') || req.url.includes('/api/')) {
      return;
    }
    
    // Log visitor asynchronously (don't block request)
    recordVisitorEvent(req).catch(err => console.error('Visitor tracking error:', err));
  } catch (error) {
    // Don't break the app if tracking fails
    console.error('Visitor tracking middleware error:', error);
  }
};

module.exports = trackVisitor;
module.exports.parseUserAgent = parseUserAgent;
module.exports.recordVisitorEvent = recordVisitorEvent;
