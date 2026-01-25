const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const crypto = require('crypto');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const logger = require('./config/logger');
const User = require('./models/User');
const Hostel = require('./models/Hostel');
const Application = require('./models/Application');
const { auth, checkRole } = require('./middleware/auth');
const { generateCsrfToken, csrfProtection, invalidateCsrfToken } = require('./middleware/csrf');
const adminRoutes = require('./routes/admin');
const authRoutes = require('./routes/auth');
const paymentRoutes = require('./routes/payment');
const transactionRoutes = require('./routes/transactions');
const backupRoutes = require('./routes/backup');

const app = express();

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// HTTP Request Logging with Morgan
const accessLogStream = fs.createWriteStream(path.join(logsDir, 'access.log'), { flags: 'a' });
app.use(morgan('combined', { stream: accessLogStream }));
app.use(morgan('dev')); // Console logging in development

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
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 60, // REDUCED: limit each IP to 60 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // REDUCED: limit each IP to 3 login attempts per windowMs
  message: 'Too many login attempts, please try again after 15 minutes.',
  skipSuccessfulRequests: true,
});

app.use('/api/', limiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// 3. Data Sanitization against NoSQL injection
app.use(mongoSanitize());

// 4. Prevent HTTP Parameter Pollution
app.use(hpp());

// Body parser with size limits (reduced for security)
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ limit: '2mb', extended: true }));

// CORS Configuration - FIXED: Strict origin validation
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? ['https://uni-hostel-two.vercel.app', 'https://unihostel-production.up.railway.app'] 
  : ['http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  exposedHeaders: ['X-CSRF-Token'],
  maxAge: 600
}));

// Database Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/unihostel', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 3000,
      socketTimeoutMS: 30000,
      family: 4
    });
    logger.info('MongoDB Connected successfully');
    console.log('MongoDB Connected');
  } catch (err) {
    logger.error('MongoDB Connection Error:', err);
    console.log('MongoDB Error:', err);
    process.exit(1);
  }
};
connectDB();

// Utility: Validate MongoDB ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Utility: Escape regex special characters
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Utility: Generate secure access code
const generateAccessCode = () => {
  const timestamp = Date.now();
  const randomBytes = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `UNI-${timestamp}-${randomBytes}`;
};

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'UniHostel API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.1'
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Admin routes
app.use('/api/admin', adminRoutes);

// Auth routes
app.use('/api/auth', authRoutes);

// Payment routes - CSRF protected
app.use('/api/payment', auth, csrfProtection, paymentRoutes);

// Transaction routes - CSRF protected
app.use('/api/transactions', auth, csrfProtection, transactionRoutes);

// Backup routes
app.use('/api/backup', backupRoutes);

// --- AUTH ROUTES ---
// Input validation middleware
const validateInput = (req, res, next) => {
  const { email, password, name } = req.body;
  
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
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
    console.log('Registration attempt:', req.body);
    const { name, email, password, role } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    // Only allow student registration
    if (role && role !== 'student') {
      return res.status(403).json({ message: 'Only student registration is allowed. Managers must be registered by administrators.' });
    }
    
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    const newUser = new User({ 
      name, 
      email, 
      password: hashedPassword, 
      role: 'student',
      isVerified: false,
      verificationToken,
      verificationTokenExpires,
      accountStatus: 'active'
    });
    await newUser.save();
    console.log('Student created successfully:', newUser._id);
    
    // For now, auto-verify (until email service is set up)
    // TODO: Send verification email
    logger.info(`Verification link: ${process.env.FRONTEND_URL}/verify-email/${verificationToken}`);

    const token = jwt.sign(
      { id: newUser._id, role: newUser.role, iat: Math.floor(Date.now() / 1000) }, 
      process.env.JWT_SECRET, 
      { expiresIn: '8h', algorithm: 'HS256' }
    );
    res.json({ 
      token, 
      user: { id: newUser._id, name, email, role: newUser.role, isVerified: false },
      message: 'Registration successful. Please check your email to verify your account.'
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: err.message || 'Registration failed' });
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
    await user.save();
    
    logger.info(`User verified: ${user.email}`);
    res.json({ message: 'Email verified successfully! You can now login.' });
  } catch (err) {
    logger.error('Email verification error:', err);
    res.status(500).json({ message: 'Verification failed' });
  }
});

