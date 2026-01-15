const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Hostel = require('./models/Hostel');
const Application = require('./models/Application');

const ensureIndexes = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ MongoDB Connected\n');

    console.log('Creating indexes...');
    
    await User.createIndexes();
    console.log('✅ User indexes created');
    
    await Hostel.createIndexes();
    console.log('✅ Hostel indexes created');
    
    await Application.createIndexes();
    console.log('✅ Application indexes created');

    console.log('\n📊 Listing all indexes:\n');
    
    const userIndexes = await User.collection.getIndexes();
    console.log('User indexes:', Object.keys(userIndexes));
    
    const hostelIndexes = await Hostel.collection.getIndexes();
    console.log('Hostel indexes:', Object.keys(hostelIndexes));
    
    const appIndexes = await Application.collection.getIndexes();
    console.log('Application indexes:', Object.keys(appIndexes));

    console.log('\n✅ All indexes created successfully!');
    console.log('This will improve query performance significantly.');
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
};

ensureIndexes();
