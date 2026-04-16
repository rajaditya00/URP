const mongoose = require('mongoose');

const collegeSchema = new mongoose.Schema({
  university: { type: mongoose.Schema.Types.ObjectId, ref: 'University', required: true },
  name: { type: String, required: true },
  address: { type: String },
  email: { type: String },
  phone: { type: String },
  principalName: { type: String },
  // Module authority flags 
  modules: {
    examination: { type: Boolean, default: false },        // Can access Examination Controller
    addQuestions: { type: Boolean, default: false },       // Can add questions to question bank
    verifyStudentForms: { type: Boolean, default: false }, // Can verify student exam forms
    placement: { type: Boolean, default: false },
    grievance: { type: Boolean, default: false },
    notices: { type: Boolean, default: false },
  },
  generatedCredential: { type: String }, // Custom abbreviation ID e.g., MIT453
  generatedPassword: { type: String }, // Saved plain text password for dashboard access
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('College', collegeSchema);