app.post('/api/auth/login', validateInput, async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User does not exist' });

    // Check if account is locked
    if (user.accountLockedUntil && user.accountLockedUntil > new Date()) {
      const minutesLeft = Math.ceil((user.accountLockedUntil - new Date()) / 60000);
      return res.status(423).json({ 
        message: `Account locked due to multiple failed login attempts. Try again in ${minutesLeft} minutes.`,
        lockedUntil: user.accountLockedUntil
      });
    }

    // Reset lock if lockout period has passed
    if (user.accountLockedUntil && user.accountLockedUntil <= new Date()) {
      user.failedLoginAttempts = 0;
      user.accountLockedUntil = null;
      await user.save();
    }

    // Check account status
    if (user.accountStatus === 'suspended') {
      return res.status(403).json({ message: `Account suspended. Reason: ${user.suspensionReason || 'Contact admin'}` });
    }
    if (user.accountStatus === 'banned') {
      return res.status(403).json({ message: `Account banned. Reason: ${user.suspensionReason || 'Contact admin'}` });
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
        
        return res.status(423).json({ 
          message: `Account locked due to ${maxAttempts} failed login attempts. Try again in ${lockoutDuration} minutes.`,
          lockedUntil: user.accountLockedUntil
        });
      }
      
      await user.save();
      
      const attemptsLeft = maxAttempts - user.failedLoginAttempts;
      return res.status(400).json({ 
        message: `Invalid credentials. ${attemptsLeft} attempt(s) remaining before account lockout.`,
        attemptsLeft
      });
    }

    // Successful login - reset failed attempts
    user.failedLoginAttempts = 0;
    user.accountLockedUntil = null;
    user.lastFailedLogin = null;
    
    // Update last login and add to login history
    user.lastLogin = new Date();
    user.loginHistory.push({
      timestamp: new Date(),
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent']
    });
    // Keep only last 10 login records
    if (user.loginHistory.length > 10) {
      user.loginHistory = user.loginHistory.slice(-10);
    }
    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role, iat: Math.floor(Date.now() / 1000) }, 
      process.env.JWT_SECRET, 
      { expiresIn: '8h', algorithm: 'HS256' }
    );
    
    // Generate CSRF token
    const csrfToken = generateCsrfToken(user._id.toString());
    
    logger.info(`Successful login for user: ${user.email}`);
    
    res.json({ 
      token, 
      csrfToken,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      passwordResetRequired: user.passwordResetRequired
    });
  } catch (err) {
    logger.error('Login error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Forgot password - Request reset
const { sendPasswordResetEmail } = require('./utils/emailService');

app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ message: 'If an account exists, a password reset link has been sent to your email.' });
    }
    
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
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
app.post('/api/auth/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    
    if (!password || password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }
    
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }
    
    user.password = await bcrypt.hash(password, 12);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.passwordResetRequired = false;
    await user.save();
    
    logger.info(`Password reset successful for user: ${user.email}`);
    res.json({ message: 'Password reset successful. You can now login with your new password.' });
  } catch (err) {
    logger.error('Reset password error:', err);
    res.status(500).json({ message: 'Failed to reset password' });
  }
});

// Change password (authenticated)
app.post('/api/auth/change-password', auth, csrfProtection, async (req, res) => {
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
    await user.save();
    
    logger.info(`Password changed for user: ${user.email}`);
    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    logger.error('Change password error:', err);
    res.status(500).json({ message: 'Failed to change password' });
  }
});

// In-app password reset - Step 1: Verify email and security question
app.post('/api/auth/reset-verify', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No account found with this email' });
    }
    
    if (!user.securityQuestion) {
      // Auto-set a default security question for existing users
      user.securityQuestion = "What is your email address?";
      user.securityAnswer = await bcrypt.hash(email.toLowerCase().trim(), 12);
      await user.save();
      logger.info(`Auto-set security question for user: ${user.email}`);
    }
    
    res.json({ 
      securityQuestion: user.securityQuestion,
      userId: user._id 
    });
  } catch (err) {
    logger.error('Reset verify error:', err);
    res.status(500).json({ message: 'Failed to verify account' });
  }
});

