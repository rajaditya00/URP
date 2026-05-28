const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  college: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true },
  department: { type: String, required: true },
  semester: { type: String, required: true }, // e.g. 'Sem 1', 'Sem 2' ... 'Sem 8'
  title: { type: String, required: true },
  description: { type: String },
  date: { type: String }, // e.g. '2026-06-01'
  time: { type: String }, // e.g. '10:00 AM - 11:30 AM'
  type: { type: String, enum: ['Class', 'Exam', 'Sessional', 'Holiday'], default: 'Class' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Schedule', scheduleSchema);
