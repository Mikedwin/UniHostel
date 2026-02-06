const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema({
  ip: { type: String, required: true, index: true },
  userAgent: String,
  device: String,
  browser: String,
  os: String,
  url: String,
  method: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userRole: String,
  timestamp: { type: Date, default: Date.now, index: true }
});

visitorSchema.index({ timestamp: -1 });
visitorSchema.index({ ip: 1, timestamp: -1 });
visitorSchema.index({ userId: 1, timestamp: -1 });

module.exports = mongoose.model('Visitor', visitorSchema);
