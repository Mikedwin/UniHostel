const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const PRIVILEGED_MFA_ROLES = new Set(['manager', 'admin']);

const parsePositiveInt = (value, fallback) => {
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const getPrivilegedMfaCodeExpiryMinutes = () => parsePositiveInt(process.env.PRIVILEGED_MFA_CODE_EXPIRY_MINUTES, 10);
const getPrivilegedMfaMaxAttempts = () => parsePositiveInt(process.env.PRIVILEGED_MFA_MAX_ATTEMPTS, 5);
const getPrivilegedMfaResendCooldownSeconds = () => parsePositiveInt(process.env.PRIVILEGED_MFA_RESEND_COOLDOWN_SECONDS, 60);

const isPrivilegedMfaEnabled = () => process.env.PRIVILEGED_MFA_ENABLED !== 'false';

const requiresPrivilegedMfa = (user) => (
  isPrivilegedMfaEnabled() && PRIVILEGED_MFA_ROLES.has(user?.role)
);

const normalizeChallengeToken = (value) => String(value || '').trim().toLowerCase();

const hashPrivilegedMfaChallengeToken = (token) => (
  crypto.createHash('sha256').update(normalizeChallengeToken(token)).digest('hex')
);

const generatePrivilegedMfaCode = () => (
  String(crypto.randomInt(0, 1000000)).padStart(6, '0')
);

const maskEmailAddress = (email) => {
  const [localPart = '', domainPart = ''] = String(email || '').split('@');

  if (!localPart || !domainPart) {
    return '';
  }

  const maskedLocalPart = localPart.length <= 2
    ? `${localPart[0] || '*'}*`
    : `${localPart.slice(0, 2)}${'*'.repeat(Math.max(1, localPart.length - 2))}`;

  const domainSections = domainPart.split('.');
  const domainName = domainSections.shift() || '';
  const topLevelDomain = domainSections.join('.');
  const maskedDomainName = domainName.length <= 2
    ? `${domainName[0] || '*'}*`
    : `${domainName[0]}${'*'.repeat(Math.max(1, domainName.length - 2))}${domainName.slice(-1)}`;

  return `${maskedLocalPart}@${maskedDomainName}${topLevelDomain ? `.${topLevelDomain}` : ''}`;
};

const clonePrivilegedMfaState = (user) => {
  const currentState = user?.privilegedMfa;
  if (!currentState?.challengeTokenHash) {
    return undefined;
  }

  return {
    challengeTokenHash: currentState.challengeTokenHash,
    codeHash: currentState.codeHash,
    expiresAt: currentState.expiresAt,
    failedAttempts: currentState.failedAttempts || 0,
    lastSentAt: currentState.lastSentAt
  };
};

const clearPrivilegedMfaChallenge = (user) => {
  if (!user) {
    return;
  }

  user.privilegedMfa = undefined;
};

const hasPrivilegedMfaChallenge = (user) => Boolean(
  user?.privilegedMfa?.challengeTokenHash
  && user?.privilegedMfa?.codeHash
  && user?.privilegedMfa?.expiresAt
);

const isPrivilegedMfaChallengeExpired = (user) => {
  if (!hasPrivilegedMfaChallenge(user)) {
    return true;
  }

  return new Date(user.privilegedMfa.expiresAt).getTime() <= Date.now();
};

const createPrivilegedMfaChallenge = async ({ challengeToken } = {}) => {
  const rawChallengeToken = challengeToken
    ? normalizeChallengeToken(challengeToken)
    : crypto.randomBytes(32).toString('hex');
  const code = generatePrivilegedMfaCode();

  return {
    challengeToken: rawChallengeToken,
    code,
    state: {
      challengeTokenHash: hashPrivilegedMfaChallengeToken(rawChallengeToken),
      codeHash: await bcrypt.hash(code, 12),
      expiresAt: new Date(Date.now() + getPrivilegedMfaCodeExpiryMinutes() * 60000),
      failedAttempts: 0,
      lastSentAt: new Date()
    }
  };
};

const verifyPrivilegedMfaCode = async (user, code) => {
  if (!hasPrivilegedMfaChallenge(user)) {
    return {
      success: false,
      resetLogin: true,
      message: 'Security verification expired. Please sign in again.'
    };
  }

  if (isPrivilegedMfaChallengeExpired(user)) {
    clearPrivilegedMfaChallenge(user);
    return {
      success: false,
      resetLogin: true,
      message: 'Security code expired. Please sign in again.'
    };
  }

  const normalizedCode = String(code || '').trim();
  const isMatch = /^\d{6}$/.test(normalizedCode)
    ? await bcrypt.compare(normalizedCode, user.privilegedMfa.codeHash)
    : false;

  if (isMatch) {
    clearPrivilegedMfaChallenge(user);
    return { success: true };
  }

  const maxAttempts = getPrivilegedMfaMaxAttempts();
  user.privilegedMfa.failedAttempts = (user.privilegedMfa.failedAttempts || 0) + 1;

  if (user.privilegedMfa.failedAttempts >= maxAttempts) {
    clearPrivilegedMfaChallenge(user);
    return {
      success: false,
      resetLogin: true,
      status: 429,
      message: 'Too many incorrect security codes. Please sign in again.'
    };
  }

  return {
    success: false,
    status: 400,
    message: 'Invalid security code. Please try again.'
  };
};

module.exports = {
  clearPrivilegedMfaChallenge,
  clonePrivilegedMfaState,
  createPrivilegedMfaChallenge,
  getPrivilegedMfaCodeExpiryMinutes,
  getPrivilegedMfaMaxAttempts,
  getPrivilegedMfaResendCooldownSeconds,
  hashPrivilegedMfaChallengeToken,
  hasPrivilegedMfaChallenge,
  isPrivilegedMfaChallengeExpired,
  isPrivilegedMfaEnabled,
  maskEmailAddress,
  normalizeChallengeToken,
  requiresPrivilegedMfa,
  verifyPrivilegedMfaCode
};
