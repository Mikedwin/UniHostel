const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  hostelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hostel', required: true, index: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  roomType: { type: String, enum: ['1 in a Room', '2 in a Room', '3 in a Room', '4 in a Room'], required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true },
  semester: { type: String, enum: ['First Semester', 'Second Semester'], required: true },
  studentName: { type: String, required: true },
  contactNumber: { type: String, required: true },
  message: String,
  createdAt: { type: Date, default: Date.now }
});

applicationSchema.index({ hostelId: 1, createdAt: -1 });
applicationSchema.index({ studentId: 1, createdAt: -1 });

module.exports = mongoose.model('Application', applicationSchema);
