const mongoose = require('mongoose');

const adminLogSchema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true },
  targetType: { type: String, enum: ['hostel', 'room', 'application', 'user'], required: true },
  targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
  details: { type: String },
  timestamp: { type: Date, default: Date.now }
});

adminLogSchema.index({ adminId: 1, timestamp: -1 });
adminLogSchema.index({ targetType: 1, targetId: 1 });

module.exports = mongoose.model('AdminLog', adminLogSchema);
