const mongoose = require('mongoose');

const universitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  country: { type: String },
  state: { type: String },
  address: { type: String },
  plan: { type: String },
  duration: { type: String },
  status: { type: String, default: 'pending_verification' }, // 'pending_verification', 'active'

  // Branding
  logoUrl: { type: String },

  // Verification / Facilities
  departmentImages: [{ type: String }],
  labImages: [{ type: String }],
  sportsImages: [{ type: String }],
  auditoriumImages: [{ type: String }],
  affiliationDocUrl: { type: String },
  affiliationDocBase64: { type: String }, // User requested string form storage
  generatedCredential: { type: String }, // University ID
  generatedPassword: { type: String },   // Initial generated password
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('University', universitySchema);
