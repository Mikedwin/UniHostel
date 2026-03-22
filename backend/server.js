const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');

// Load environment variables
// For local development: use .env file in backend directory
// For production (Railway): uses environment variables from dashboard
require('dotenv').config();

// Import IDS middleware (optional - controlled by env variable)
const intrusionDetection = require('./middleware/intrusionDetection');

// Import visitor tracking middleware
const trackVisitor = require('./middleware/trackVisitor');

const logger = require('./config/logger');
const User = require('./models/User');
const Hostel = require('./models/Hostel');
const Application = require('./models/Application');
const { auth, checkRole } = require('./middleware/auth');

const { validateImageUpload, hostelUpload } = require('./middleware/imageValidation');
const { cacheMiddleware } = require('./middleware/cache');
const { scheduleDataRetentionCleanup } = require('./services/dataRetention');
const cache = require('./services/cache');
const { uploadBuffer } = require('./utils/cloudinary');
const adminRoutes = require('./routes/admin');
const authRoutes = require('./routes/auth');
const paymentRoutes = require('./routes/payment');
const transactionRoutes = require('./routes/transactions');
const backupRoutes = require('./routes/backup');
const gdprRoutes = require('./routes/gdpr');
const dataRetentionRoutes = require('./routes/dataRetention');
const cacheRoutes = require('./routes/cache');
const payoutRoutes = require('./routes/payout');
const visitorRoutes = require('./routes/visitors');
const { generateCsrfToken } = require('./middleware/csrf');
const { setAuthCookie } = require('./utils/authCookies');
const {
  sendPrivilegedMfaCodeEmail,
  sendPasswordResetEmail,
  sendApplicationSubmittedEmail,
  sendApplicationApprovedForPaymentEmail,
  sendPaymentSuccessEmail,
  sendFinalApprovalEmail,
  sendApplicationRejectedEmail,
  sendNewApplicationNotificationToManager
} = require('./utils/emailService');
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
} = require('./utils/mfa');
const { sendServerError } = require('./utils/serverError');
const {
  getTurnstileRemoteIp,
  isTurnstileEnabled,
  verifyTurnstileToken
} = require('./utils/turnstile');

const app = express();
const VERIFICATION_TOKEN_EXPIRY_HOURS = parseInt(process.env.VERIFICATION_TOKEN_EXPIRY_HOURS, 10) || 24;
const GENERIC_LOGIN_FAILURE_MESSAGE = 'Invalid email or password';
const PRIVILEGED_MFA_DELIVERY_FAILURE_MESSAGE = 'Unable to deliver the security code right now. Please try again later.';
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
const RATE_LIMIT_WINDOW_MS = parseEnvInt(process.env.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000);
const RATE_LIMIT_MAX_REQUESTS = parseEnvInt(process.env.RATE_LIMIT_MAX_REQUESTS, 60);
const AUTH_RATE_LIMIT_WINDOW_MS = parseEnvInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS, RATE_LIMIT_WINDOW_MS);
const AUTH_RATE_LIMIT_MAX = parseEnvInt(process.env.AUTH_RATE_LIMIT_MAX, 3);
const FORGOT_PASSWORD_RATE_LIMIT_WINDOW_MS = parseEnvInt(process.env.FORGOT_PASSWORD_RATE_LIMIT_WINDOW_MS, 60 * 60 * 1000);
const FORGOT_PASSWORD_RATE_LIMIT_MAX = parseEnvInt(process.env.FORGOT_PASSWORD_RATE_LIMIT_MAX, 3);
const RESET_PASSWORD_RATE_LIMIT_WINDOW_MS = parseEnvInt(process.env.RESET_PASSWORD_RATE_LIMIT_WINDOW_MS, 60 * 60 * 1000);
const RESET_PASSWORD_RATE_LIMIT_MAX = parseEnvInt(process.env.RESET_PASSWORD_RATE_LIMIT_MAX, 5);
const VERIFICATION_EMAIL_RATE_LIMIT_WINDOW_MS = parseEnvInt(process.env.VERIFICATION_EMAIL_RATE_LIMIT_WINDOW_MS, 60 * 60 * 1000);
const VERIFICATION_EMAIL_RATE_LIMIT_MAX = parseEnvInt(process.env.VERIFICATION_EMAIL_RATE_LIMIT_MAX, 3);
const TRUST_PROXY_HOPS = parseEnvInt(process.env.TRUST_PROXY_HOPS, 1);
const VISITOR_TRACKING_ENABLED = process.env.VISITOR_TRACKING_ENABLED === 'true';

