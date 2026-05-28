const mongoose = require('mongoose');

const lockerDocSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  category: { type: String, enum: ['sem5', 'bonafide', 'nodues', 'transcript'], required: true },
  status: { type: String, required: true }, // e.g. 'verified', 'processing', 'requestable'
  lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('LockerDoc', lockerDocSchema);
