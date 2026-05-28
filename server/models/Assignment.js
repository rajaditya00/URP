const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  college: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true },
  department: { type: String, required: true },
  semester: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String },
  dueDate: { type: Date, required: true },
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
  classSession: { type: mongoose.Schema.Types.ObjectId, ref: 'ClassSession' },
  submissions: [
    {
      student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      answers: [String], // Array of strings containing answers corresponding to the questions
      submittedText: { type: String },
      submittedAt: { type: Date, default: Date.now },
      grade: { type: String, default: 'Pending' },
      feedback: { type: String }
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Assignment', assignmentSchema);
