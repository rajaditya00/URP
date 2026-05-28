const mongoose = require('mongoose');

const classSessionSchema = new mongoose.Schema({
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  college: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true },
  department: { type: String, required: true },
  semester: { type: String, required: true },
  batch: { type: String, default: 'All' },
  subject: { type: String, required: true },
  date: { type: String, required: true }, // e.g. '2026-05-28'
  time: { type: String, required: true }, // e.g. '10:00 AM'
  duration: { type: Number, required: true }, // in minutes
  status: { type: String, enum: ['scheduled', 'completed', 'cancelled'], default: 'scheduled' },
  topicPlanned: { type: String },
  topicCovered: { type: String },
  cancellationReason: { type: String },
  completedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ClassSession', classSessionSchema);
