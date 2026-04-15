const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['UNIVERSITY', 'COLLEGE', 'PROFESSOR', 'STUDENT'],
    required: true
  },
  parentUniversityId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  parentCollegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
