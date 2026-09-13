const mongoose = require('mongoose');
require('dotenv').config();

const Hostel = require('./models/Hostel');
const Application = require('./models/Application');

const fixApplicationPrices = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const commissionPercent = parseFloat(process.env.ADMIN_COMMISSION_PERCENT) || 3;
    console.log(`Using commission rate: ${commissionPercent}%\n`);

    // Get all applications (including those with prices to recalculate)
    const applications = await Application.find({}).populate('hostelId');

    console.log(`Found ${applications.length} applications to update\n`);

    let updated = 0;
    let failed = 0;

    for (const app of applications) {
      try {
        if (!app.hostelId) {
          console.log(`⚠️  Skipping application ${app._id} - hostel not found`);
          failed++;
          continue;
        }

        const room = app.hostelId.roomTypes.find(r => r.type === app.roomType);
        if (!room) {
          console.log(`⚠️  Skipping application ${app._id} - room type not found`);
          failed++;
          continue;
        }

        const hostelFee = room.price;
        const adminCommission = Math.round(hostelFee * (commissionPercent / 100));
        const totalAmount = hostelFee + adminCommission;

        app.hostelFee = hostelFee;
        app.adminCommission = adminCommission;
        app.totalAmount = totalAmount;
        await app.save();

        console.log(`✅ Updated application ${app._id}`);
        console.log(`   Hostel: ${app.hostelId.name}`);
        console.log(`   Room: ${app.roomType}`);
        console.log(`   Fee: GH₵${hostelFee}, Commission: GH₵${adminCommission}, Total: GH₵${totalAmount}\n`);
        updated++;
      } catch (err) {
        console.log(`❌ Failed to update application ${app._id}: ${err.message}`);
        failed++;
      }
    }

    console.log('\n=== Summary ===');
    console.log(`✅ Successfully updated: ${updated}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📊 Total processed: ${applications.length}`);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

fixApplicationPrices();

