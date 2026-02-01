require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const updateSubaccount = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected!');

    const managerEmail = '3mikedwin@gmail.com';
    const subaccountCode = 'ACCT_os10xo60waln5n7';

    console.log(`\nSearching for manager: ${managerEmail}`);
    const manager = await User.findOne({ email: managerEmail, role: 'manager' });

    if (!manager) {
      console.log('❌ Manager not found!');
      process.exit(1);
    }

    console.log('✅ Manager found:', manager.name);
    console.log('Current subaccount code:', manager.paystackSubaccountCode);

    manager.paystackSubaccountCode = subaccountCode;
    manager.payoutEnabled = true;
    await manager.save();

    console.log('\n✅ SUCCESS! Subaccount updated!');
    console.log('New subaccount code:', manager.paystackSubaccountCode);
    console.log('Payout enabled:', manager.payoutEnabled);
    console.log('\n🎉 Automatic payment splits are now active!');
    console.log('When students pay, 10% goes to you, 90% to manager automatically.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

updateSubaccount();
