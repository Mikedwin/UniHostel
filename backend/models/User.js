const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'manager', 'admin'], default: 'student' },
  isActive: { type: Boolean, default: true },
  accountStatus: { type: String, enum: ['active', 'suspended', 'banned', 'pending_verification'], default: 'active' },
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String },
  verificationTokenExpires: { type: Date },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  suspensionReason: { type: String },
  suspensionNote: { type: String },
  suspendedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  suspendedAt: { type: Date },
  lastLogin: { type: Date },
  loginHistory: [{
    timestamp: { type: Date, default: Date.now },
    ipAddress: { type: String },
    userAgent: { type: String }
  }],
  passwordResetRequired: { type: Boolean, default: false },
  temporaryPassword: { type: String },
  securityQuestion: { type: String },
  securityAnswer: { type: String },
  failedLoginAttempts: { type: Number, default: 0 },
  accountLockedUntil: { type: Date },
  lastFailedLogin: { type: Date },
  tosAccepted: { type: Boolean, default: false },
  tosAcceptedAt: { type: Date },
  privacyPolicyAccepted: { type: Boolean, default: false },
  privacyPolicyAcceptedAt: { type: Date },
  // Mobile Money for Manager Payouts
  momoProvider: { type: String, enum: ['MTN', 'Vodafone', 'AirtelTigo', null], default: null },
  momoNumber: { type: String },
  momoAccountName: { type: String },
  paystackSubaccountCode: { type: String },
  paystackSubaccountId: { type: String },
  payoutEnabled: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date },
  deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

userSchema.index({ email: 1 });
userSchema.index({ role: 1, accountStatus: 1 });
userSchema.index({ lastLogin: -1 });
userSchema.index({ createdAt: -1 });

module.exports = mongoose.model('User', userSchema);
