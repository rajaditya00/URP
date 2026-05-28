const mongoose = require('mongoose');

const feedbackEntrySchema = new mongoose.Schema({
  text: { type: String, required: true },
  byName: { type: String, default: 'Mentor' },
  at: { type: Date, default: Date.now }
}, { _id: false });

const projectSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  stack: { type: String, required: true },
  desc: { type: String, required: true },
  status: { type: String, enum: ['In Progress', 'Completed'], default: 'In Progress' },
  feedback: { type: String, default: '' },           // last feedback (legacy compat)
  feedbackHistory: { type: [feedbackEntrySchema], default: [] }, // full timestamped log
  skillsCredits: { type: Number, default: 0 },
  creditsLocked: { type: Boolean, default: false },   // true once evaluated once
  mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Project', projectSchema);
