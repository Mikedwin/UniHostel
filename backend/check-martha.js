require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const User = require('./models/User');

async function checkMartha() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to database');
    
    const martha = await User.findOne({ 
      $or: [
        { name: /martha.*edwin/i },
        { email: /martha/i }
      ],
      role: 'manager'
    });
    
    if (!martha) {
      console.log('❌ Martha Edwin not found');
      return;
    }
    
    console.log('\n=== MARTHA EDWIN ACCOUNT ===');
    console.log('Name:', martha.name);
    console.log('Email:', martha.email);
    console.log('Paystack Subaccount Code:', martha.paystackSubaccountCode || '❌ NOT SET');
    console.log('Payout Enabled:', martha.payoutEnabled || false);
    console.log('Account Status:', martha.accountStatus);
    console.log('Verified:', martha.isVerified);
    
    if (!martha.paystackSubaccountCode) {
      console.log('\n⚠️ PROBLEM: No subaccount code set!');
      console.log('This is why she didn\'t receive payment.');
    } else if (!martha.payoutEnabled) {
      console.log('\n⚠️ PROBLEM: Payout not enabled!');
    } else {
      console.log('\n✅ Subaccount configured correctly');
    }
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    mongoose.connection.close();
  }
}

checkMartha();
