const mongoose = require('mongoose');

// Clear any existing model to avoid caching issues
if (mongoose.models.Hostel) {
  delete mongoose.models.Hostel;
}
if (mongoose.connection.models.Hostel) {
  delete mongoose.connection.models.Hostel;
}

const roomTypeSchema = new mongoose.Schema({
  type: { type: String, enum: ['1 in a Room', '2 in a Room', '3 in a Room', '4 in a Room'], required: true },
  price: { type: Number, required: true },
  gender: { type: String, enum: ['Male', 'Female', ''], default: '', required: false },
  roomImage: { type: String, required: false },
  roomImages: [{ type: String }],
  virtualTourUrl: { type: String },
  facilities: [String],
  totalCapacity: { type: Number, required: true, min: 1 },
  occupiedCapacity: { type: Number, default: 0 },
  available: { type: Boolean, default: true }
});

const hostelSchema = new mongoose.Schema({
  managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true },
  location: { type: String, required: true },
  hostelViewImage: { type: String, required: false },
  hostelImages: [{ type: String }],
  virtualTourUrl: { type: String },
  description: { type: String, required: true },
  roomTypes: [roomTypeSchema],
  isAvailable: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true },
  isFlagged: { type: Boolean, default: false },
  flagReason: { type: String },
  createdAt: { type: Date, default: Date.now }
});

hostelSchema.index({ managerId: 1, createdAt: -1 });

// Middleware to auto-update availability based on capacity
roomTypeSchema.pre('save', function(next) {
  this.available = this.occupiedCapacity < this.totalCapacity;
  next();
});

module.exports = mongoose.model('Hostel', hostelSchema);
