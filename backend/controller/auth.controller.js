const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const logger = require('../config/logger');
const {
  GENERIC_LOGIN_FAILURE_MESSAGE,
  PRIVILEGED_MFA_DELIVERY_FAILURE_MESSAGE,
  PASSWORD_RESET_CODE_EXPIRY_MINUTES,
  PASSWORD_RESET_CODE_MAX_ATTEMPTS
} = require('../config/env');
const {
  DUMMY_PASSWORD_HASH,
  generatePasswordResetCode,
  hashResetToken
} = require('../utils/helpers');
const { setAuthCookie, clearAuthCookie } = require('../utils/authCookies');
const { generateCsrfToken } = require('../middleware/csrf');
const { sendServerError } = require('../utils/serverError');
const {
  sendPrivilegedMfaCodeEmail,
  sendPasswordResetCodeEmail
} = require('../utils/emailService');
const {
  clearPrivilegedMfaChallenge,
  clonePrivilegedMfaState,
  createPrivilegedMfaChallenge,
  getPrivilegedMfaCodeExpiryMinutes,
  getPrivilegedMfaResendCooldownSeconds,
  hashPrivilegedMfaChallengeToken,
  hasPrivilegedMfaChallenge,
  isPrivilegedMfaChallengeExpired,
  maskEmailAddress,
  normalizeChallengeToken,
  requiresPrivilegedMfa,
  verifyPrivilegedMfaCode
} = require('../utils/mfa');
const {
  getTurnstileRemoteIp,
  isTurnstileEnabled,
  verifyTurnstileToken
} = require('../utils/turnstile');

const TURNSTILE_ROUTE_MESSAGES = {
  forgot_password: 'Please complete the security check before requesting a reset code.',
  login: 'Please complete the security check before signing in.',
  register: 'Please complete the security check before creating an account.'
};

// The browser returns a Google ID token.  Verify it server-side before using
// any profile data from it. The allowed audience is supplied at verification
// time from GOOGLE_CLIENT_ID so deployments can configure it through env vars.
const googleOAuthClient = new OAuth2Client();

const verifyTurnstileForRequest = async (req, res, expectedAction) => {
  if (!isTurnstileEnabled()) {
    return true;
  }

  const result = await verifyTurnstileToken({
    token: req.body?.turnstileToken,
    remoteIp: getTurnstileRemoteIp(req),
    expectedAction
  });

  if (result.success) {
    return true;
  }

  if (result.configError) {
    logger.error('Turnstile is enabled but not configured correctly');
    res.status(503).json({ message: result.message });
    return false;
  }

  if (result.errorCodes || result.action || result.hostname) {
    logger.warn('Turnstile verification rejected request', {
      action: expectedAction,
      errorCodes: result.errorCodes,
      verifiedAction: result.action,
      verifiedHostname: result.hostname
    });
  }

  res.status(400).json({
    message: TURNSTILE_ROUTE_MESSAGES[expectedAction] || result.message
  });
  return false;
};

const deliverPasswordResetCode = async (email, name, resetCode) => {
  try {
    await sendPasswordResetCodeEmail(email, name, resetCode, PASSWORD_RESET_CODE_EXPIRY_MINUTES);
    logger.info(`Password reset code requested for: ${email}`);
  } catch (error) {
    logger.error('Password reset code delivery failed', {
      email,
      error: error.message
    });
  }
};

const clearPasswordResetCode = (user) => {
  if (!user) return;
  user.passwordResetCode = undefined;
};

const createPasswordResetCodeState = async () => {
  const code = generatePasswordResetCode();
  return {
    code,
    state: {
      codeHash: await bcrypt.hash(code, 12),
      expiresAt: new Date(Date.now() + PASSWORD_RESET_CODE_EXPIRY_MINUTES * 60000),
      failedAttempts: 0,
      lastSentAt: new Date()
    }
  };
};

