
app.post('/api/auth/register', validateInput, async (req, res) => {
  try {
    const { name, email, password, role, tosAccepted, privacyPolicyAccepted } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    // Require ToS and Privacy Policy acceptance
    if (!tosAccepted || !privacyPolicyAccepted) {
      return res.status(400).json({ message: 'You must accept the Terms of Service and Privacy Policy to register' });
    }
    
    // Only allow student registration
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
});





// Email verification endpoint
app.get('/api/auth/verify-email/:token', async (req, res) => {
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
});





const verificationEmailLimiter = rateLimit({
  windowMs: VERIFICATION_EMAIL_RATE_LIMIT_WINDOW_MS,
  max: VERIFICATION_EMAIL_RATE_LIMIT_MAX,
  message: 'Too many verification email requests. Please try again later.',
});

app.post('/api/auth/resend-verification', verificationEmailLimiter, async (req, res) => {
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
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Authentication]
 *     summary: Login to account
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token: { type: string }
 *                 csrfToken: { type: string }
 *                 user: { $ref: '#/components/schemas/User' }
 *       400:
 *         description: Authentication failed
 *       500:
 *         description: Unable to sign in right now
 */
app.post('/api/auth/login', validateInput, async (req, res) => {
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

    // Check if account is locked
    if (user.accountLockedUntil && user.accountLockedUntil > new Date()) {
      logger.warn(`Blocked login attempt for locked account: ${user.email}`);
      return res.status(400).json({ message: GENERIC_LOGIN_FAILURE_MESSAGE });
    }

    // Reset lock if lockout period has passed
    if (user.accountLockedUntil && user.accountLockedUntil <= new Date()) {
      user.failedLoginAttempts = 0;
      user.accountLockedUntil = null;
      await user.save();
    }

    // Check account status
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
      // Increment failed login attempts
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      user.lastFailedLogin = new Date();
      
      const maxAttempts = parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5;
      const lockoutDuration = parseInt(process.env.LOCKOUT_DURATION_MINUTES) || 30;
      
      // Lock account if max attempts reached
      if (user.failedLoginAttempts >= maxAttempts) {
        user.accountLockedUntil = new Date(Date.now() + lockoutDuration * 60000);
        await user.save();
        
        logger.warn(`Account locked for user: ${user.email} after ${maxAttempts} failed attempts`);
        return res.status(400).json({ message: GENERIC_LOGIN_FAILURE_MESSAGE });
      }
      
      await user.save();
      return res.status(400).json({ message: GENERIC_LOGIN_FAILURE_MESSAGE });
    }

    // Student accounts no longer require email verification.
    if (user.role === 'student' && !user.isVerified) {
      user.isVerified = true;
      user.accountStatus = 'active';
      user.verificationToken = undefined;
      user.verificationTokenExpires = undefined;
      logger.info(`Auto-activated student account during login: ${user.email}`);
    }

    // Successful password check - reset password failure counters
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
});
login
app.get('/api/auth/session', auth, async (req, res) => {
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
});

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

app.post('/api/auth/verify-mfa', privilegedMfaVerifyLimiter, async (req, res) => {
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
});

app.post('/api/auth/mfa/resend', privilegedMfaResendLimiter, async (req, res) => {
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
});

app.post('/api/auth/forgot-password', forgotPasswordLimiter, async (req, res) => {
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
});

app.post('/api/auth/reset-password/code', resetPasswordLimiter, async (req, res) => {
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

    const verificationResult = await verifyPasswordResetCode(user, code);
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
});

app.post('/api/auth/reset-password/current', resetPasswordLimiter, async (req, res) => {
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
});

// Reset password with token
app.post('/api/auth/reset-password/:token', resetPasswordLimiter, async (req, res) => {
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
});


// Change password (authenticated)
app.post('/api/auth/change-password', auth, async (req, res) => {
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
});

app.post('/api/auth/reset-verify', async (req, res) => {
  res.status(410).json({
    message: 'This password reset method is no longer available. Use Forgot Password to receive a reset link.'
  });
});

app.post('/api/auth/reset-with-security', async (req, res) => {
  res.status(410).json({
    message: 'This password reset method is no longer available. Use Forgot Password to receive a reset link.'
  });
});

// Set security question (authenticated)
app.post('/api/auth/set-security-question', auth, async (req, res) => {
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
});

// --- HOSTEL ROUTES ---
/**
 * @swagger
 * /api/hostels:
 *   get:
 *     tags: [Hostels]
 *     summary: Get all available hostels
 *     parameters:
 *       - in: query
 *         name: location
 *         schema: { type: string }
 *       - in: query
 *         name: maxPrice
 *         schema: { type: number }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of hostels
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Hostel'
 */









/* Do SoC here as well */
app.get('/api/hostels', checkDBConnection, cacheMiddleware(300), async (req, res) => {
  try {
    const { location, maxPrice, search } = req.query;
    let query = { isAvailable: true, isDeleted: { $ne: true } };
    
    if (location && typeof location === 'string' && location.length <= 100) {
      const escapedLocation = escapeRegex(location);
      query.location = { $regex: escapedLocation, $options: 'i' };
    }
    
    if (maxPrice) {
      const price = Number(maxPrice);
      if (!isNaN(price) && price > 0 && price < 1000000) {
        query.price = { $lte: price };
      }
    }
    
    if (search && typeof search === 'string' && search.length <= 100) {
      const escapedSearch = escapeRegex(search);
      query.$or = [
        { name: { $regex: escapedSearch, $options: 'i' } },
        { location: { $regex: escapedSearch, $options: 'i' } },
        { description: { $regex: escapedSearch, $options: 'i' } },
        { facilities: { $regex: escapedSearch, $options: 'i' } }
      ];
    }

    const hostels = await Hostel.find(query)
      .select('name location hostelViewImage description roomTypes facilities isAvailable managerId createdAt')
      .populate('managerId', 'name')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    
    // Remove large images from list view
    const lightHostels = hostels.map(h => ({
      ...h,
      roomImages: undefined,
      bathroomImages: undefined,
      kitchenImages: undefined,
      compoundImages: undefined
    }));
    
    res.json(lightHostels);
  } catch (err) {
    console.error('Error fetching hostels:', err);
    res.status(500).json({ error: 'Failed to fetch hostels' });
  }
});

/**
 * @swagger
 * /api/hostels:
 *   post:
 *     tags: [Hostels]
 *     summary: Create new hostel (Manager only)
 *     security:
 *       - bearerAuth: []
 *       - csrfToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, location, description, roomTypes]
 *             properties:
 *               name: { type: string }
 *               location: { type: string }
 *               description: { type: string }
 *               roomTypes: { type: array }
 *               facilities: { type: array }
 *     responses:
 *       201:
 *         description: Hostel created
 *       403:
 *         description: Not authorized or unverified
 */
app.post('/api/hostels', checkDBConnection, auth, checkRole('manager'), hostelUpload, parseHostelPayload, validateImageUpload, async (req, res) => {
  try {
    logger.info('Hostel creation request from manager:', req.user.id);
    
    // Check if manager is verified
    const manager = await User.findById(req.user.id);
    if (!manager.isVerified || manager.accountStatus === 'pending_verification') {
      return res.status(403).json({ message: 'Your account is pending admin verification. You cannot create hostels yet.' });
    }
    
    logger.info('Processing hostel creation with image upload');
    
    // Validate required fields
    const payload = req.hostelPayload || {};
    const filesByField = groupFilesByField(req.files);
    const { name, location, description, roomTypes } = payload;
    if (!name || !location || !description || !roomTypes || roomTypes.length === 0) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    if (typeof name !== 'string' || name.length > 200 || typeof location !== 'string' || location.length > 200 || typeof description !== 'string' || description.length > 2000) {
      return res.status(400).json({ message: 'Input exceeds maximum length' });
    }
    
    const processedPayload = await processHostelMediaPayload(payload, filesByField);

    const hostelData = {
      ...processedPayload,
      managerId: req.user.id
    };
    
    const newHostel = new Hostel(hostelData);
    const savedHostel = await newHostel.save();
    
    // Invalidate hostel list cache
    cache.invalidatePattern('cache:/api/hostels');
    
    logger.info(`Hostel created successfully: ${savedHostel._id}`);
    res.status(201).json(savedHostel);
  } catch (err) {
    return sendServerError(res, err, {
      field: 'message',
      clientMessage: 'Failed to create hostel',
      logMessage: 'Hostel creation error'
    });
  }
});

app.get('/api/hostels/my-listings', checkDBConnection, auth, checkRole('manager'), async (req, res) => {
  try {
    const hostels = await Hostel.find({ managerId: req.user.id, isDeleted: { $ne: true } })
      .select('name location hostelViewImage description roomTypes facilities isAvailable createdAt')
      .sort({ createdAt: -1 })
      .lean();
    
    res.json(hostels);
  } catch (err) {
    return sendServerError(res, err, {
      clientMessage: 'Failed to fetch manager hostels',
      logMessage: 'Error fetching manager hostels'
    });
  }
});

app.get('/api/hostels/my-trash', checkDBConnection, auth, checkRole('manager'), async (req, res) => {
  try {
    const hostels = await Hostel.find({ managerId: req.user.id, isDeleted: true })
      .select('name location hostelViewImage description roomTypes facilities deletedAt')
      .sort({ deletedAt: -1 })
      .lean();
    res.json(hostels);
  } catch (err) {
    return sendServerError(res, err, {
      clientMessage: 'Failed to fetch deleted hostels',
      logMessage: 'Error fetching deleted hostels'
    });
  }
});

app.patch('/api/hostels/:id/restore', checkDBConnection, auth, checkRole('manager'), async (req, res) => {
  try {
    const hostel = await Hostel.findById(req.params.id);
    if (!hostel) return res.status(404).json({ message: 'Hostel not found' });
    if (hostel.managerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    hostel.isDeleted = false;
    hostel.deletedAt = null;
    hostel.deletedBy = null;
    await hostel.save();
    res.json({ message: 'Hostel restored successfully' });
  } catch (err) {
    return sendServerError(res, err, {
      clientMessage: 'Failed to restore hostel',
      logMessage: 'Error restoring hostel'
    });
  }
});

/**
 * @swagger
 * /api/hostels/{id}:
 *   get:
 *     tags: [Hostels]
 *     summary: Get hostel details
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Hostel details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Hostel'
 *       404:
 *         description: Hostel not found
 */
app.get('/api/hostels/:id', checkDBConnection, async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid hostel ID' });
    }
    
    const hostel = await Hostel.findById(req.params.id)
      .select('name location hostelViewImage hostelImages virtualTourUrl description roomTypes facilities isAvailable managerId createdAt')
      .populate('managerId', 'name')
      .lean();
    
    if (!hostel) {
      return res.status(404).json({ error: 'Hostel not found' });
    }
    
    res.json(hostel);
  } catch (err) {
    console.error('Error fetching hostel:', err.message, err.stack);
    res.status(500).json({ error: 'Failed to fetch hostel' });
  }
});