const validateRuntimeEnv = ({ requireDatabase = true } = {}) => {
  const requiredEnvVars = ['JWT_SECRET'];

  if (requireDatabase) {
    requiredEnvVars.push('MONGO_URI');
  }

  const missingEnvVars = requiredEnvVars.filter((varName) => !process.env[varName]);
  if (missingEnvVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  }

  if (process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long');
  }
};

const normalizeImageArray = (images) => (
  Array.isArray(images)
    ? images.filter((image) => typeof image === 'string' && image.trim())
    : []
);

const parseHostelPayload = (req, res, next) => {
  try {
    if (req.body?.payload) {
      req.hostelPayload = JSON.parse(req.body.payload);
    } else {
      req.hostelPayload = req.body;
    }

    next();
  } catch (error) {
    logger.warn('Invalid hostel payload received', { error: error.message });
    res.status(400).json({ message: 'Invalid hostel payload format' });
  }
};

const groupFilesByField = (files = []) => files.reduce((accumulator, file) => {
  if (!accumulator[file.fieldname]) {
    accumulator[file.fieldname] = [];
  }

  accumulator[file.fieldname].push(file);
  return accumulator;
}, {});

const uploadFiles = async (files, folder) => Promise.all(
  (files || []).map((file) => uploadBuffer(file.buffer, folder, file.mimetype))
);

const normalizeOrigin = (origin) => {
  if (typeof origin !== 'string') {
    return '';
  }

  return origin.trim().replace(/\/+$/, '');
};

const normalizeRoomType = (room = {}) => {
  const normalizedRoom = { ...room };
  const numericPrice = Number(room.price);
  const numericCapacity = Number(room.totalCapacity);
  const numericOccupied = Number(room.occupiedCapacity);

  if (Number.isFinite(numericPrice)) {
    normalizedRoom.price = numericPrice;
  }

  if (Number.isFinite(numericCapacity)) {
    normalizedRoom.totalCapacity = numericCapacity;
  }

  if (Number.isFinite(numericOccupied)) {
    normalizedRoom.occupiedCapacity = numericOccupied;
  }

  normalizedRoom.roomImages = normalizeImageArray(room.roomImages);

  return normalizedRoom;
};

const processHostelMediaPayload = async (payload = {}, filesByField = {}) => {
  const roomTypes = Array.isArray(payload.roomTypes) ? payload.roomTypes : [];
  const processedRoomTypes = await Promise.all(roomTypes.map(async (room, index) => {
    const normalizedRoom = normalizeRoomType(room);
    const mainRoomFile = filesByField[`roomImage_${index}`]?.[0];
    const roomGalleryFiles = filesByField[`roomImages_${index}`] || [];

    if (mainRoomFile) {
      normalizedRoom.roomImage = await uploadBuffer(mainRoomFile.buffer, 'unihostel/rooms', mainRoomFile.mimetype);
    }

    if (roomGalleryFiles.length > 0) {
      const uploadedRoomImages = await uploadFiles(roomGalleryFiles, 'unihostel/rooms');
      normalizedRoom.roomImages = [...normalizeImageArray(normalizedRoom.roomImages), ...uploadedRoomImages];
    }

    return normalizedRoom;
  }));

  let hostelViewImage = typeof payload.hostelViewImage === 'string' ? payload.hostelViewImage.trim() : '';
  const hostelViewImageFile = filesByField.hostelViewImage?.[0];
  if (hostelViewImageFile) {
    hostelViewImage = await uploadBuffer(hostelViewImageFile.buffer, 'unihostel/hostels', hostelViewImageFile.mimetype);
  }

  const uploadedHostelImages = await uploadFiles(filesByField.hostelImages || [], 'unihostel/hostels');
  const hostelImages = [...normalizeImageArray(payload.hostelImages), ...uploadedHostelImages];

  return {
    ...payload,
    hostelViewImage,
    hostelImages,
    roomTypes: processedRoomTypes
  };
};

