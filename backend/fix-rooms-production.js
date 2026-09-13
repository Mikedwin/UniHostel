// Run this script to fix room availability in production database
// Usage: node fix-rooms-production.js

const axios = require('axios');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function fixRooms() {
  console.log('=== Fix Room Availability Tool ===\n');
  
  const apiUrl = await question('Enter backend URL (default: https://unihostel.onrender.com): ');
  const backendUrl = apiUrl.trim() || 'https://unihostel.onrender.com';
  
  const token = await question('Enter your admin JWT token: ');
  
  if (!token.trim()) {
    console.error('❌ Token is required!');
    rl.close();
    return;
  }
  
  console.log('\n🔧 Fixing room availability...\n');
  
  try {
    const response = await axios.post(
      `${backendUrl}/api/admin/fix-room-availability`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${token.trim()}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ SUCCESS!\n');
    console.log(`Fixed ${response.data.updatedCount} hostel(s)\n`);
    
    if (response.data.fixes && response.data.fixes.length > 0) {
      console.log('Changes made:');
      console.log('─'.repeat(60));
      response.data.fixes.forEach(fix => {
        console.log(`\n📍 ${fix.hostel} - ${fix.roomType}`);
        console.log(`   Occupancy: ${fix.occupancy}`);
        console.log(`   Changed: ${fix.wasAvailable ? 'Available' : 'Full'} → ${fix.nowAvailable ? 'Available' : 'Full'}`);
      });
      console.log('\n' + '─'.repeat(60));
    } else {
      console.log('ℹ️  All rooms already have correct availability status');
    }
    
  } catch (error) {
    console.error('❌ ERROR:', error.response?.data?.error || error.message);
    if (error.response?.status === 401) {
      console.error('\n⚠️  Authentication failed. Make sure you:');
      console.error('   1. Are logged in as admin');
      console.error('   2. Copied the correct token from Local Storage');
    }
  }
  
  rl.close();
}

fixRooms();
