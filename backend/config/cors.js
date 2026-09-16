const { parseEnvList } = require('./env');

const normalizeOrigin = (origin) => {
  if (typeof origin !== 'string') {
    return '';
  }
  return origin.trim().replace(/\/+$/, '');
};

const allowedOrigins = Array.from(new Set([
  'https://uni-hostel-two.vercel.app',
  'http://localhost:3000',
  'http://localhost:5000',
  'http://localhost:5173',
  ...parseEnvList(process.env.CORS_ALLOWED_ORIGINS),
  process.env.FRONTEND_URL
].map(normalizeOrigin).filter(Boolean)));

const corsOptions = {
  origin(origin, callback) {
    const normalizedOrigin = normalizeOrigin(origin);

    // Allow requests without an Origin header for non-browser clients and verified webhooks.
    if (!normalizedOrigin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(normalizedOrigin) || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(normalizedOrigin)) {
      return callback(null, true);
    }

    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token']
};

module.exports = {
  corsOptions,
  allowedOrigins,
  normalizeOrigin
};