app.put('/api/hostels/:id', checkDBConnection, auth, checkRole('manager'), hostelUpload, parseHostelPayload, validateImageUpload, async (req, res) => {
  try {
    
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid hostel ID' });
    }
    
    const hostel = await Hostel.findById(req.params.id);
    if (!hostel) {
      return res.status(404).json({ message: 'Hostel not found' });
    }
    
    if (hostel.managerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to edit this hostel' });
    }
    
    const payload = req.hostelPayload || {};
    const filesByField = groupFilesByField(req.files);

    // Build update object
    const updateData = {};
    
    if (payload.name) updateData.name = payload.name;
    if (payload.location) updateData.location = payload.location;
    if (payload.description) updateData.description = payload.description;
    if (payload.facilities) updateData.facilities = payload.facilities;
    if (payload.isAvailable !== undefined) updateData.isAvailable = payload.isAvailable;
    if (payload.virtualTourUrl !== undefined) updateData.virtualTourUrl = payload.virtualTourUrl;
    
    const processedPayload = await processHostelMediaPayload(payload, filesByField);

    if (processedPayload.hostelViewImage) {
      updateData.hostelViewImage = processedPayload.hostelViewImage;
    }

    if (payload.hostelImages || filesByField.hostelImages?.length) {
      updateData.hostelImages = processedPayload.hostelImages;
    }
    
    // Process room types - upload new images to Cloudinary and recalculate availability
    if (payload.roomTypes) {
      updateData.roomTypes = processedPayload.roomTypes.map((room) => {
        const processedRoom = { ...room };
        const occupiedCapacity = processedRoom.occupiedCapacity || 0;
        const totalCapacity = processedRoom.totalCapacity || 0;
        processedRoom.available = occupiedCapacity < totalCapacity;
        return processedRoom;
      });
    }
    
    const updatedHostel = await Hostel.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).lean();
    
    // Invalidate cache for this specific hostel and list
    cache.invalidatePattern('cache:/api/hostels');
    cache.del(`cache:/api/hostels/${req.params.id}`);
    
    logger.info(`Hostel updated: ${req.params.id}, room availability recalculated`);
    
    // Auto-update pending applications with new prices
    if (updateData.roomTypes) {
      const commissionPercent = parseFloat(process.env.ADMIN_COMMISSION_PERCENT) || 3;
      
      for (const roomType of updateData.roomTypes) {
        const hostelFee = roomType.price;
        const adminCommission = Math.round(hostelFee * (commissionPercent / 100));
        const totalAmount = hostelFee + adminCommission;
        
        await Application.updateMany(
          {
            hostelId: req.params.id,
            roomType: roomType.type,
            status: { $in: ['pending', 'approved_for_payment'] },
            paymentStatus: 'pending'
          },
          {
            $set: { hostelFee, adminCommission, totalAmount }
          }
        );
      }
    }
    
    res.json(updatedHostel);
  } catch (err) {
    return sendServerError(res, err, {
      field: 'message',
      clientMessage: 'Failed to update hostel',
      logMessage: 'Error updating hostel'
    });
  }
});

