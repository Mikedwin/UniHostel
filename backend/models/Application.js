const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  hostelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hostel', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  roomType: { type: String, enum: ['1 in a Room', '2 in a Room', '3 in a Room', '4 in a Room'], required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  semester: { type: String, enum: ['First Semester', 'Second Semester'], required: true },
  studentName: { type: String, required: true },
  contactNumber: { type: String, required: true },
  message: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Application', applicationSchema);
