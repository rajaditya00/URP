const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  college: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true },
  recipientType: { type: String, enum: ['ALL', 'DEPARTMENT', 'STUDENT'], default: 'ALL' },
  recipientDept: { type: String },
  recipientSem: { type: String },
  recipientStudent: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['Schedule', 'Notice', 'Project', 'System'], default: 'System' },
  referenceId: { type: String },
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);
