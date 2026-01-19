const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const User = require('./models/User');
const Hostel = require('./models/Hostel');
const Application = require('./models/Application');
const { auth, checkRole } = require('./middleware/auth');
const adminRoutes = require('./routes/admin');
const paymentRoutes = require('./routes/payment');

const app = express();
app.use(express.json({ limit: '5gb' }));
app.use(express.urlencoded({ limit: '5gb', extended: true }));
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://uni-hostel-two.vercel.app', process.env.FRONTEND_URL] 
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Database Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/unihostel', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log('MongoDB Error:', err));

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'UniHostel API is running',
    timestamp: new Date().toISOString()
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

// Payment routes
app.use('/api/payment', paymentRoutes);

// --- AUTH ROUTES ---
app.post('/api/auth/register', async (req, res) => {
  try {
    console.log('Registration attempt:', req.body);
    const { name, email, password, role } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = role || 'student';
    
    // New managers need verification, students and existing users don't
    const newUser = new User({ 
      name, 
      email, 
      password: hashedPassword, 
      role: userRole,
      isVerified: userRole === 'manager' ? false : true,
      accountStatus: userRole === 'manager' ? 'pending_verification' : 'active'
    });
    await newUser.save();
    console.log('User created successfully:', newUser._id);

    const token = jwt.sign({ id: newUser._id, role: newUser.role }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.json({ 
      token, 
      user: { id: newUser._id, name, email, role: newUser.role },
      needsVerification: userRole === 'manager' && !newUser.isVerified
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: err.message || 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User does not exist' });

    // Check account status
    if (user.accountStatus === 'suspended') {
      return res.status(403).json({ message: `Account suspended. Reason: ${user.suspensionReason || 'Contact admin'}` });
    }
    if (user.accountStatus === 'banned') {
      return res.status(403).json({ message: `Account banned. Reason: ${user.suspensionReason || 'Contact admin'}` });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

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

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.json({ 
      token, 
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      passwordResetRequired: user.passwordResetRequired
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- HOSTEL ROUTES ---
app.get('/api/hostels', async (req, res) => {
  try {
    const { location, maxPrice, search } = req.query;
    let query = { isAvailable: true };
    
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }
    
    if (maxPrice) {
      query.price = { $lte: Number(maxPrice) };
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { facilities: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const hostels = await Hostel.find(query).populate('managerId', 'name email').sort({ createdAt: -1 });
    res.json(hostels);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/hostels', auth, checkRole('manager'), async (req, res) => {
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
    const hostels = await Hostel.find({ managerId: req.user.id }).sort({ createdAt: -1 }).lean();
    console.log(`Found ${hostels.length} hostels for manager ${req.user.id}`);
    res.json(hostels);
  } catch (err) {
    console.error('Error fetching manager hostels:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/hostels/:id', async (req, res) => {
  try {
    const hostel = await Hostel.findById(req.params.id).populate('managerId', 'name email');
    res.json(hostel);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/hostels/:id', auth, checkRole('manager'), async (req, res) => {
  try {
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
      // Map old values to new values if needed
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
    
    res.json(updatedHostel);
  } catch (err) {
    console.error('Error updating hostel:', err);
    res.status(500).json({ message: err.message || 'Failed to update hostel' });
  }
});

app.delete('/api/hostels/:id', auth, checkRole('manager'), async (req, res) => {
  try {
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
app.post('/api/applications', auth, checkRole('student'), async (req, res) => {
  try {
    const { hostelId, roomType, semester, studentName, contactNumber } = req.body;
    
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
    const commissionPercent = parseFloat(process.env.ADMIN_COMMISSION_PERCENT) || 10;
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
    res.status(201).json(application);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/applications/student', auth, checkRole('student'), async (req, res) => {
  try {
    const apps = await Application.find({ studentId: req.user.id }).populate('hostelId');
    res.json(apps);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/applications/manager', auth, checkRole('manager'), async (req, res) => {
  try {
    console.log('Fetching applications for manager:', req.user.id);
    const { archived } = req.query;
    const managedHostels = await Hostel.find({ managerId: req.user.id }).select('_id').lean();
    const hostelIds = managedHostels.map(h => h._id);
    console.log(`Manager has ${hostelIds.length} hostels`);

    const query = { hostelId: { $in: hostelIds } };
    if (archived === 'true') {
      query.isArchived = true;
    } else {
      query.isArchived = { $ne: true };
    }

    const apps = await Application.find(query)
        .populate('hostelId', 'name location')
        .populate('studentId', 'name email')
        .sort({ createdAt: -1 })
        .lean();
    console.log(`Found ${apps.length} applications`);
    res.json(apps);
  } catch (err) {
    console.error('Error fetching manager applications:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get application statistics for a hostel
app.get('/api/applications/hostel/:hostelId/stats', async (req, res) => {
  try {
    const { hostelId } = req.params;
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
    res.status(500).json({ error: err.message });
  }
});

// Step 2 & 6: Manager approves for payment OR final approval
app.patch('/api/applications/:id/status', auth, checkRole('manager'), async (req, res) => {
  try {
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
      
      // Generate access code
      const accessCode = `UNI-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
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
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/applications/:id', auth, checkRole('student'), async (req, res) => {
    try {
        const app = await Application.findById(req.params.id);
        if (!app) {
            return res.status(404).json({ message: 'Application not found' });
        }
        
        if (app.studentId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to cancel this application' });
        }
        
        await Application.findByIdAndDelete(req.params.id);
        res.json({ message: 'Application cancelled successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Archive/Unarchive application (Manager only)
app.patch('/api/applications/:id/archive', auth, checkRole('manager'), async (req, res) => {
  try {
    const { archive } = req.body;
    const app = await Application.findById(req.params.id).populate('hostelId');
    
    if (!app) {
      return res.status(404).json({ error: 'Application not found' });
    }
    
    const hostel = await Hostel.findById(app.hostelId._id);
    if (hostel.managerId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    app.isArchived = archive;
    app.archivedAt = archive ? new Date() : null;
    app.archivedBy = archive ? req.user.id : null;
    await app.save();
    
    res.json({ message: archive ? 'Application archived' : 'Application restored', application: app });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}`);
});
