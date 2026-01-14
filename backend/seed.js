const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Hostel = require('./models/Hostel');

const sampleUsers = [
  {
    name: 'John Manager',
    email: 'manager@test.com',
    password: 'password123',
    role: 'manager'
  },
  {
    name: 'Jane Student',
    email: 'student@test.com',
    password: 'password123',
    role: 'student'
  }
];

const sampleHostels = [
  {
    name: 'Sunrise Student Residence',
    location: 'Downtown Campus Area',
    price: 2500,
    roomType: 'Single',
    facilities: ['WiFi', 'AC', 'Laundry', 'Security', 'Study Room'],
    description: 'Modern student accommodation with all amenities. Located just 5 minutes walk from the main campus.',
    images: ['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80'],
    isAvailable: true
  },
  {
    name: 'Campus View Hostel',
    location: 'University District',
    price: 2200,
    roomType: 'Double',
    facilities: ['WiFi', 'Kitchen', 'Parking', 'Common Area', 'Hot Water'],
    description: 'Affordable shared accommodation with great campus views. Perfect for students on a budget.',
    images: ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80'],
    isAvailable: true
  },
  {
    name: 'Elite Student Suites',
    location: 'North Campus',
    price: 3200,
    roomType: 'Single',
    facilities: ['WiFi', 'AC', 'Gym', 'Furnished', 'Cleaning Service', 'Security'],
    description: 'Premium student housing with luxury amenities. Fully furnished with modern facilities.',
    images: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80'],
    isAvailable: true
  }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/unihostel');
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Hostel.deleteMany({});
    console.log('Cleared existing data');

    // Create users
    const hashedUsers = await Promise.all(
      sampleUsers.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, 10)
      }))
    );

    const createdUsers = await User.insertMany(hashedUsers);
    console.log('Created sample users');

    // Find manager user
    const manager = createdUsers.find(user => user.role === 'manager');

    // Create hostels
    const hostelsWithManager = sampleHostels.map(hostel => ({
      ...hostel,
      managerId: manager._id
    }));

    await Hostel.insertMany(hostelsWithManager);
    console.log('Created sample hostels');

    console.log('\n=== Sample Data Created ===');
    console.log('Manager Login:');
    console.log('Email: manager@test.com');
    console.log('Password: password123');
    console.log('\nStudent Login:');
    console.log('Email: student@test.com');
    console.log('Password: password123');
    console.log('========================\n');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();