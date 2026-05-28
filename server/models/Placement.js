const mongoose = require('mongoose');

const placementSchema = new mongoose.Schema({
  university: { type: mongoose.Schema.Types.ObjectId, ref: 'University' },
  college: { type: mongoose.Schema.Types.ObjectId, ref: 'College' },
  // Company / Recruiter Info
  companyName: { type: String, required: true },
  companyLogo: { type: String },
  jobTitle: { type: String, required: true },
  description: { type: String },
  // Eligibility
  eligibleDepartments: [{ type: String }],  // e.g. ['Computer Science', 'Electrical Engineering']
  eligibleSemesters: [{ type: String }],    // e.g. ['Semester 7', 'Semester 8']
  minCGPA: { type: Number, default: 0 },
  minBacklogs: { type: Number, default: 0 }, // max backlogs allowed (0 = no backlogs)
  // Package
  ctcLPA: { type: Number },              // e.g. 12.5 (in LPA)
  ctcLabel: { type: String },            // e.g. '12.5 LPA'
  jobType: { type: String, enum: ['Full Time', 'Internship', 'Contract', 'Part Time'], default: 'Full Time' },
  location: { type: String },
  // Process
  applicationDeadline: { type: String }, // YYYY-MM-DD
  driveDate: { type: String },           // YYYY-MM-DD
  selectionProcess: [{ type: String }],  // e.g. ['Online Test', 'Technical Round', 'HR Round']
  applyLink: { type: String },
  contactEmail: { type: String },
  status: { type: String, enum: ['Open', 'Closed', 'Upcoming', 'Completed'], default: 'Open' },
  // Stats
  studentsApplied: { type: Number, default: 0 },
  studentsSelected: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Placement', placementSchema);
