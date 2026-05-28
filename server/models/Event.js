const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  university: { type: mongoose.Schema.Types.ObjectId, ref: 'University' },
  college: { type: mongoose.Schema.Types.ObjectId, ref: 'College' },
  title: { type: String, required: true },
  description: { type: String },
  type: { 
    type: String, 
    enum: ['Academic', 'Cultural', 'Sports', 'Technical', 'Workshop', 'Seminar', 'Other'], 
    default: 'Academic' 
  },
  date: { type: String },       // e.g. '2026-07-20'
  time: { type: String },       // e.g. '10:00 AM - 2:00 PM'
  venue: { type: String },
  organizer: { type: String },
  department: { type: String }, // If department-specific
  registrationLink: { type: String },
  imageUrl: { type: String },
  status: { type: String, enum: ['Upcoming', 'Ongoing', 'Completed', 'Cancelled'], default: 'Upcoming' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Event', eventSchema);
