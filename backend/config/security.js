const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { parseEnvInt } = require('./env');

const RATE_LIMIT_WINDOW_MS = parseEnvInt(process.env.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000);
const RATE_LIMIT_MAX_REQUESTS = parseEnvInt(process.env.RATE_LIMIT_MAX_REQUESTS, process.env.NODE_ENV === 'development' ? 1000 : 120);
const AUTH_RATE_LIMIT_WINDOW_MS = parseEnvInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS, RATE_LIMIT_WINDOW_MS);
const AUTH_RATE_LIMIT_MAX = parseEnvInt(process.env.AUTH_RATE_LIMIT_MAX, process.env.NODE_ENV === 'development' ? 100 : 20);
const REGISTER_RATE_LIMIT_WINDOW_MS = parseEnvInt(process.env.REGISTER_RATE_LIMIT_WINDOW_MS, RATE_LIMIT_WINDOW_MS);
const REGISTER_RATE_LIMIT_MAX = parseEnvInt(process.env.REGISTER_RATE_LIMIT_MAX, process.env.NODE_ENV === 'development' ? 100 : 20);

const helmetMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

const apiLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: RATE_LIMIT_MAX_REQUESTS,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: AUTH_RATE_LIMIT_WINDOW_MS,
  max: AUTH_RATE_LIMIT_MAX,
  message: `Too many login attempts, please try again after ${Math.ceil(AUTH_RATE_LIMIT_WINDOW_MS / 60000)} minutes.`,
  skipSuccessfulRequests: true,
});

const registerLimiter = rateLimit({
  windowMs: REGISTER_RATE_LIMIT_WINDOW_MS,
  max: REGISTER_RATE_LIMIT_MAX,
  message: `Too many registration attempts, please try again after ${Math.ceil(REGISTER_RATE_LIMIT_WINDOW_MS / 60000)} minutes.`,
  skipSuccessfulRequests: true,
});

const waitlistLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many waitlist submissions from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const searchLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: 'Too many search requests, please slow down.',
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  helmetMiddleware,
  apiLimiter,
  authLimiter,
  registerLimiter,
  waitlistLimiter,
  searchLimiter
};
