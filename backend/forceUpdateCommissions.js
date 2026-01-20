const mongoose = require('mongoose');
require('dotenv').config();

const Application = require('./models/Application');
const Hostel = require('./models/Hostel');

const forceUpdateAll = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/unihostel');
    console.log('Connected to MongoDB');

    const applications = await Application.find({}).populate('hostelId');
    console.log(`Found ${applications.length} applications`);

    const commissionPercent = 3;
    let updated = 0;

    for (const app of applications) {
      if (!app.hostelId) {
        console.log(`Skipping ${app._id} - no hostel`);
        continue;
      }

      const room = app.hostelId.roomTypes.find(r => r.type === app.roomType);
      if (!room) {
        console.log(`Skipping ${app._id} - no room`);
        continue;
      }

      const hostelFee = room.price;
      const adminCommission = Math.round(hostelFee * (commissionPercent / 100));
      const totalAmount = hostelFee + adminCommission;

      // FORCE UPDATE EVERY APPLICATION
      app.hostelFee = hostelFee;
      app.adminCommission = adminCommission;
      app.totalAmount = totalAmount;
      await app.save();
      updated++;
      
      console.log(`Updated ${app._id}: Room=${hostelFee}, Commission=${adminCommission} (3%), Total=${totalAmount}`);
    }

    console.log(`\nForce update complete: ${updated} applications updated`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

forceUpdateAll();
