const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  hostelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hostel', required: true, index: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  roomType: { type: String, enum: ['1 in a Room', '2 in a Room', '3 in a Room', '4 in a Room'], required: true },
  status: { 
    type: String, 
    enum: ['pending', 'approved_for_payment', 'paid_awaiting_final', 'approved', 'rejected'], 
    default: 'pending', 
    index: true 
  },
  semester: { type: String, enum: ['First Semester', 'Second Semester'], required: true },
  studentName: { type: String, required: true },
  contactNumber: { type: String, required: true },
  message: String,
  createdAt: { type: Date, default: Date.now },
  
  // Admin intervention fields
  adminOverride: { type: Boolean, default: false },
  overriddenBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  overrideReason: String,
  overrideTimestamp: Date,
  
  // Dispute handling
  hasDispute: { type: Boolean, default: false, index: true },
  disputeReason: String,
  disputeDetails: String,
  disputeStatus: { type: String, enum: ['open', 'under_review', 'resolved'], default: 'open' },
  disputeResolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  disputeResolvedAt: Date,
  disputeResolution: String,
  
  // Internal admin notes
  adminNotes: [{
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    note: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    visibleToManager: { type: Boolean, default: false }
  }],
  
  // Payment tracking
  paymentStatus: { type: String, enum: ['pending', 'paid', 'refunded', 'failed'], default: 'pending' },
  hostelFee: Number,
  adminCommission: Number,
  totalAmount: Number,
  paymentReference: String,
  paidAt: Date,
  refundStatus: { type: String, enum: ['not_applicable', 'pending', 'completed', 'failed'], default: 'not_applicable' },
  refundAmount: Number,
  refundProcessedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  refundProcessedAt: Date,
  
  // Access code (issued after final approval)
  accessCode: { type: String, unique: true, sparse: true },
  accessCodeIssuedAt: Date,
  finalApprovedAt: Date
});

applicationSchema.index({ hostelId: 1, createdAt: -1 });
applicationSchema.index({ studentId: 1, createdAt: -1 });
applicationSchema.index({ hasDispute: 1, disputeStatus: 1 });
applicationSchema.index({ status: 1, paymentStatus: 1 });

module.exports = mongoose.model('Application', applicationSchema);