const verifyPasswordResetCodeState = async (user, code) => {
  if (!user?.passwordResetCode?.codeHash || !user?.passwordResetCode?.expiresAt) {
    return { success: false, status: 400, message: 'Invalid or expired reset code' };
  }

  if (new Date(user.passwordResetCode.expiresAt).getTime() <= Date.now()) {
    clearPasswordResetCode(user);
    return { success: false, status: 400, message: 'Invalid or expired reset code' };
  }

  const normalizedCode = String(code || '').trim();
  const isMatch = /^\d{6}$/.test(normalizedCode)
    ? await bcrypt.compare(normalizedCode, user.passwordResetCode.codeHash)
    : false;

  if (isMatch) {
    clearPasswordResetCode(user);
    return { success: true };
  }

  user.passwordResetCode.failedAttempts = (user.passwordResetCode.failedAttempts || 0) + 1;

  if (user.passwordResetCode.failedAttempts >= PASSWORD_RESET_CODE_MAX_ATTEMPTS) {
    clearPasswordResetCode(user);
    return {
      success: false,
      status: 429,
      message: 'Too many incorrect reset codes. Please request a new code.'
    };
  }

  return { success: false, status: 400, message: 'Invalid or expired reset code' };
};

const createAuthToken = (user) => jwt.sign(
  {
    id: user._id ? user._id.toString() : user.id,
    role: user.role,
    iat: Math.floor(Date.now() / 1000)
  },
  process.env.JWT_SECRET,
  { expiresIn: '30d', algorithm: 'HS256' }
);

const serializeAuthenticatedUser = (user) => ({
  id: user._id ? user._id.toString() : user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  isVerified: user.isVerified,
  accountStatus: user.accountStatus
});

const recordSuccessfulLogin = async (user, req) => {
  clearPrivilegedMfaChallenge(user);
  user.lastLogin = new Date();
  user.loginHistory.push({
    timestamp: new Date(),
    ipAddress: req.ip || req.connection?.remoteAddress,
    userAgent: req.headers['user-agent']
  });

  if (user.loginHistory.length > 10) {
    user.loginHistory = user.loginHistory.slice(-10);
  }

  await user.save();
};

const completeAuthenticatedLogin = async (user, req, res) => {
  await recordSuccessfulLogin(user, req);

  const token = createAuthToken(user);
  const csrfToken = generateCsrfToken(user._id.toString());
  setAuthCookie(res, token);

  return {
    token,
    csrfToken,
    user: serializeAuthenticatedUser(user),
    passwordResetRequired: user.passwordResetRequired
  };
};

const persistPrivilegedMfaChallenge = async (user, { challengeToken } = {}) => {
  const previousState = clonePrivilegedMfaState(user);
  const challenge = await createPrivilegedMfaChallenge({ challengeToken });

  user.privilegedMfa = challenge.state;
  await user.save();

  try {
    await sendPrivilegedMfaCodeEmail(
      user.email,
      user.name,
      challenge.code,
      getPrivilegedMfaCodeExpiryMinutes()
    );
  } catch (error) {
    if (previousState) {
      user.privilegedMfa = previousState;
    } else {
      clearPrivilegedMfaChallenge(user);
    }

    await user.save();
    throw error;
  }

  return challenge;
};

const createPrivilegedMfaResponse = (user, challengeToken) => ({
  mfaRequired: true,
  challengeToken,
  pendingRole: user.role,
  maskedEmail: maskEmailAddress(user.email),
  expiresInMinutes: getPrivilegedMfaCodeExpiryMinutes(),
  message: 'A security code has been sent to your email.'
});

const findUserByPrivilegedMfaChallengeToken = async (challengeToken) => {
  const normalizedChallengeToken = normalizeChallengeToken(challengeToken);

  if (!/^[a-f0-9]{64}$/i.test(normalizedChallengeToken)) {
    return null;
  }

  return User.findOne({
    'privilegedMfa.challengeTokenHash': hashPrivilegedMfaChallengeToken(normalizedChallengeToken)
  });
};

// --- CONTROLLER HANDLERS ---