// Trust proxy - keep this configurable so rate limiting/logging use the correct client IP.
// Direct Render traffic typically needs 1 hop. Cloudflare -> Render needs 2 hops.
app.set('trust proxy', TRUST_PROXY_HOPS);

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// HTTP Request Logging with Morgan
const accessLogStream = fs.createWriteStream(path.join(logsDir, 'access.log'), { flags: 'a' });
app.use(morgan('combined', { stream: accessLogStream }));
app.use(morgan('dev')); // Console logging in development

// Body parser with size limits (reduced for security)
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ limit: '2mb', extended: true }));
app.use(cookieParser());

// CORS Configuration - MUST BE BEFORE OTHER MIDDLEWARE
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

    if (allowedOrigins.includes(normalizedOrigin)) {
      return callback(null, true);
    }

    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token']
};

app.use(cors(corsOptions));

app.options('*', cors(corsOptions));

// Security Middleware
// 1. Helmet - Sets various HTTP headers for security
app.use(helmet({
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
}));

// 2. Rate Limiting - TIGHTENED: More aggressive limits
const limiter = rateLimit({
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

app.use('/api/', limiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// 3. Data Sanitization against NoSQL injection
app.use(mongoSanitize());

// 4. Prevent HTTP Parameter Pollution
app.use(hpp());

// 5. Intrusion Detection System (IDS) - Optional security layer
// Set SECURITY_ENABLED=true in .env to activate
// Set SECURITY_AUTO_BLOCK=true to auto-ban attackers
if (process.env.SECURITY_ENABLED === 'true') {
  app.use(intrusionDetection);
  logger.info('🛡️ Intrusion Detection System ENABLED');
  console.log('🛡️ IDS Active - Monitoring for attacks');
} else {
  logger.info('🔓 Intrusion Detection System DISABLED (set SECURITY_ENABLED=true to enable)');
}

// 6. Visitor Tracking - opt-in for deployments that actually serve trackable pages
if (VISITOR_TRACKING_ENABLED) {
  app.use(trackVisitor);
  logger.info('Visitor tracking enabled');
  console.log('Visitor tracking enabled');
} else {
  logger.info('Visitor tracking disabled');
}

// Database Connection with Retry Logic
let dbConnected = false;
let dbConnectionAttempts = 0;
const MAX_DB_RETRIES = 5;
let runtimeInitialized = false;
let shutdownHandlersRegistered = false;
let server = null;

const connectDB = async () => {
  try {
    validateRuntimeEnv();
    dbConnectionAttempts++;
    logger.info(`MongoDB connection attempt ${dbConnectionAttempts}/${MAX_DB_RETRIES}`);
    
    await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: 50,
      minPoolSize: 5,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      heartbeatFrequencyMS: 10000,
      retryWrites: true,
      retryReads: true,
      maxIdleTimeMS: 60000,
      family: 4
    });
    
    dbConnected = true;
    dbConnectionAttempts = 0;
    logger.info('MongoDB Connected successfully');
    console.log('MongoDB Connected');
  } catch (err) {
    logger.error(`MongoDB Connection Error (Attempt ${dbConnectionAttempts}/${MAX_DB_RETRIES}):`, err.message);
    console.log(`MongoDB Error (Attempt ${dbConnectionAttempts}/${MAX_DB_RETRIES}):`, err.message);
    
    if (dbConnectionAttempts < MAX_DB_RETRIES) {
      const retryDelay = Math.min(1000 * Math.pow(2, dbConnectionAttempts), 30000);
      logger.info(`Retrying in ${retryDelay/1000} seconds...`);
      console.log(`Retrying in ${retryDelay/1000} seconds...`);
      setTimeout(connectDB, retryDelay);
    } else {
      logger.error('Max retry attempts reached. Exiting...');
      console.log('Max retry attempts reached. Exiting...');
      process.exit(1);
    }
  }
};

// Monitor connection events
mongoose.connection.on('connected', () => {
  dbConnected = true;
  logger.info('MongoDB connection established');
  console.log('MongoDB connection established');
});

mongoose.connection.on('disconnected', () => {
  dbConnected = false;
  logger.warn('MongoDB disconnected. Attempting to reconnect...');
  console.log('MongoDB disconnected. Attempting to reconnect...');
});

mongoose.connection.on('error', (err) => {
  dbConnected = false;
  logger.error('MongoDB connection error:', err);
  console.log('MongoDB connection error:', err.message);
});

mongoose.connection.on('reconnected', () => {
  dbConnected = true;
  logger.info('MongoDB reconnected');
  console.log('MongoDB reconnected');
});

const initializeRuntime = () => {
  if (runtimeInitialized) {
    return;
  }

  connectDB();
  scheduleDataRetentionCleanup();
  runtimeInitialized = true;
};

// Utility: Validate MongoDB ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Utility: Escape regex special characters
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Utility: Generate secure access code
const generateAccessCode = () => {
  const randomChars = crypto.randomBytes(3).toString('hex').toUpperCase().substring(0, 5);
  return `UNI-${randomChars}`;
};

const hashResetToken = (token) => crypto.createHash('sha256').update(token).digest('hex');
const DUMMY_PASSWORD_HASH = bcrypt.hashSync('UniHostel-login-placeholder-password', 12);
const shouldExposeApiDocs = () => (
  process.env.NODE_ENV !== 'production' || process.env.ENABLE_API_DOCS_IN_PRODUCTION === 'true'
);
const TURNSTILE_ROUTE_MESSAGES = {
  forgot_password: 'Please complete the security check before requesting a reset link.',
  login: 'Please complete the security check before signing in.',
  register: 'Please complete the security check before creating an account.'
};

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

// Health check endpoint
app.get('/', (req, res) => {
  const responsePayload = {
    status: 'ok', 
    message: 'UniHostel API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.8'
  };

  if (shouldExposeApiDocs()) {
    responsePayload.documentation = '/api-docs';
  }

  res.json(responsePayload);
});

// Remove debug endpoint - security risk
// app.get('/update-subaccount-now', ...) - REMOVED

// API Documentation
app.use('/api-docs', (req, res, next) => {
  if (!shouldExposeApiDocs()) {
    return res.status(404).json({ error: 'Not found' });
  }

  return next();
}, swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'UniHostel API Documentation'
}));

