// Script to update existing applications with 3% commission
// Run this once to fix applications created before commission was set to 3%

const mongoose = require('mongoose');
require('dotenv').config();

const Application = require('./models/Application');
const Hostel = require('./models/Hostel');

const updateApplicationCommissions = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/unihostel');
    console.log('Connected to MongoDB');

    const applications = await Application.find({}).populate('hostelId');
    console.log(`Found ${applications.length} applications to check`);

    let updated = 0;
    const commissionPercent = 3; // 3% commission

    for (const app of applications) {
      if (!app.hostelId) {
        console.log(`Skipping application ${app._id} - hostel not found`);
        continue;
      }

      const hostel = app.hostelId;
      const room = hostel.roomTypes.find(r => r.type === app.roomType);
      
      if (!room) {
        console.log(`Skipping application ${app._id} - room type not found`);
        continue;
      }

      const hostelFee = room.price;
      const adminCommission = Math.round(hostelFee * (commissionPercent / 100));
      const totalAmount = hostelFee + adminCommission;

      // Update if values are different
      if (app.hostelFee !== hostelFee || app.adminCommission !== adminCommission || app.totalAmount !== totalAmount) {
        app.hostelFee = hostelFee;
        app.adminCommission = adminCommission;
        app.totalAmount = totalAmount;
        await app.save();
        updated++;
        console.log(`Updated application ${app._id}: Fee=${hostelFee}, Commission=${adminCommission}, Total=${totalAmount}`);
      }
    }

    console.log(`\nUpdate complete: ${updated} applications updated`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

updateApplicationCommissions();
