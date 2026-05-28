const mongoose = require('mongoose');

const grievanceSchema = new mongoose.Schema({
  // Scope: can be university-level or college-level
  university: { type: mongoose.Schema.Types.ObjectId, ref: 'University' },
  college: { type: mongoose.Schema.Types.ObjectId, ref: 'College' },
  // Submitter
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  submitterName: { type: String },
  submitterRole: { type: String }, // STUDENT | PROFESSOR | STAFF | COLLEGE
  submitterDept: { type: String },
  // Content
  title: { type: String, required: true },
  description: { type: String },
  category: { 
    type: String, 
    enum: ['Academic', 'Administrative', 'Facilities', 'Financial', 'Harassment', 'Other'],
    default: 'Other'
  },
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Urgent'], default: 'Medium' },
  // Status tracking
  status: { 
    type: String, 
    enum: ['Open', 'Under Review', 'Resolved', 'Closed', 'Rejected'], 
    default: 'Open' 
  },
  resolution: { type: String },  // Admin's response / resolution note
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  resolvedAt: { type: Date },
  isAnonymous: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Grievance', grievanceSchema);