const register = async (req, res) => {
  try {
    const { name, email, password, role, tosAccepted, privacyPolicyAccepted } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    if (!tosAccepted || !privacyPolicyAccepted) {
      return res.status(400).json({ message: 'You must accept the Terms of Service and Privacy Policy to register' });
    }
    
    if (role && role !== 'student') {
      return res.status(403).json({ message: 'Only student registration is allowed. Managers must be registered by administrators.' });
    }

    if (!await verifyTurnstileForRequest(req, res, 'register')) {
      return;
    }
    
    const normalizedEmail = email.toLowerCase().trim();
    const normalizedName = name.trim();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = new User({ 
      name: normalizedName, 
      email: normalizedEmail, 
      password: hashedPassword, 
      role: 'student',
      isVerified: true,
      accountStatus: 'active',
      tosAccepted: true,
      tosAcceptedAt: new Date(),
      privacyPolicyAccepted: true,
      privacyPolicyAcceptedAt: new Date()
    });
    await newUser.save();

    logger.info(`New student registered: ${newUser._id}`);

    res.status(201).json({
      email: newUser.email,
      message: 'Registration successful. You can now sign in.'
    });
  } catch (err) {
    return sendServerError(res, err, {
      field: 'message',
      clientMessage: 'Registration failed',
      logMessage: 'Registration error'
    });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }
    
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    user.accountStatus = 'active';
    await user.save();
    
    logger.info(`User verified: ${user.email}`);
    res.json({ message: 'Email verified successfully! You can now login.' });
  } catch (err) {
    logger.error('Email verification error:', err);
    res.status(500).json({ message: 'Verification failed' });
  }
};

const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    res.json({
      message: 'Email verification is not required. You can sign in once your account is created.',
      email: email.toLowerCase().trim()
    });
  } catch (err) {
    logger.error('Resend verification error:', err);
    res.status(500).json({ message: 'Unable to resend verification email right now.' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    if (!await verifyTurnstileForRequest(req, res, 'login')) {
      return;
    }
    
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      await bcrypt.compare(password, DUMMY_PASSWORD_HASH);
      return res.status(400).json({ message: GENERIC_LOGIN_FAILURE_MESSAGE });
    }

    if (user.accountLockedUntil && user.accountLockedUntil > new Date()) {
      logger.warn(`Blocked login attempt for locked account: ${user.email}`);
      return res.status(400).json({ message: GENERIC_LOGIN_FAILURE_MESSAGE });
    }

    if (user.accountLockedUntil && user.accountLockedUntil <= new Date()) {
      user.failedLoginAttempts = 0;
      user.accountLockedUntil = null;
      await user.save();
    }

    if (user.accountStatus === 'suspended') {
      logger.warn(`Blocked login attempt for suspended account: ${user.email}`);
      return res.status(400).json({ message: GENERIC_LOGIN_FAILURE_MESSAGE });
    }
    if (user.accountStatus === 'banned') {
      logger.warn(`Blocked login attempt for banned account: ${user.email}`);
      return res.status(400).json({ message: GENERIC_LOGIN_FAILURE_MESSAGE });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      user.lastFailedLogin = new Date();
      
      const maxAttempts = parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5;
      const lockoutDuration = parseInt(process.env.LOCKOUT_DURATION_MINUTES) || 30;
      
      if (user.failedLoginAttempts >= maxAttempts) {
        user.accountLockedUntil = new Date(Date.now() + lockoutDuration * 60000);
        await user.save();
        
        logger.warn(`Account locked for user: ${user.email} after ${maxAttempts} failed attempts`);
        return res.status(400).json({ message: GENERIC_LOGIN_FAILURE_MESSAGE });
      }
      
      await user.save();
      return res.status(400).json({ message: GENERIC_LOGIN_FAILURE_MESSAGE });
    }

    if (user.role === 'student' && !user.isVerified) {
      user.isVerified = true;
      user.accountStatus = 'active';
      user.verificationToken = undefined;
      user.verificationTokenExpires = undefined;
      logger.info(`Auto-activated student account during login: ${user.email}`);
    }

    user.failedLoginAttempts = 0;
    user.accountLockedUntil = null;
    user.lastFailedLogin = null;

    if (requiresPrivilegedMfa(user)) {
      try {
        const challenge = await persistPrivilegedMfaChallenge(user);
        logger.info(`Privileged MFA challenge created for user: ${user.email}`);
        return res.json(createPrivilegedMfaResponse(user, challenge.challengeToken));
      } catch (mfaError) {
        logger.error('Privileged MFA delivery error:', mfaError);
        return res.status(503).json({ message: PRIVILEGED_MFA_DELIVERY_FAILURE_MESSAGE });
      }
    }

    const authenticatedResponse = await completeAuthenticatedLogin(user, req, res);
    logger.info(`Successful login for user: ${user.email}`);
    res.json(authenticatedResponse);
  } catch (err) {
    logger.error('Login error:', err);
    res.status(500).json({ message: 'Unable to sign in right now. Please try again later.' });
  }
};