app.delete('/api/hostels/:id', checkDBConnection, auth, checkRole('manager'), async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid hostel ID' });
    }
    
    const hostel = await Hostel.findById(req.params.id);
    if (!hostel) {
      return res.status(404).json({ message: 'Hostel not found' });
    }
    
    if (hostel.managerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this hostel' });
    }
    
    // Soft delete
    hostel.isDeleted = true;
    hostel.deletedAt = new Date();
    hostel.deletedBy = req.user.id;
    await hostel.save();
    
    // Invalidate cache
    cache.invalidatePattern('cache:/api/hostels');
    cache.del(`cache:/api/hostels/${req.params.id}`);
    
    res.json({ message: 'Hostel deleted successfully' });
  } catch (err) {
    return sendServerError(res, err, {
      field: 'message',
      clientMessage: 'Failed to delete hostel',
      logMessage: 'Error deleting hostel'
    });
  }
});

// --- APPLICATION ROUTES ---
/**
 * @swagger
 * /api/applications:
 *   post:
 *     tags: [Applications]
 *     summary: Submit hostel application (Student only)
 *     security:
 *       - bearerAuth: []
 *       - csrfToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [hostelId, roomType, semester, studentName, contactNumber]
 *             properties:
 *               hostelId: { type: string }
 *               roomType: { type: string }
 *               semester: { type: string }
 *               studentName: { type: string }
 *               contactNumber: { type: string }
 *     responses:
 *       201:
 *         description: Application submitted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Application'
 */
