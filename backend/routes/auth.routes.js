const express = require('express');
const router = express.Router();
const authController = require('../controller/auth.controller');
const { auth } = require('../middleware/auth');
const { authLimiter, registerLimiter } = require('../config/security');
const rateLimit = require('express-rate-limit');
const { parseEnvInt } = require('../config/env');

const FORGOT_PASSWORD_RATE_LIMIT_WINDOW_MS = parseEnvInt(process.env.FORGOT_PASSWORD_RATE_LIMIT_WINDOW_MS, 60 * 60 * 1000);
const FORGOT_PASSWORD_RATE_LIMIT_MAX = parseEnvInt(process.env.FORGOT_PASSWORD_RATE_LIMIT_MAX, 3);
const RESET_PASSWORD_RATE_LIMIT_WINDOW_MS = parseEnvInt(process.env.RESET_PASSWORD_RATE_LIMIT_WINDOW_MS, 60 * 60 * 1000);
const RESET_PASSWORD_RATE_LIMIT_MAX = parseEnvInt(process.env.RESET_PASSWORD_RATE_LIMIT_MAX, 5);
const VERIFICATION_EMAIL_RATE_LIMIT_WINDOW_MS = parseEnvInt(process.env.VERIFICATION_EMAIL_RATE_LIMIT_WINDOW_MS, 60 * 60 * 1000);
const VERIFICATION_EMAIL_RATE_LIMIT_MAX = parseEnvInt(process.env.VERIFICATION_EMAIL_RATE_LIMIT_MAX, 3);
const AUTH_RATE_LIMIT_WINDOW_MS = parseEnvInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000);

const forgotPasswordLimiter = rateLimit({
  windowMs: FORGOT_PASSWORD_RATE_LIMIT_WINDOW_MS,
  max: FORGOT_PASSWORD_RATE_LIMIT_MAX,
  message: 'Too many password reset requests. Please try again later.',
});

const resetPasswordLimiter = rateLimit({
  windowMs: RESET_PASSWORD_RATE_LIMIT_WINDOW_MS,
  max: RESET_PASSWORD_RATE_LIMIT_MAX,
  message: 'Too many password reset attempts. Please request a new reset code or try again later.',
  skipSuccessfulRequests: true,
});

const verificationEmailLimiter = rateLimit({
  windowMs: VERIFICATION_EMAIL_RATE_LIMIT_WINDOW_MS,
  max: VERIFICATION_EMAIL_RATE_LIMIT_MAX,
  message: 'Too many verification email requests. Please try again later.',
});

const privilegedMfaVerifyLimiter = rateLimit({
  windowMs: AUTH_RATE_LIMIT_WINDOW_MS,
  max: parseEnvInt(process.env.PRIVILEGED_MFA_VERIFY_RATE_LIMIT_MAX, 10),
  message: 'Too many security code attempts. Please sign in again later.',
  skipSuccessfulRequests: true,
});

const privilegedMfaResendLimiter = rateLimit({
  windowMs: AUTH_RATE_LIMIT_WINDOW_MS,
  max: parseEnvInt(process.env.PRIVILEGED_MFA_RESEND_RATE_LIMIT_MAX, 5),
  message: 'Too many security code requests. Please wait and try again.',
  skipSuccessfulRequests: true,
});

const validateInput = (req, res, next) => {
  const { email, password, name } = req.body;
  
  if (email) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email) || email.length > 254) {
      return res.status(400).json({ message: 'Invalid email format' });
    }
  }
  
  if (password && password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters' });
  }
  
  if (name && (name.length < 2 || name.length > 100)) {
    return res.status(400).json({ message: 'Name must be between 2 and 100 characters' });
  }
  
  next();
};

// Routes
router.post('/register', registerLimiter, validateInput, authController.register);
router.get('/verify-email/:token', authController.verifyEmail);
router.post('/resend-verification', verificationEmailLimiter, authController.resendVerification);
router.post('/login', authLimiter, validateInput, authController.login);
router.post('/google', authLimiter, authController.googleAuth);
router.get('/session', auth, authController.session);
router.post('/logout', authController.logout);

router.post('/verify-mfa', privilegedMfaVerifyLimiter, authController.verifyMfa);
router.post('/mfa/resend', privilegedMfaResendLimiter, authController.resendMfa);

router.post('/forgot-password', forgotPasswordLimiter, authController.forgotPassword);
router.post('/reset-password/code', resetPasswordLimiter, authController.resetPasswordCode);
router.post('/reset-password/current', resetPasswordLimiter, authController.resetPasswordCurrent);
router.post('/reset-password/:token', resetPasswordLimiter, authController.resetPasswordToken);

router.post('/change-password', auth, authController.changePassword);
router.post('/set-security-question', auth, authController.setSecurityQuestion);

router.post('/reset-verify', authController.legacyResetNotice);
router.post('/reset-with-security', authController.legacyResetNotice);

module.exports = router;