const googleAuth = async (req, res) => {
  try {
    const { credential, role = 'student' } = req.body;
    if (!credential) {
      return res.status(400).json({ message: 'Google credential is required' });
    }

    let payload;
    const configuredClientId = (process.env.GOOGLE_CLIENT_ID || '').trim();

    try {
      if (configuredClientId) {
        const ticket = await googleOAuthClient.verifyIdToken({
          idToken: credential,
          audience: configuredClientId,
        });
        payload = ticket.getPayload();
      } else {
        const ticket = await googleOAuthClient.verifyIdToken({
          idToken: credential,
        });
        payload = ticket.getPayload();
      }
    } catch (verifyErr) {
      logger.error('Google token verification failed:', verifyErr.message);
      return res.status(400).json({ message: 'Invalid or expired Google credential. Please try again.' });
    }

    if (!payload || !payload.email) {
      return res.status(400).json({ message: 'Unable to extract email from Google credential' });
    }

    const email = payload.email.toLowerCase().trim();
    const name = payload.name || payload.given_name || email.split('@')[0];
    const picture = payload.picture || '';
    const googleId = payload.sub;

    let user = await User.findOne({ email });

    if (!user) {
      const assignedRole = role === 'manager' ? 'student' : (role || 'student');

      user = new User({
        name,
        email,
        googleId,
        authProvider: 'google',
        profilePicture: picture,
        role: assignedRole,
        isVerified: true,
        accountStatus: 'active',
        tosAccepted: true,
        tosAcceptedAt: new Date(),
        privacyPolicyAccepted: true,
        privacyPolicyAcceptedAt: new Date()
      });
      await user.save();
      logger.info(`New user registered via Google Auth: ${user._id} (${user.email})`);
    } else {
      let needsSave = false;
      if (!user.googleId) {
        user.googleId = googleId;
        needsSave = true;
      }
      if (picture && !user.profilePicture) {
        user.profilePicture = picture;
        needsSave = true;
      }
      if (!user.isVerified && user.role === 'student') {
        user.isVerified = true;
        needsSave = true;
      }
      if (user.accountStatus === 'pending_verification' && user.role === 'student') {
        user.accountStatus = 'active';
        needsSave = true;
      }
      if (needsSave) {
        await user.save();
      }
    }

    if (user.accountStatus === 'suspended' || user.accountStatus === 'banned') {
      logger.warn(`Blocked Google login attempt for ${user.accountStatus} account: ${user.email}`);
      return res.status(403).json({ message: `Your account has been ${user.accountStatus}. Please contact support.` });
    }

    if (requiresPrivilegedMfa(user)) {
      try {
        const challenge = await persistPrivilegedMfaChallenge(user);
        logger.info(`Privileged MFA challenge created for Google user: ${user.email}`);
        return res.json(createPrivilegedMfaResponse(user, challenge.challengeToken));
      } catch (mfaError) {
        logger.error('Privileged MFA delivery error:', mfaError);
        return res.status(503).json({ message: PRIVILEGED_MFA_DELIVERY_FAILURE_MESSAGE });
      }
    }

    const authenticatedResponse = await completeAuthenticatedLogin(user, req, res);
    logger.info(`Successful Google Auth login for user: ${user.email}`);
    res.json(authenticatedResponse);
  } catch (err) {
    logger.error('Google auth error:', err);
    return sendServerError(res, err, {
      field: 'message',
      clientMessage: 'Google authentication failed',
      logMessage: 'Google Auth error'
    });
  }
};

const session = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('name email role isVerified accountStatus');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const refreshedToken = createAuthToken(user);
    setAuthCookie(res, refreshedToken);

    res.json({
      user: serializeAuthenticatedUser(user),
      csrfToken: generateCsrfToken(user._id.toString())
    });
  } catch (err) {
    logger.error('Session restore error:', err);
    res.status(500).json({ message: 'Failed to restore session' });
  }
};