// In-app password reset - Step 2: Verify answer and reset password
app.post('/api/auth/reset-with-security', async (req, res) => {
  try {
    const { userId, securityAnswer, newPassword } = req.body;
    
    if (!userId || !securityAnswer || !newPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const isMatch = await bcrypt.compare(securityAnswer.toLowerCase().trim(), user.securityAnswer);
    if (!isMatch) {
      return res.status(400).json({ message: 'Security answer is incorrect' });
    }
    
    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();
    
    logger.info(`Password reset via security question for: ${user.email}`);
    res.json({ message: 'Password reset successful. You can now login with your new password.' });
  } catch (err) {
    logger.error('Reset with security error:', err);
    res.status(500).json({ message: 'Failed to reset password' });
  }
});

// Set security question (authenticated)
app.post('/api/auth/set-security-question', auth, csrfProtection, async (req, res) => {
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
app.get('/api/hostels', async (req, res) => {
  try {
    const { location, maxPrice, search } = req.query;
    let query = { isAvailable: true };
    
    if (location) {
      const escapedLocation = escapeRegex(location);
      query.location = { $regex: escapedLocation, $options: 'i' };
    }
    
    if (maxPrice) {
      query.price = { $lte: Number(maxPrice) };
    }
    
    if (search) {
      const escapedSearch = escapeRegex(search);
      query.$or = [
        { name: { $regex: escapedSearch, $options: 'i' } },
        { location: { $regex: escapedSearch, $options: 'i' } },
        { description: { $regex: escapedSearch, $options: 'i' } },
        { facilities: { $in: [new RegExp(escapedSearch, 'i')] } }
      ];
    }

    const hostels = await Hostel.find(query)
      .select('name location description roomTypes facilities isAvailable managerId createdAt hostelViewImage')
      .populate('managerId', 'name email')
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

app.post('/api/hostels', auth, csrfProtection, checkRole('manager'), async (req, res) => {
  try {
    // Check if manager is verified
    const manager = await User.findById(req.user.id);
    if (!manager.isVerified || manager.accountStatus === 'pending_verification') {
      return res.status(403).json({ message: 'Your account is pending admin verification. You cannot create hostels yet.' });
    }
    
    console.log('Creating hostel with data:', {
      ...req.body,
      images: req.body.images ? `[${req.body.images.length} images]` : 'no images'
    });
    console.log('User ID:', req.user.id);
    
    // Validate required fields
    const { name, location, description, roomTypes } = req.body;
    if (!name || !location || !description || !roomTypes || roomTypes.length === 0) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    const newHostel = new Hostel({ ...req.body, managerId: req.user.id });
    const savedHostel = await newHostel.save();
    
    console.log('Hostel created successfully:', savedHostel._id);
    res.status(201).json(savedHostel);
  } catch (err) {
    console.error('Error creating hostel:', err);
    console.error('Error details:', err.message);
    if (err.name === 'ValidationError') {
      console.error('Validation errors:', err.errors);
    }
    res.status(500).json({ message: err.message || 'Failed to create hostel' });
  }
});

app.get('/api/hostels/my-listings', auth, checkRole('manager'), async (req, res) => {
  try {
    console.log('Fetching hostels for manager:', req.user.id);
    const hostels = await Hostel.find({ managerId: req.user.id })
      .select('name location description roomTypes facilities isAvailable createdAt hostelViewImage')
      .sort({ createdAt: -1 })
      .lean();
    
    // Remove large images
    const lightHostels = hostels.map(h => ({
      ...h,
      roomImages: undefined,
      bathroomImages: undefined,
      kitchenImages: undefined,
      compoundImages: undefined
    }));
    
    console.log(`Found ${hostels.length} hostels for manager ${req.user.id}`);
    res.json(lightHostels);
  } catch (err) {
    console.error('Error fetching manager hostels:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/hostels/:id', async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid hostel ID' });
    }
    
    const hostel = await Hostel.findById(req.params.id)
      .populate('managerId', 'name email')
      .lean();
    
    if (!hostel) {
      return res.status(404).json({ error: 'Hostel not found' });
    }
    
    res.json(hostel);
  } catch (err) {
    console.error('Error fetching hostel:', err);
    res.status(500).json({ error: 'Failed to fetch hostel' });
  }
});

app.put('/api/hostels/:id', auth, csrfProtection, checkRole('manager'), async (req, res) => {
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
    
    // Handle room type migration
    let updateData = { ...req.body, managerId: req.user.id };
    if (updateData.roomType) {
      const roomTypeMap = {
        'Single': '1 in a Room',
        'Double': '2 in a Room', 
        'Shared': '3 in a Room'
      };
      if (roomTypeMap[updateData.roomType]) {
        updateData.roomType = roomTypeMap[updateData.roomType];
      }
    }
    
    const updatedHostel = await Hostel.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    // Auto-update pending applications with new prices
    if (updateData.roomTypes) {
      const commissionPercent = parseFloat(process.env.ADMIN_COMMISSION_PERCENT) || 3;
      
      for (const roomType of updateData.roomTypes) {
        const hostelFee = roomType.price;
        const adminCommission = Math.round(hostelFee * (commissionPercent / 100));
        const totalAmount = hostelFee + adminCommission;
        
        // Update only pending and approved_for_payment applications (not paid)
        const result = await Application.updateMany(
          {
            hostelId: req.params.id,
            roomType: roomType.type,
            status: { $in: ['pending', 'approved_for_payment'] },
            paymentStatus: 'pending'
          },
          {
            $set: {
              hostelFee,
              adminCommission,
              totalAmount
            }
          }
        );
        
        if (result.modifiedCount > 0) {
          console.log(`Updated ${result.modifiedCount} applications for ${roomType.type} with new price: ${hostelFee}`);
        }
      }
    }
    
    res.json(updatedHostel);
  } catch (err) {
    console.error('Error updating hostel:', err);
    res.status(500).json({ message: err.message || 'Failed to update hostel' });
  }
});

app.delete('/api/hostels/:id', auth, csrfProtection, checkRole('manager'), async (req, res) => {
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
    
    await Hostel.findByIdAndDelete(req.params.id);
    res.json({ message: 'Hostel deleted successfully' });
  } catch (err) {
    console.error('Error deleting hostel:', err);
    res.status(500).json({ message: err.message || 'Failed to delete hostel' });
  }
});

// --- APPLICATION ROUTES ---
// Step 1: Student applies (no payment yet)
app.post('/api/applications', auth, csrfProtection, checkRole('student'), async (req, res) => {
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
    
    console.log('Application created with payment details:', {
      hostelFee,
      adminCommission,
      totalAmount,
      commissionPercent
    });
    
    res.status(201).json(application);
  } catch (err) {
    console.error('Error creating application:', err);
    res.status(500).json({ error: 'Failed to create application' });
  }
});

app.get('/api/applications/student', auth, checkRole('student'), async (req, res) => {
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
      .populate('hostelId', 'name location')
      .sort({ createdAt: -1 })
      .lean();
    res.json(apps);
  } catch (err) {
    console.error('Error fetching student applications:', err);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

app.get('/api/applications/manager', auth, checkRole('manager'), async (req, res) => {
  try {
    console.log('Fetching applications for manager:', req.user.id);
    const { archived } = req.query;
    
    const query = { isArchived: archived === 'true' };

    const apps = await Application.find(query)
        .select('-__v -adminNotes')
        .populate({
          path: 'hostelId',
          match: { managerId: req.user.id },
          select: 'name location'
        })
        .populate('studentId', 'name email')
        .sort({ createdAt: -1 })
        .lean();
    
    // Filter out apps where hostelId is null (not manager's hostels)
    const filteredApps = apps.filter(app => app.hostelId !== null);
    
    console.log(`Found ${filteredApps.length} applications`);
    res.json(filteredApps);
  } catch (err) {
    console.error('Error fetching manager applications:', err);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// Get application statistics for a hostel
app.get('/api/applications/hostel/:hostelId/stats', async (req, res) => {
  try {
    const { hostelId } = req.params;
    
    if (!isValidObjectId(hostelId)) {
      return res.status(400).json({ error: 'Invalid hostel ID' });
    }
    
    const applications = await Application.find({ hostelId, status: { $in: ['pending', 'approved'] } }).lean();
    
    const stats = {};
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

// Step 2 & 6: Manager approves for payment OR final approval
app.patch('/api/applications/:id/status', auth, csrfProtection, checkRole('manager'), async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid application ID' });
    }
    
    const { action } = req.body; // 'approve_for_payment', 'reject', 'final_approve'
    const app = await Application.findById(req.params.id).populate('hostelId');
    
    if (!app) {
      return res.status(404).json({ error: 'Application not found' });
    }
    
    const hostel = await Hostel.findById(app.hostelId._id);
    const roomIndex = hostel.roomTypes.findIndex(r => r.type === app.roomType);
    
    if (roomIndex === -1) {
      return res.status(404).json({ error: 'Room type not found' });
    }
    
    const room = hostel.roomTypes[roomIndex];
    
    if (action === 'approve_for_payment') {
      // Step 2: Approve for payment (no room allocation yet)
      if (app.status !== 'pending') {
        return res.status(400).json({ error: 'Can only approve pending applications' });
      }
      app.status = 'approved_for_payment';
      await app.save();
      return res.json({ message: 'Application approved for payment', application: app });
    }
    
    if (action === 'reject') {
      // Reject application
      app.status = 'rejected';
      await app.save();
      return res.json({ message: 'Application rejected', application: app });
    }
    
    if (action === 'final_approve') {
      // Step 6: Final approval after payment - allocate room
      if (app.status !== 'paid_awaiting_final') {
        return res.status(400).json({ error: 'Can only final approve paid applications' });
      }
      
      // Check room capacity
      if (room.occupiedCapacity >= room.totalCapacity) {
        return res.status(400).json({ 
          error: 'Cannot approve: Room is at full capacity',
          currentOccupancy: room.occupiedCapacity,
          totalCapacity: room.totalCapacity
        });
      }
      
      // Increase occupancy
      hostel.roomTypes[roomIndex].occupiedCapacity = Math.min(
        (room.occupiedCapacity || 0) + 1,
        room.totalCapacity
      );
      hostel.roomTypes[roomIndex].available = hostel.roomTypes[roomIndex].occupiedCapacity < room.totalCapacity;
      await hostel.save();
      
      // Generate secure access code
      const accessCode = generateAccessCode();
      app.status = 'approved';
      app.accessCode = accessCode;
      app.accessCodeIssuedAt = new Date();
      app.finalApprovedAt = new Date();
      await app.save();
      
      return res.json({ 
        message: 'Application finally approved', 
        application: app,
        accessCode,
        roomStatus: {
          occupiedCapacity: hostel.roomTypes[roomIndex].occupiedCapacity,
          totalCapacity: hostel.roomTypes[roomIndex].totalCapacity,
          available: hostel.roomTypes[roomIndex].available
        }
      });
    }
    
    res.status(400).json({ error: 'Invalid action' });
  } catch (err) {
    console.error('Error updating application status:', err);
    res.status(500).json({ error: 'Failed to update application status' });
  }
});

app.delete('/api/applications/:id', auth, csrfProtection, checkRole('student'), async (req, res) => {
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

// Archive/Unarchive application (Manager or Student)
app.patch('/api/applications/:id/archive', auth, csrfProtection, async (req, res) => {
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

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, '0.0.0.0', () => {
  logger.info(`Server started on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    mongoose.connection.close(false, () => {
      logger.info('MongoDB connection closed');
      process.exit(0);
    });
  });
});

// Global error handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip
  });
  res.status(500).json({ error: 'Internal server error' });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err);
  process.exit(1);
});
