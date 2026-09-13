require('dotenv').config();
const mongoose = require('mongoose');
const Hostel = require('./models/Hostel');

async function fixRoomAvailability() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB\n');
    
    const hostels = await Hostel.find({ isDeleted: { $ne: true } });
    
    let updatedCount = 0;
    
    for (const hostel of hostels) {
      let needsUpdate = false;
      
      hostel.roomTypes.forEach(room => {
        const occupiedCapacity = room.occupiedCapacity || 0;
        const totalCapacity = room.totalCapacity || 0;
        const shouldBeAvailable = occupiedCapacity < totalCapacity;
        
        if (room.available !== shouldBeAvailable) {
          console.log(`Fixing ${hostel.name} - ${room.type}: ${occupiedCapacity}/${totalCapacity}`);
          room.available = shouldBeAvailable;
          needsUpdate = true;
        }
      });
      
      if (needsUpdate) {
        await hostel.save();
        updatedCount++;
      }
    }
    
    console.log(`\n✓ Fixed ${updatedCount} hostel(s)`);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

fixRoomAvailability();