const verifyMfa = async (req, res) => {
  try {
    const { challengeToken, code } = req.body;

    if (!challengeToken || !code) {
      return res.status(400).json({ message: 'Security code and challenge token are required.' });
    }

    const user = await findUserByPrivilegedMfaChallengeToken(challengeToken);
    if (!user || !requiresPrivilegedMfa(user) || !hasPrivilegedMfaChallenge(user)) {
      return res.status(400).json({
        message: 'Security verification expired. Please sign in again.',
        resetLogin: true
      });
    }

    const verificationResult = await verifyPrivilegedMfaCode(user, code);

    if (!verificationResult.success) {
      await user.save();
      return res.status(verificationResult.status || 400).json({
        message: verificationResult.message,
        resetLogin: verificationResult.resetLogin || false
      });
    }

    const authenticatedResponse = await completeAuthenticatedLogin(user, req, res);
    logger.info(`Privileged MFA verified for user: ${user.email}`);
    return res.json(authenticatedResponse);
  } catch (err) {
    logger.error('Privileged MFA verification error:', err);
    return res.status(500).json({ message: 'Unable to verify the security code right now. Please try again later.' });
  }
};

const resendMfa = async (req, res) => {
  try {
    const { challengeToken } = req.body;

    if (!challengeToken) {
      return res.status(400).json({ message: 'Challenge token is required.' });
    }

    const user = await findUserByPrivilegedMfaChallengeToken(challengeToken);
    if (!user || !requiresPrivilegedMfa(user) || !hasPrivilegedMfaChallenge(user)) {
      return res.status(400).json({
        message: 'Security verification expired. Please sign in again.',
        resetLogin: true
      });
    }

    if (isPrivilegedMfaChallengeExpired(user)) {
      clearPrivilegedMfaChallenge(user);
      await user.save();
      return res.status(400).json({
        message: 'Security code expired. Please sign in again.',
        resetLogin: true
      });
    }

    const resendCooldownSeconds = getPrivilegedMfaResendCooldownSeconds();
    const lastSentAt = user.privilegedMfa?.lastSentAt ? new Date(user.privilegedMfa.lastSentAt).getTime() : 0;
    const secondsSinceLastSent = lastSentAt ? Math.floor((Date.now() - lastSentAt) / 1000) : resendCooldownSeconds;

    if (secondsSinceLastSent < resendCooldownSeconds) {
      return res.status(429).json({
        message: `Please wait ${resendCooldownSeconds - secondsSinceLastSent} seconds before requesting a new code.`
      });
    }

    try {
      await persistPrivilegedMfaChallenge(user, { challengeToken });
      logger.info(`Privileged MFA challenge resent for user: ${user.email}`);
      return res.json({
        message: 'A new security code has been sent to your email.',
        maskedEmail: maskEmailAddress(user.email),
        expiresInMinutes: getPrivilegedMfaCodeExpiryMinutes()
      });
    } catch (mfaError) {
      logger.error('Privileged MFA resend error:', mfaError);
      return res.status(503).json({ message: PRIVILEGED_MFA_DELIVERY_FAILURE_MESSAGE });
    }
  } catch (err) {
    logger.error('Privileged MFA resend error:', err);
    return res.status(500).json({ message: 'Unable to resend the security code right now. Please try again later.' });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    if (!await verifyTurnstileForRequest(req, res, 'forgot_password')) {
      return;
    }
    
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      logger.info('Password reset requested for unknown email', {
        email: maskEmailAddress(normalizedEmail)
      });
      return res.json({ message: 'If an account exists, a password reset code has been sent to your email.' });
    }

    const resetChallenge = await createPasswordResetCodeState();
    user.passwordResetCode = resetChallenge.state;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    if (process.env.NODE_ENV === 'test') {
      await deliverPasswordResetCode(user.email, user.name, resetChallenge.code);
    } else {
      setImmediate(() => {
        void deliverPasswordResetCode(user.email, user.name, resetChallenge.code);
      });
    }

    res.json({ message: 'If an account exists, a password reset code has been sent to your email.' });
  } catch (err) {
    logger.error('Forgot password error:', err);
    res.status(500).json({ message: 'Failed to process request' });
  }
};

