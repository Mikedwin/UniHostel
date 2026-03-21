require('dotenv').config();
const mongoose = require('mongoose');
const Hostel = require('./models/Hostel');

async function checkRoomAvailability() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB\n');
    
    const hostels = await Hostel.find({ isDeleted: { $ne: true } })
      .select('name roomTypes')
      .lean();
    
    console.log('=== ROOM AVAILABILITY CHECK ===\n');
    
    hostels.forEach(hostel => {
      console.log(`Hostel: ${hostel.name}`);
      hostel.roomTypes.forEach(room => {
        const occupied = room.occupiedCapacity || 0;
        const total = room.totalCapacity || 0;
        const shouldBeAvailable = occupied < total;
        const actuallyAvailable = room.available;
        const match = shouldBeAvailable === actuallyAvailable ? '✓' : '✗ MISMATCH!';
        
        console.log(`  ${room.type}:`);
        console.log(`    Occupied: ${occupied} / Total: ${total}`);
        console.log(`    Should be available: ${shouldBeAvailable}`);
        console.log(`    Actually available: ${actuallyAvailable} ${match}`);
      });
      console.log('');
    });
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkRoomAvailability();

