const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  university: { type: mongoose.Schema.Types.ObjectId, ref: 'University', required: true },
  title: { type: String, required: true },
  code: { type: String, required: true },
  department: { type: String, required: true },
  credits: { type: Number, required: true },
  description: { type: String },
  semester: { type: String, default: 'Semester 1' },
  faculty: { type: String, default: 'Dr. Alan Turing' },
  progress: { type: Number, default: 0 },
  topics: [{ type: String }],
  status: { type: String, enum: ['Completed', 'Ongoing'], default: 'Completed' },
  result: { type: String, default: '' },
  gpa: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Course', courseSchema);
