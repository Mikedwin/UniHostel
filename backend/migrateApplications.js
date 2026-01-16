const mongoose = require('mongoose');
require('dotenv').config();

const Application = require('./models/Application');

async function migrateApplications() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    const result = await Application.updateMany(
      {},
      {
        $set: {
          adminOverride: false,
          hasDispute: false,
          disputeStatus: 'open',
          paymentStatus: 'pending',
          refundStatus: 'not_applicable',
          adminNotes: []
        }
      }
    );

    console.log(`Migration completed: ${result.modifiedCount} applications updated`);
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrateApplications();
