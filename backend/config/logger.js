const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');

// Sensitive keys that must NEVER appear in logs
const SENSITIVE_KEYS = new Set([
  'password', 'passwordhash', 'token', 'jwt', 'secret', 'jwt_secret',
  'authorization', 'cookie', 'accesstoken', 'refreshtoken', 'verificationtoken',
  'resetpasswordtoken', 'codehash', 'mfa', 'privilegedmfa', 'securityanswer',
  'creditcard', 'cvv', 'cardnumber', 'paystack_secret_key'
]);

const redactSensitiveData = winston.format((info) => {
  const redact = (obj, depth = 0) => {
    if (!obj || typeof obj !== 'object' || depth > 5) return obj;
    if (Array.isArray(obj)) return obj.map(item => redact(item, depth + 1));

    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      if (SENSITIVE_KEYS.has(key.toLowerCase())) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = redact(value, depth + 1);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  };

  return redact(info);
});

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  redactSensitiveData(),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  redactSensitiveData(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    return `${timestamp} [${level}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
  })
);

const logsDir = path.join(__dirname, '../logs');

const transports = [
  // Always output to Console for containerized platforms (Render, Railway, Docker)
  new winston.transports.Console({
    format: process.env.NODE_ENV === 'production' ? logFormat : consoleFormat
  })
];

// Add file rotation when not in serverless/read-only environments
try {
  transports.push(
    new DailyRotateFile({
      filename: path.join(logsDir, 'app-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d'
    }),
    new DailyRotateFile({
      filename: path.join(logsDir, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxSize: '20m',
      maxFiles: '30d'
    })
  );
} catch (_) {
  // Ignore filesystem transport failures on restricted hosts
}

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports
});

module.exports = logger;
