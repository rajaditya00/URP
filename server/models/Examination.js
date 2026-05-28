const mongoose = require('mongoose');

const examinationSchema = new mongoose.Schema({
  university: { type: mongoose.Schema.Types.ObjectId, ref: 'University' },
  college: { type: mongoose.Schema.Types.ObjectId, ref: 'College' },
  title: { type: String, required: true },
  description: { type: String },
  subject: { type: String },
  department: { type: String },
  semester: { type: String },
  type: { 
    type: String, 
    enum: ['Internal', 'Sessional', 'Final', 'Practical', 'Viva', 'Other'], 
    default: 'Internal' 
  },
  date: { type: String },   // e.g. '2026-06-15'
  time: { type: String },   // e.g. '10:00 AM'
  duration: { type: String }, // e.g. '3 Hours'
  totalMarks: { type: Number, default: 100 },
  venue: { type: String },
  status: { type: String, enum: ['Scheduled', 'Ongoing', 'Completed', 'Cancelled'], default: 'Scheduled' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Examination', examinationSchema);
