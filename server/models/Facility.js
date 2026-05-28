const mongoose = require('mongoose');

const facilitySchema = new mongoose.Schema({
  university: { type: mongoose.Schema.Types.ObjectId, ref: 'University' },
  college: { type: mongoose.Schema.Types.ObjectId, ref: 'College' },
  title: { type: String, required: true },
  description: { type: String },
  type: { 
    type: String, 
    enum: ['Library', 'Laboratory', 'Sports', 'Hostel', 'Cafeteria', 'Medical', 'Transport', 'Computing', 'Auditorium', 'Other'],
    default: 'Other'
  },
  location: { type: String },
  capacity: { type: Number },
  operatingHours: { type: String }, // e.g. '9:00 AM - 5:00 PM'
  inCharge: { type: String },
  contactNo: { type: String },
  imageUrl: { type: String },
  status: { type: String, enum: ['Operational', 'Maintenance', 'Closed'], default: 'Operational' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Facility', facilitySchema);