// Step 1: Student applies (no payment yet)








/* Do SoC here as well  */
app.post('/api/applications', checkDBConnection, auth, checkRole('student'), async (req, res) => {
  try {
    const { hostelId, roomType, semester, studentName, contactNumber } = req.body;
    
    if (!isValidObjectId(hostelId)) {
      return res.status(400).json({ error: 'Invalid hostel ID' });
    }
    
    const hostel = await Hostel.findById(hostelId);
    if (!hostel) {
      return res.status(404).json({ error: 'Hostel not found' });
    }
    
    const room = hostel.roomTypes.find(r => r.type === roomType);
    if (!room) {
      return res.status(404).json({ error: 'Room type not found' });
    }
    
    // Calculate payment amounts for later
    const hostelFee = room.price;
    const commissionPercent = parseFloat(process.env.ADMIN_COMMISSION_PERCENT) || 3;
    const adminCommission = Math.round(hostelFee * (commissionPercent / 100));
    const totalAmount = hostelFee + adminCommission;
    
    const application = new Application({
      hostelId,
      studentId: req.user.id,
      roomType,
      semester,
      studentName,
      contactNumber,
      status: 'pending', // Awaiting manager review
      paymentStatus: 'pending',
      hostelFee,
      adminCommission,
      totalAmount
    });
    await application.save();
    
    logger.info('Application created', { applicationId: application._id, hostelFee, adminCommission, totalAmount });
    
    // Fetch user data for emails before responding
    const student = await User.findById(req.user.id);
    const manager = await User.findById(hostel.managerId);
    
    // Send response immediately
    res.status(201).json(application);
    
    // Send email notifications in background (don't wait)
    setImmediate(async () => {
      try {
        await sendApplicationSubmittedEmail(student.email, student.name, hostel.name, roomType, semester);
        await sendNewApplicationNotificationToManager(manager.email, manager.name, student.name, hostel.name, roomType);
      } catch (emailErr) {
        logger.error('Email notification error:', emailErr);
      }
    });
  } catch (err) {
    console.error('Error creating application:', err);
    res.status(500).json({ error: 'Failed to create application' });
  }
});

