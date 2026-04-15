const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  videoUrl: { type: String, default: '' }
});

const elearningCourseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  university: { type: String, required: true },
  subject: { type: String, required: true },
  semester: { type: String, required: true },
  instructor: { type: String, required: true },
  duration: { type: String, required: true },
  image: { type: String, required: true },
  rating: { type: Number, default: 0 },
  enrolled: { type: Number, default: 0 },
  progress: { type: Number, default: 0 },
  description: { type: String, default: '' },
  pdfUrl: { type: String, default: '' },
  topics: [topicSchema],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ELearningCourse', elearningCourseSchema);
