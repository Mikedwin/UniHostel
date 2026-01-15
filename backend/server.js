// Git test change
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

const app = express();
app.use(express.json({ limit: '5gb' }));
app.use(express.urlencoded({ limit: '5gb', extended: true }));
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL] 
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
    const newUser = new User({ name, email, password: hashedPassword, role: role || 'student' });
    await newUser.save();
    console.log('User created successfully:', newUser._id);

    const token = jwt.sign({ id: newUser._id, role: newUser.role }, process.env.JWT_SECRET);
    res.json({ token, user: { id: newUser._id, name, email, role: newUser.role } });
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

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
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
    const hostels = await Hostel.find({ managerId: req.user.id });
    res.json(hostels);
  } catch (err) {
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
app.post('/api/applications', auth, checkRole('student'), async (req, res) => {
  try {
    const { hostelId, roomType, semester, studentName, contactNumber } = req.body;
    
    // Check if room has capacity
    const hostel = await Hostel.findById(hostelId);
    if (!hostel) {
      return res.status(404).json({ error: 'Hostel not found' });
    }
    
    const room = hostel.roomTypes.find(r => r.type === roomType);
    if (!room) {
      return res.status(404).json({ error: 'Room type not found' });
    }
    
    if (room.occupiedCapacity >= room.totalCapacity) {
      return res.status(400).json({ error: 'This room type is fully booked' });
    }
    
    const application = new Application({
      hostelId,
      studentId: req.user.id,
      roomType,
      semester,
      studentName,
      contactNumber
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
    // Find hostels managed by this user
    const managedHostels = await Hostel.find({ managerId: req.user.id }).select('_id');
    const hostelIds = managedHostels.map(h => h._id);

    const apps = await Application.find({ hostelId: { $in: hostelIds } })
        .populate('hostelId')
        .populate('studentId', 'name email');
    res.json(apps);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/applications/:id', auth, checkRole('manager'), async (req, res) => {
    try {
        const { status } = req.body;
        const app = await Application.findById(req.params.id).populate('hostelId');
        
        if (!app) {
          return res.status(404).json({ error: 'Application not found' });
        }
        
        // If approving, increase occupied capacity
        if (status === 'approved' && app.status !== 'approved') {
          const hostel = await Hostel.findById(app.hostelId._id);
          const roomIndex = hostel.roomTypes.findIndex(r => r.type === app.roomType);
          
          if (roomIndex !== -1) {
            hostel.roomTypes[roomIndex].occupiedCapacity += 1;
            hostel.roomTypes[roomIndex].available = hostel.roomTypes[roomIndex].occupiedCapacity < hostel.roomTypes[roomIndex].totalCapacity;
            await hostel.save();
          }
        }
        
        // If rejecting a previously approved application, decrease occupied capacity
        if (status === 'rejected' && app.status === 'approved') {
          const hostel = await Hostel.findById(app.hostelId._id);
          const roomIndex = hostel.roomTypes.findIndex(r => r.type === app.roomType);
          
          if (roomIndex !== -1 && hostel.roomTypes[roomIndex].occupiedCapacity > 0) {
            hostel.roomTypes[roomIndex].occupiedCapacity -= 1;
            hostel.roomTypes[roomIndex].available = hostel.roomTypes[roomIndex].occupiedCapacity < hostel.roomTypes[roomIndex].totalCapacity;
            await hostel.save();
          }
        }
        
        app.status = status;
        await app.save();
        res.json(app);
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}`);
});