// Enhanced health check with detailed status
app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  
  const isHealthy = dbState === 1;
  const statusCode = isHealthy ? 200 : 503;
  
  res.status(statusCode).json({ 
    status: isHealthy ? 'healthy' : 'unhealthy',
    database: {
      status: dbStatus[dbState] || 'unknown',
      connected: dbConnected,
      readyState: dbState
    },
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Database connection check middleware
const checkDBConnection = (req, res, next) => {
  if (!dbConnected || mongoose.connection.readyState !== 1) {
    return res.status(503).json({ 
      error: 'Database temporarily unavailable. Please try again in a moment.',
      retryAfter: 5
    });
  }
  next();
};

// Admin routes
app.use('/api/admin', adminRoutes);

// Public visitor tracking route for SPA page views
app.use('/api/visitors', visitorRoutes);

// Auth routes
app.use('/api/auth', authRoutes);

// Payment routes - webhook stays public and signature-verified; private routes use per-route auth
app.use('/api/payment', paymentRoutes);

// Transaction routes
app.use('/api/transactions', auth, transactionRoutes);

// Backup routes
app.use('/api/backup', backupRoutes);

// GDPR compliance routes
app.use('/api/gdpr', gdprRoutes);

// Data retention routes
app.use('/api/data-retention', dataRetentionRoutes);

// Cache management routes
app.use('/api/cache', cacheRoutes);

// Payout routes (Mobile Money setup)
app.use('/api/payout', payoutRoutes);

// --- AUTH ROUTES ---
/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags: [Authentication]
 *     summary: Register new student account
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password, tosAccepted, privacyPolicyAccepted]
 *             properties:
 *               name: { type: string, minLength: 2, maxLength: 100 }
 *               email: { type: string, format: email }
 *               password: { type: string, minLength: 8 }
 *               tosAccepted: { type: boolean }
 *               privacyPolicyAccepted: { type: boolean }
 *     responses:
 *       200:
 *         description: Registration successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token: { type: string }
 *                 user: { $ref: '#/components/schemas/User' }
 *       400:
 *         description: Validation error or user exists
 */
// Input validation middleware
const validateInput = (req, res, next) => {
  const { email, password, name } = req.body;
  
  // Improved email validation (prevents ReDoS)
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
  message: 'Too many password reset attempts. Please request a new reset link or try again later.',
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
    
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.json({ message: 'If an account exists, a password reset link has been sent to your email.' });
    }
    
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = hashResetToken(resetToken);
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();
    
    await sendPasswordResetEmail(email, resetToken);
    logger.info(`Password reset requested for: ${email}`);
    
    res.json({ message: 'If an account exists, a password reset link has been sent to your email.' });
  } catch (err) {
    logger.error('Forgot password error:', err);
    res.status(500).json({ message: 'Failed to process request' });
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

// Global error handler
app.use((err, req, res, next) => {
  return sendServerError(res, err, {
    clientMessage: 'Internal server error',
    logMessage: 'Unhandled error',
    logExtra: {
      url: req.url,
      method: req.method,
      ip: req.ip
    }
  });
});

const closeServer = async () => {
  if (!server) {
    return;
  }

  await new Promise((resolve, reject) => {
    server.close((err) => {
      if (err) {
        reject(err);
        return;
      }

      resolve();
    });
  });

  server = null;
};

const registerProcessHandlers = () => {
  if (shutdownHandlersRegistered) {
    return;
  }

  process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully');
    closeServer()
      .then(() => new Promise((resolve) => {
        mongoose.connection.close(false, () => {
          logger.info('MongoDB connection closed');
          resolve();
        });
      }))
      .then(() => process.exit(0))
      .catch((error) => {
        logger.error('Graceful shutdown failed:', error);
        process.exit(1);
      });
  });

  process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception:', err);
    process.exit(1);
  });

  process.on('unhandledRejection', (err) => {
    logger.error('Unhandled Rejection:', err);
    process.exit(1);
  });

  shutdownHandlersRegistered = true;
};

const startServer = () => {
  validateRuntimeEnv();
  initializeRuntime();

  if (server) {
    return server;
  }

  const PORT = process.env.PORT || 5000;
  server = app.listen(PORT, '0.0.0.0', () => {
    logger.info(`Server started on port ${PORT} - v2`);
    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Server running on port ${PORT}`);
    console.log(`API available at http://localhost:${PORT}`);
  });

  registerProcessHandlers();
  return server;
};

if (require.main === module) {
  try {
    startServer();
  } catch (error) {
    console.error(`CRITICAL: ${error.message}`);
    process.exit(1);
  }
}

module.exports = {
  app,
  startServer,
  closeServer,
  connectDB,
  shouldExposeApiDocs
};



