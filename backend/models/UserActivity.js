const mongoose = require('mongoose');

const userActivitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true },
  details: { type: Object },
  ipAddress: { type: String },
  userAgent: { type: String },
  timestamp: { type: Date, default: Date.now }
});

userActivitySchema.index({ userId: 1, timestamp: -1 });
userActivitySchema.index({ action: 1 });

module.exports = mongoose.model('UserActivity', userActivitySchema);
