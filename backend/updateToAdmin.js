const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');

const updateToAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB Connected');

    const adminEmail = process.env.ADMIN_EMAIL;
    const user = await User.findOne({ email: adminEmail });

    if (!user) {
      console.log('User not found. Run npm run init-admin first.');
      process.exit(1);
    }

    user.role = 'admin';
    await user.save();

    console.log('✅ User updated to admin role successfully!');
    console.log(`Email: ${adminEmail}`);
    console.log(`Role: ${user.role}`);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
};

updateToAdmin();
