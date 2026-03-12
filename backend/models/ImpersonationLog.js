const mongoose = require('mongoose');

const impersonationLogSchema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date },
  actionsPerformed: [{ type: String }],
  reason: { type: String }
});

impersonationLogSchema.index({ adminId: 1, startTime: -1 });
impersonationLogSchema.index({ targetUserId: 1 });

module.exports = mongoose.model('ImpersonationLog', impersonationLogSchema);