/**
 * @swagger
 * /api/applications/student:
 *   get:
 *     tags: [Applications]
 *     summary: Get student's applications
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: archived
 *         schema: { type: boolean }
 *     responses:
 *       200:
 *         description: List of applications
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Application'
 */
app.get('/api/applications/student', checkDBConnection, auth, checkRole('student'), async (req, res) => {
  try {
    const { archived } = req.query;
    const query = { studentId: req.user.id };
    
    if (archived === 'true') {
      query.isArchived = true;
    } else {
      query.isArchived = { $ne: true };
    }
    
    const apps = await Application.find(query)
      .select('-__v -adminNotes')
      .populate('hostelId', 'name location managerId')
      .sort({ createdAt: -1 })
      .lean();
    
    // Populate manager contact for approved applications in one query.
    const managerIds = [
      ...new Set(
        apps
          .filter((app) => app.status === 'approved' && app.hostelId?.managerId)
          .map((app) => app.hostelId.managerId.toString())
      )
    ];

    if (managerIds.length > 0) {
      const managers = await User.find({ _id: { $in: managerIds } })
        .select('name email phone')
        .lean();

      const managerMap = new Map(
        managers.map((manager) => [manager._id.toString(), manager])
      );

      apps.forEach((app) => {
        if (app.status === 'approved' && app.hostelId?.managerId) {
          app.managerContact = managerMap.get(app.hostelId.managerId.toString()) || null;
        }
      });
    }
    
    res.json(apps);
  } catch (err) {
    console.error('Error fetching student applications:', err);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

app.get('/api/applications/manager', checkDBConnection, auth, checkRole('manager'), async (req, res) => {
  try {
    const { archived } = req.query;
    
    // Get manager's hostel IDs first
    const managerHostels = await Hostel.find({ managerId: req.user.id }).select('_id').lean();
    const hostelIds = managerHostels.map(h => h._id);
    
    // Query only applications for manager's hostels
    const query = { 
      hostelId: { $in: hostelIds },
      isArchived: archived === 'true'
    };
    
    const apps = await Application.find(query)
      .select('-__v -adminNotes')
      .populate('hostelId', 'name location')
      .populate('studentId', 'name email')
      .sort({ createdAt: -1 })
      .lean();
    
    res.json(apps);
  } catch (err) {
    console.error('Error fetching manager applications:', err);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// Get application statistics for a hostel
app.get('/api/applications/hostel/:hostelId/stats', checkDBConnection, async (req, res) => {
  try {
    const { hostelId } = req.params;
    
    if (!isValidObjectId(hostelId)) {
      return res.status(400).json({ error: 'Invalid hostel ID' });
    }
    
    const applications = await Application.find({ hostelId, status: { $in: ['pending', 'approved'] } }).lean();
    
    const stats = {
      commissionPercent: parseFloat(process.env.ADMIN_COMMISSION_PERCENT) || 3
    };
    applications.forEach(app => {
      // Count applications per room type
      if (!stats[app.roomType]) {
        stats[app.roomType] = 0;
      }
      stats[app.roomType]++;
      
      // Track last booking time per room type
      const lastBookingKey = `${app.roomType}_lastBooking`;
      if (!stats[lastBookingKey] || new Date(app.createdAt) > new Date(stats[lastBookingKey])) {
        stats[lastBookingKey] = app.createdAt;
      }
    });
    
    res.json(stats);
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Step 2 & 6: Manager approves for payment OR final approval - OPTIMIZED
app.patch('/api/applications/:id/status', checkDBConnection, auth, checkRole('manager'), async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid application ID' });
    }
    
    const { action } = req.body;
    
    if (!action) {
      return res.status(400).json({ error: 'Action is required' });
    }
    
    // Fetch application WITHOUT populate (faster)
    const app = await Application.findById(req.params.id).lean();
    
    if (!app) {
      return res.status(404).json({ error: 'Application not found' });
    }
    
    // Fetch hostel separately
    const hostel = await Hostel.findById(app.hostelId).lean();
    
    if (!hostel) {
      return res.status(404).json({ error: 'Hostel not found' });
    }
    
    // Verify manager owns this hostel
    if (hostel.managerId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to manage this application' });
    }
    
    const roomIndex = hostel.roomTypes.findIndex(r => r.type === app.roomType);
    
    if (roomIndex === -1) {
      return res.status(404).json({ error: 'Room type not found' });
    }
    
    const room = hostel.roomTypes[roomIndex];
    
    if (action === 'approve_for_payment') {
      if (app.status !== 'pending') {
        return res.status(400).json({ error: `Can only approve pending applications. Current status: ${app.status}` });
      }
      
      // Update status directly
      await Application.updateOne({ _id: req.params.id }, { $set: { status: 'approved_for_payment' } });
      
      // Send response IMMEDIATELY
      res.json({ message: 'Application approved for payment', application: { ...app, status: 'approved_for_payment' } });
      
      // Everything else in background
      setImmediate(async () => {
        try {
          const student = await User.findById(app.studentId).lean();
          if (student) {
            await sendApplicationApprovedForPaymentEmail(student.email, student.name, hostel.name, app.roomType, app.totalAmount);
          }
        } catch (emailErr) {
          logger.error('Email notification error:', emailErr);
        }
      });
      
      return;
    }
    
    if (action === 'reject') {
      // Update status directly
      await Application.updateOne({ _id: req.params.id }, { $set: { status: 'rejected' } });
      
      // Send response IMMEDIATELY
      res.json({ message: 'Application rejected', application: { ...app, status: 'rejected' } });
      
      // Everything else in background
      setImmediate(async () => {
        try {
          const student = await User.findById(app.studentId).lean();
          if (student) {
            await sendApplicationRejectedEmail(student.email, student.name, hostel.name, app.roomType);
          }
        } catch (emailErr) {
          logger.error('Email notification error:', emailErr);
        }
      });
      
      return;
    }
    
    if (action === 'final_approve') {
      if (app.status !== 'paid_awaiting_final') {
        return res.status(400).json({ error: `Can only final approve paid applications. Current status: ${app.status}` });
      }
      
      // Check room capacity
      if (room.occupiedCapacity >= room.totalCapacity) {
        return res.status(400).json({ 
          error: 'Cannot approve: Room is at full capacity',
          currentOccupancy: room.occupiedCapacity,
          totalCapacity: room.totalCapacity
        });
      }
      
      // Generate access code
      const accessCode = generateAccessCode();
      const now = new Date();
      
      // Update both application and hostel in parallel
      await Promise.all([
        Application.updateOne(
          { _id: req.params.id },
          { 
            $set: { 
              status: 'approved',
              accessCode,
              accessCodeIssuedAt: now,
              finalApprovedAt: now
            }
          }
        ),
        Hostel.updateOne(
          { _id: app.hostelId, 'roomTypes.type': app.roomType },
          { 
            $inc: { 'roomTypes.$.occupiedCapacity': 1 },
            $set: { 
              'roomTypes.$.available': (room.occupiedCapacity + 1) < room.totalCapacity
            }
          }
        )
      ]);
      
      // Send response IMMEDIATELY
      res.json({ 
        message: 'Application finally approved', 
        application: { ...app, status: 'approved', accessCode },
        accessCode,
        roomStatus: {
          occupiedCapacity: room.occupiedCapacity + 1,
          totalCapacity: room.totalCapacity,
          available: (room.occupiedCapacity + 1) < room.totalCapacity
        }
      });
      
      // Email in background
      setImmediate(async () => {
        try {
          const student = await User.findById(app.studentId).lean();
          if (student) {
            await sendFinalApprovalEmail(student.email, student.name, hostel.name, app.roomType, accessCode);
          }
        } catch (emailErr) {
          logger.error('Email notification error:', emailErr);
        }
      });
      
      return;
    }
    
    res.status(400).json({ error: `Invalid action: ${action}. Valid actions are: approve_for_payment, reject, final_approve` });
  } catch (err) {
    return sendServerError(res, err, {
      clientMessage: 'Failed to update application status',
      logMessage: 'Error updating application status'
    });
  }
});





app.delete('/api/applications/:id', checkDBConnection, auth, checkRole('student'), async (req, res) => {
    try {
        if (!isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: 'Invalid application ID' });
        }
        
        const app = await Application.findById(req.params.id);
        if (!app) {
            return res.status(404).json({ message: 'Application not found' });
        }
        
        if (app.studentId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to cancel this application' });
        }
        
        // Archive instead of delete
        app.isArchived = true;
        app.archivedAt = new Date();
        app.archivedBy = req.user.id;
        await app.save();
        
        res.json({ message: 'Application moved to history' });
    } catch (err) {
        console.error('Error deleting application:', err);
        res.status(500).json({ error: 'Failed to delete application' });
    }
});

// Recalculate payment amounts for an application (when commission changes)
app.patch('/api/applications/:id/recalculate', checkDBConnection, auth, async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid application ID' });
    }
    
    const app = await Application.findById(req.params.id).populate('hostelId');
    if (!app) {
      return res.status(404).json({ error: 'Application not found' });
    }
    
    // Only recalculate for pending or approved_for_payment applications
    if (!['pending', 'approved_for_payment'].includes(app.status)) {
      return res.status(400).json({ error: 'Cannot recalculate paid or completed applications' });
    }
    
    const hostel = await Hostel.findById(app.hostelId._id);
    const room = hostel.roomTypes.find(r => r.type === app.roomType);
    
    if (!room) {
      return res.status(404).json({ error: 'Room type not found' });
    }
    
    // Recalculate with current commission rate
    const hostelFee = room.price;
    const commissionPercent = parseFloat(process.env.ADMIN_COMMISSION_PERCENT) || 3;
    const adminCommission = Math.round(hostelFee * (commissionPercent / 100));
    const totalAmount = hostelFee + adminCommission;
    
    app.hostelFee = hostelFee;
    app.adminCommission = adminCommission;
    app.totalAmount = totalAmount;
    await app.save();
    
    logger.info('Application payment recalculated', { applicationId: app._id, hostelFee, adminCommission, totalAmount });
    
    res.json({ 
      message: 'Payment amounts recalculated', 
      application: app,
      commissionPercent
    });
  } catch (err) {
    console.error('Error recalculating application:', err);
    res.status(500).json({ error: 'Failed to recalculate application' });
  }
});

// Archive/Unarchive application (Manager or Student)
app.patch('/api/applications/:id/archive', checkDBConnection, auth, async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid application ID' });
    }
    
    const { archive } = req.body;
    const app = await Application.findById(req.params.id).populate('hostelId');
    
    if (!app) {
      return res.status(404).json({ error: 'Application not found' });
    }
    
    // Check authorization - either manager of the hostel or the student
    const isManager = req.user.role === 'manager';
    const isStudent = req.user.role === 'student' && app.studentId.toString() === req.user.id;
    
    if (isManager) {
      const hostel = await Hostel.findById(app.hostelId._id);
      if (hostel.managerId.toString() !== req.user.id) {
        return res.status(403).json({ error: 'Not authorized' });
      }
    } else if (!isStudent) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    app.isArchived = archive;
    app.archivedAt = archive ? new Date() : null;
    app.archivedBy = archive ? req.user.id : null;
    await app.save();
    
    res.json({ message: archive ? 'Application archived' : 'Application restored', application: app });
  } catch (err) {
    console.error('Error archiving application:', err);
    res.status(500).json({ error: 'Failed to archive application' });
  }
});

