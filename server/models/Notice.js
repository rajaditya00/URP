const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
  university: { type: mongoose.Schema.Types.ObjectId, ref: 'University', required: true },
  college: { type: mongoose.Schema.Types.ObjectId, ref: 'College' }, // null = university-wide notice
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, enum: ['Important', 'Alert', 'General', 'Exam', 'Holiday', 'Circular'], default: 'Important' },
  pdfUrl: { type: String },  // Optional PDF attachment
  targetDepartment: { type: String }, // If set, notice is dept-specific
  targetSemester: { type: String },   // If set, notice is semester-specific
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notice', noticeSchema);
