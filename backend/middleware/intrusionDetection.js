const BannedIp = require('../models/BannedIp');
const SecurityLog = require('../models/SecurityLog');
const { sendSecurityAlert, sendTelegramAlert, sendDiscordAlert } = require('../utils/securityAlerts');

// Attack patterns
const SQL_INJECTION_PATTERNS = [
  /(\%27)|(\')|(\-\-)|(\%23)|(#)/i,
  /((\%3D)|(=))[^\n]*((\%27)|(\')|(\-\-)|(\%3B)|(;))/i,
  /\w*((\%27)|(\'))((\%6F)|o|(\%4F))((\%72)|r|(\%52))/i,
  /union.*select/i,
  /select.*from/i,
  /insert.*into/i,
  /delete.*from/i,
  /drop.*table/i,
  /exec(\s|\+)+(s|x)p\w+/i
];

const XSS_PATTERNS = [
  /<script[^>]*>.*?<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
  /<iframe/gi,
  /<object/gi,
  /<embed/gi,
  /eval\(/gi,
  /expression\(/gi
];

// Check if IP is banned
const checkBannedIp = async (ip) => {
  try {
    const banned = await BannedIp.findOne({ ip });
    if (banned) {
      banned.attempts += 1;
      banned.lastAttempt = new Date();
      await banned.save();
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error checking banned IP:', error);
    return false;
  }
};

// Detect SQL injection
const detectSqlInjection = (str) => {
  return SQL_INJECTION_PATTERNS.some(pattern => pattern.test(str));
};

// Detect XSS
const detectXss = (str) => {
  return XSS_PATTERNS.some(pattern => pattern.test(str));
};

// Scan request for attacks
const scanRequest = (req) => {
  const suspicious = [];
  
  // Check URL
  if (detectSqlInjection(req.url)) suspicious.push('sql_injection');
  if (detectXss(req.url)) suspicious.push('xss');
  
  // Check query params
  const queryString = JSON.stringify(req.query);
  if (detectSqlInjection(queryString)) suspicious.push('sql_injection');
  if (detectXss(queryString)) suspicious.push('xss');
  
  // Check body
  if (req.body) {
    const bodyString = JSON.stringify(req.body);
    if (detectSqlInjection(bodyString)) suspicious.push('sql_injection');
    if (detectXss(bodyString)) suspicious.push('xss');
  }
  
  return [...new Set(suspicious)]; // Remove duplicates
};

// Log security event
const logSecurityEvent = async (req, attackType, severity, blocked) => {
  try {
    await SecurityLog.create({
      ip: req.ip || req.connection.remoteAddress,
      attackType,
      severity,
      method: req.method,
      url: req.url,
      payload: JSON.stringify({ query: req.query, body: req.body }).substring(0, 500),
      userAgent: req.get('user-agent'),
      blocked
    });
  } catch (error) {
    console.error('Error logging security event:', error);
  }
};

// Ban IP
const banIp = async (ip, reason, attackType) => {
  try {
    const existingBan = await BannedIp.findOne({ ip });
    if (existingBan) {
      existingBan.attempts += 1;
      existingBan.lastAttempt = new Date();
      await existingBan.save();
    } else {
      await BannedIp.create({
        ip,
        reason,
        attackType,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      });
    }
  } catch (error) {
    console.error('Error banning IP:', error);
  }
};

// Main IDS middleware
const intrusionDetection = async (req, res, next) => {
  // Skip if security is disabled
  if (process.env.SECURITY_ENABLED === 'false') {
    return next();
  }

  const ip = req.ip || req.connection.remoteAddress;
  
  try {
    // Check if IP is already banned
    const isBanned = await checkBannedIp(ip);
    if (isBanned && process.env.SECURITY_AUTO_BLOCK === 'true') {
      await logSecurityEvent(req, 'banned_ip_attempt', 'high', true);
      return res.status(403).json({ message: 'Access denied' });
    }

    // Scan for attacks
    const attacks = scanRequest(req);
    
    if (attacks.length > 0) {
      const severity = attacks.includes('sql_injection') ? 'critical' : 'high';
      const shouldBlock = process.env.SECURITY_AUTO_BLOCK === 'true';
      
      // Log the attack
      await logSecurityEvent(req, attacks.join(', '), severity, shouldBlock);
      
      // Ban IP if auto-block is enabled
      if (shouldBlock) {
        await banIp(ip, `Detected: ${attacks.join(', ')}`, attacks[0]);
      }
      
      // Send alerts
      const alertDetails = {
        ip,
        attackType: attacks.join(', '),
        severity,
        url: req.url,
        blocked: shouldBlock
      };
      
      sendSecurityAlert(alertDetails).catch(err => console.error('Alert failed:', err));
      sendTelegramAlert(alertDetails).catch(err => console.error('Telegram failed:', err));
      sendDiscordAlert(alertDetails).catch(err => console.error('Discord failed:', err));
      
      // Block if enabled
      if (shouldBlock) {
        return res.status(403).json({ message: 'Suspicious activity detected' });
      }
    }
    
    next();
  } catch (error) {
    console.error('IDS middleware error:', error);
    next(); // Continue even if IDS fails - don't break the app
  }
};

module.exports = intrusionDetection;
