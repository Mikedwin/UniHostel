const mongoose = require('mongoose');

const bannedIpSchema = new mongoose.Schema({
  ip: { type: String, required: true, unique: true, index: true },
  reason: { type: String, required: true },
  attackType: { type: String, enum: ['sql_injection', 'xss', 'unauthorized_access', 'brute_force', 'suspicious_pattern'], required: true },
  attempts: { type: Number, default: 1 },
  bannedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date }, // Optional: auto-unban after X days
  userAgent: String,
  lastAttempt: { type: Date, default: Date.now }
});

bannedIpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Auto-delete expired bans

module.exports = mongoose.model('BannedIp', bannedIpSchema);
