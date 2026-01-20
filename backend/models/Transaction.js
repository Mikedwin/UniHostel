const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true, index: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  hostelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hostel', required: true, index: true },
  managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  
  // Payment details
  hostelFee: { type: Number, required: true },
  adminCommission: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  
  // Transaction metadata
  roomType: { type: String, required: true },
  semester: { type: String, required: true },
  paymentReference: { type: String, required: true, unique: true },
  paymentStatus: { type: String, enum: ['paid', 'refunded'], default: 'paid', index: true },
  
  // Timestamps
  paidAt: { type: Date, default: Date.now, index: true },
  refundedAt: Date,
  
  createdAt: { type: Date, default: Date.now }
});

// Indexes for efficient queries
transactionSchema.index({ managerId: 1, paidAt: -1 });
transactionSchema.index({ semester: 1, paidAt: -1 });
transactionSchema.index({ hostelId: 1, semester: 1 });
transactionSchema.index({ paymentStatus: 1, paidAt: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);
