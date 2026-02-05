const mongoose = require('mongoose');

const securityLogSchema = new mongoose.Schema({
  ip: { type: String, required: true, index: true },
  attackType: { type: String, required: true },
  severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  method: String,
  url: String,
  payload: String,
  userAgent: String,
  blocked: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now, index: true }
});

securityLogSchema.index({ timestamp: -1 });
securityLogSchema.index({ ip: 1, timestamp: -1 });

module.exports = mongoose.model('SecurityLog', securityLogSchema);
