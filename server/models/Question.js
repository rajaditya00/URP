const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  code: { type: String, required: true },
  department: { type: String, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
  type: { type: String, enum: ['objective', 'subjective', 'multiple-answer'], required: true },
  marks: { type: Number, required: true },
  creditLevel: { type: Number, default: 3 },
  sourceUniversity: { type: String, default: 'Indian Institute of Technology, Bombay' },
  addedBy: { type: String, default: 'University Exam Controller' },
  addedOn: { type: String, default: '2026-05-20' }
});

module.exports = mongoose.model('Question', questionSchema);
