const Visitor = require('../models/Visitor');

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

const trackVisitor = async (req, res, next) => {
  try {
    // Skip tracking for health checks and static files
    if (req.url === '/' || req.url === '/api/health' || req.url.includes('/api-docs')) {
      return next();
    }
    
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('user-agent');
    const { device, browser, os } = parseUserAgent(userAgent);
    
    const visitorData = {
      ip,
      userAgent,
      device,
      browser,
      os,
      url: req.url,
      method: req.method
    };
    
    // Add user info if authenticated
    if (req.user) {
      visitorData.userId = req.user.id;
      visitorData.userRole = req.user.role;
    }
    
    // Log visitor asynchronously (don't block request)
    Visitor.create(visitorData).catch(err => console.error('Visitor tracking error:', err));
    
    next();
  } catch (error) {
    // Don't break the app if tracking fails
    console.error('Visitor tracking middleware error:', error);
    next();
  }
};

module.exports = trackVisitor;
