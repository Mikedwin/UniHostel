const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');

const migrateUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB Connected');

    // Get all users
    const users = await User.find({});
    console.log(`Found ${users.length} users to migrate`);

    let updated = 0;
    for (const user of users) {
      let needsUpdate = false;

      // Set default accountStatus if not set
      if (!user.accountStatus) {
        user.accountStatus = 'active';
        needsUpdate = true;
      }

      // Auto-verify existing managers (they were already working)
      if (user.role === 'manager' && user.isVerified === undefined) {
        user.isVerified = true;
        needsUpdate = true;
        console.log(`✅ Auto-verified existing manager: ${user.email}`);
      }

      // Auto-verify students and admins
      if ((user.role === 'student' || user.role === 'admin') && user.isVerified === undefined) {
        user.isVerified = true;
        needsUpdate = true;
      }

      // Initialize empty login history if not exists
      if (!user.loginHistory) {
        user.loginHistory = [];
        needsUpdate = true;
      }

      // Set passwordResetRequired to false if not set
      if (user.passwordResetRequired === undefined) {
        user.passwordResetRequired = false;
        needsUpdate = true;
      }

      if (needsUpdate) {
        await user.save();
        updated++;
      }
    }

    console.log(`\n✅ Migration complete!`);
    console.log(`   - Total users: ${users.length}`);
    console.log(`   - Updated: ${updated}`);
    console.log(`   - All existing managers are verified and active`);
    console.log(`   - All existing students are active`);
    
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
};

migrateUsers();