// Permanently delete application (Manager or Student) - Only for archived applications
app.delete('/api/applications/:id/permanent', checkDBConnection, auth, async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid application ID' });
    }
    
    const app = await Application.findById(req.params.id).lean();
    
    if (!app) {
      return res.status(404).json({ error: 'Application not found' });
    }
    
    // Only allow deletion of archived applications
    if (!app.isArchived) {
      return res.status(400).json({ error: 'Can only permanently delete archived applications' });
    }
    
    // Check authorization - either manager of the hostel or the student
    const isManager = req.user.role === 'manager';
    const isStudent = req.user.role === 'student' && app.studentId.toString() === req.user.id;
    
    if (isManager) {
      const hostel = await Hostel.findById(app.hostelId).lean();
      if (!hostel || hostel.managerId.toString() !== req.user.id) {
        return res.status(403).json({ error: 'Not authorized' });
      }
    } else if (!isStudent) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    // Permanently delete from database
    await Application.deleteOne({ _id: req.params.id });
    
    logger.info(`Application permanently deleted: ${req.params.id} by user: ${req.user.id}`);
    
    res.json({ message: 'Application permanently deleted' });
  } catch (err) {
    console.error('Error permanently deleting application:', err);
    logger.error('Permanent delete error:', err);
    res.status(500).json({ error: 'Failed to permanently delete application' });
  }
});
