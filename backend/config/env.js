const parseEnvInt = (value, fallback) => {
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const parseEnvList = (value) => (
  String(value || '')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
);

const validateRuntimeEnv = ({ requireDatabase = true } = {}) => {
  const requiredEnvVars = ['JWT_SECRET'];

  if (requireDatabase) {
    requiredEnvVars.push('MONGO_URI');
  }

  if (process.env.NODE_ENV === 'production') {
    requiredEnvVars.push(
      'FRONTEND_URL',
      'PAYSTACK_SECRET_KEY',
      'TOTP_ENCRYPTION_KEY'
    );

    if (process.env.TURNSTILE_ENABLED === 'true') {
      requiredEnvVars.push('TURNSTILE_SECRET_KEY');
    }
  }

  const missingEnvVars = requiredEnvVars.filter((varName) => !process.env[varName]);
  if (missingEnvVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  }

  if (process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long');
  }
};

const shouldExposeApiDocs = () => (
  process.env.NODE_ENV !== 'production' || process.env.ENABLE_API_DOCS_IN_PRODUCTION === 'true'
);

module.exports = {
  parseEnvInt,
  parseEnvList,
  validateRuntimeEnv,
  shouldExposeApiDocs,
  VERIFICATION_TOKEN_EXPIRY_HOURS: parseEnvInt(process.env.VERIFICATION_TOKEN_EXPIRY_HOURS, 24),
  GENERIC_LOGIN_FAILURE_MESSAGE: 'Invalid email or password',
  PRIVILEGED_MFA_DELIVERY_FAILURE_MESSAGE: 'Unable to deliver the security code right now. Please try again later.',
  PASSWORD_RESET_CODE_EXPIRY_MINUTES: parseEnvInt(process.env.PASSWORD_RESET_CODE_EXPIRY_MINUTES, 10),
  PASSWORD_RESET_CODE_MAX_ATTEMPTS: parseEnvInt(process.env.PASSWORD_RESET_CODE_MAX_ATTEMPTS, 5),
  TRUST_PROXY_HOPS: parseEnvInt(process.env.TRUST_PROXY_HOPS, 1),
  VISITOR_TRACKING_ENABLED: process.env.VISITOR_TRACKING_ENABLED === 'true'
};
