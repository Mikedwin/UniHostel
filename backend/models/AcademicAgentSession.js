const mongoose = require('mongoose');

const citationSchema = new mongoose.Schema({
  sourceId: { type: String, required: true },
  title: { type: String, required: true },
  url: { type: String },
  year: { type: Number },
  doi: { type: String },
  provider: { type: String },
  summary: { type: String }
}, { _id: false });

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'agent', 'system'],
    required: true
  },
  content: { type: String, required: true, maxlength: 10000 },
  createdAt: { type: Date, default: Date.now }
}, { _id: false });

const academicAgentSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true, maxlength: 180 },
  mode: {
    type: String,
    enum: ['research', 'assignment', 'thesis', 'report', 'tutor'],
    default: 'assignment',
    index: true
  },
  skillLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'intermediate'
  },
  messages: [messageSchema],
  plans: [{ type: String, maxlength: 300 }],
  citations: [citationSchema],
  lastOutput: { type: mongoose.Schema.Types.Mixed },
  archived: { type: Boolean, default: false, index: true }
}, { timestamps: true });

academicAgentSessionSchema.index({ userId: 1, updatedAt: -1 });
academicAgentSessionSchema.index({ userId: 1, archived: 1, updatedAt: -1 });

module.exports = mongoose.model('AcademicAgentSession', academicAgentSessionSchema);