const resetPasswordCode = async (req, res) => {
  try {
    const { email, code, password } = req.body;

    if (!email || !code || !password) {
      return res.status(400).json({ message: 'Email, reset code, and new password are required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset code' });
    }

    const verificationResult = await verifyPasswordResetCodeState(user, code);
    if (!verificationResult.success) {
      await user.save();
      return res.status(verificationResult.status || 400).json({ message: verificationResult.message });
    }

    user.password = await bcrypt.hash(password, 12);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.passwordResetRequired = false;
    user.temporaryPassword = undefined;
    clearPrivilegedMfaChallenge(user);
    await user.save();

    logger.info(`Password reset successful for user: ${user.email}`);
    res.json({ message: 'Password reset successful. You can now login with your new password.' });
  } catch (err) {
    logger.error('Reset password with code error:', err);
    res.status(500).json({ message: 'Failed to reset password' });
  }
};

const resetPasswordCurrent = async (req, res) => {
  try {
    const { email, currentPassword, password } = req.body;

    if (!email || !currentPassword || !password) {
      return res.status(400).json({ message: 'Email, current password, and new password are required' });
    }

    if (!await verifyTurnstileForRequest(req, res, 'forgot_password')) {
      return;
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      await bcrypt.compare(currentPassword, DUMMY_PASSWORD_HASH);
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    user.password = await bcrypt.hash(password, 12);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    clearPasswordResetCode(user);
    user.passwordResetRequired = false;
    user.temporaryPassword = undefined;
    clearPrivilegedMfaChallenge(user);
    await user.save();

    logger.info(`Password reset with current password successful for user: ${user.email}`);
    return res.json({ message: 'Password reset successful. You can now login with your new password.' });
  } catch (err) {
    logger.error('Reset password with current password error:', err);
    return res.status(500).json({ message: 'Failed to reset password' });
  }
};

const resetPasswordToken = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    
    if (!password || password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }
    
    if (!token || !/^[a-f0-9]{64}$/i.test(token)) {
      return res.status(400).json({ message: 'Invalid reset token' });
    }

    const hashedResetToken = hashResetToken(token);
    
    const user = await User.findOne({
      resetPasswordToken: hashedResetToken,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }
    
    user.password = await bcrypt.hash(password, 12);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    clearPasswordResetCode(user);
    user.passwordResetRequired = false;
    user.temporaryPassword = undefined;
    clearPrivilegedMfaChallenge(user);
    await user.save();
    
    logger.info(`Password reset successful for user: ${user.email}`);
    res.json({ message: 'Password reset successful. You can now login with your new password.' });
  } catch (err) {
    logger.error('Reset password error:', err);
    res.status(500).json({ message: 'Failed to reset password' });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new password are required' });
    }
    
    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'New password must be at least 8 characters' });
    }
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    
    user.password = await bcrypt.hash(newPassword, 12);
    clearPrivilegedMfaChallenge(user);
    await user.save();
    
    logger.info(`Password changed for user: ${user.email}`);
    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    logger.error('Change password error:', err);
    res.status(500).json({ message: 'Failed to change password' });
  }
};

const setSecurityQuestion = async (req, res) => {
  try {
    const { securityQuestion, securityAnswer } = req.body;
    
    if (!securityQuestion || !securityAnswer) {
      return res.status(400).json({ message: 'Security question and answer are required' });
    }
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.securityQuestion = securityQuestion;
    user.securityAnswer = await bcrypt.hash(securityAnswer.toLowerCase().trim(), 12);
    await user.save();
    
    logger.info(`Security question set for user: ${user.email}`);
    res.json({ message: 'Security question set successfully' });
  } catch (err) {
    logger.error('Set security question error:', err);
    res.status(500).json({ message: 'Failed to set security question' });
  }
};

const legacyResetNotice = async (req, res) => {
  res.status(410).json({
    message: 'This password reset method is no longer available. Use Forgot Password to receive a reset link.'
  });
};

const logout = async (req, res) => {
  try {
    clearAuthCookie(res);
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to logout' });
  }
};

module.exports = {
  register,
  verifyEmail,
  resendVerification,
  login,
  googleAuth,
  session,
  logout,
  verifyMfa,
  resendMfa,
  forgotPassword,
  resetPasswordCode,
  resetPasswordCurrent,
  resetPasswordToken,
  changePassword,
  setSecurityQuestion,
  legacyResetNotice
};
