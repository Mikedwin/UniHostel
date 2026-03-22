const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const TURNSTILE_USER_MESSAGE = 'Please complete the security check and try again.';
const TURNSTILE_FAILURE_MESSAGE = 'Security verification failed. Please refresh and try again.';
const TURNSTILE_CONFIG_MESSAGE = 'Security verification is temporarily unavailable. Please try again later.';

const isTurnstileEnabled = () => process.env.TURNSTILE_ENABLED === 'true';

const getTurnstileSecretKey = () => (process.env.TURNSTILE_SECRET_KEY || '').trim();

const getExpectedTurnstileHostname = () => {
  const explicitHostname = (process.env.TURNSTILE_EXPECTED_HOSTNAME || '').trim().toLowerCase();
  if (explicitHostname) {
    return explicitHostname;
  }

  if (process.env.NODE_ENV !== 'production') {
    return '';
  }

  try {
    return new URL(process.env.FRONTEND_URL || '').hostname.toLowerCase();
  } catch (error) {
    return '';
  }
};

const getTurnstileRemoteIp = (req) => {
  const cfConnectingIp = req.headers['cf-connecting-ip'];
  if (typeof cfConnectingIp === 'string' && cfConnectingIp.trim()) {
    return cfConnectingIp.trim();
  }

  const forwardedFor = req.headers['x-forwarded-for'];
  if (typeof forwardedFor === 'string' && forwardedFor.trim()) {
    return forwardedFor.split(',')[0].trim();
  }

  return req.ip || req.connection?.remoteAddress || '';
};

const verifyTurnstileToken = async ({
  token,
  remoteIp,
  expectedAction
} = {}) => {
  if (!isTurnstileEnabled()) {
    return {
      success: true,
      skipped: true
    };
  }

  const secretKey = getTurnstileSecretKey();
  if (!secretKey) {
    return {
      success: false,
      configError: true,
      message: TURNSTILE_CONFIG_MESSAGE
    };
  }

  if (typeof token !== 'string' || !token.trim()) {
    return {
      success: false,
      message: TURNSTILE_USER_MESSAGE
    };
  }

  if (typeof fetch !== 'function') {
    throw new Error('Fetch API is unavailable for Turnstile verification');
  }

  const payload = new URLSearchParams({
    secret: secretKey,
    response: token.trim()
  });

  if (remoteIp) {
    payload.set('remoteip', remoteIp);
  }

  const response = await fetch(TURNSTILE_VERIFY_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: payload.toString()
  });

  if (!response.ok) {
    throw new Error(`Turnstile verification failed with status ${response.status}`);
  }

  const verification = await response.json();
  if (!verification.success) {
    return {
      success: false,
      message: TURNSTILE_USER_MESSAGE,
      errorCodes: verification['error-codes'] || []
    };
  }

  if (expectedAction && verification.action !== expectedAction) {
    return {
      success: false,
      message: TURNSTILE_FAILURE_MESSAGE,
      action: verification.action
    };
  }

  const expectedHostname = getExpectedTurnstileHostname();
  if (expectedHostname && verification.hostname?.toLowerCase() !== expectedHostname) {
    return {
      success: false,
      message: TURNSTILE_FAILURE_MESSAGE,
      hostname: verification.hostname
    };
  }

  return {
    success: true,
    data: verification
  };
};

module.exports = {
  TURNSTILE_CONFIG_MESSAGE,
  TURNSTILE_FAILURE_MESSAGE,
  TURNSTILE_USER_MESSAGE,
  getExpectedTurnstileHostname,
  getTurnstileRemoteIp,
  getTurnstileSecretKey,
  isTurnstileEnabled,
  verifyTurnstileToken
};
