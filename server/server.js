const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect DB
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/allcampusdigital')
    .then(() => console.log('✅  MongoDB Connected Successfully'))
    .catch(err => console.error('❌  MongoDB Connection Error:', err));

// Base health check
app.get('/', (req, res) => {
    res.json({ status: 'ok', message: 'All Campus Digital API running', version: '2.0' });
});

// ── Import All Route Modules ─────────────────────────────────────────────────
const authRoutes          = require('./routes/auth');
const universityRoutes    = require('./routes/university');
const academicRoutes      = require('./routes/academic');
const placementRoutes     = require('./routes/placements');
const examinationRoutes   = require('./routes/examinations');
const noticeRoutes        = require('./routes/notice');
const resultRoutes        = require('./routes/result');
const eventRoutes         = require('./routes/events');
const collegeRoutes       = require('./routes/colleges');
const facilityRoutes      = require('./routes/facilitys');
const grievanceRoutes     = require('./routes/grievances');
const projectRoutes       = require('./routes/projects');
const memberRoutes        = require('./routes/members');
const uploadRoutes        = require('./routes/upload');
const questionsRoutes     = require('./routes/questions');
const notificationRoutes  = require('./routes/notifications');
const elearningRoutes     = require('./routes/elearning');
const classSessionRoutes  = require('./routes/classSessions');
const assignmentRoutes    = require('./routes/assignments');

// ── Mount Routes ──────────────────────────────────────────────────────────────
app.use('/api/auth',           authRoutes);
app.use('/api/university',     universityRoutes);
app.use('/api/academic',       academicRoutes);
app.use('/api/placement',      placementRoutes);
app.use('/api/examination',    examinationRoutes);
app.use('/api/notice',         noticeRoutes);
app.use('/api/result',         resultRoutes);
app.use('/api/event',          eventRoutes);
app.use('/api/college',        collegeRoutes);
app.use('/api/facility',       facilityRoutes);
app.use('/api/grievances',     grievanceRoutes);
app.use('/api/projects',       projectRoutes);
app.use('/api/members',        memberRoutes);
app.use('/api/upload',         uploadRoutes);
app.use('/api/questions',      questionsRoutes);
app.use('/api/notifications',  notificationRoutes);
app.use('/api/elearning',      elearningRoutes);
app.use('/api/class-sessions', classSessionRoutes);
app.use('/api/assignments',    assignmentRoutes);

// ── Global Error Handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err.stack);
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

// ── 404 Handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found', path: req.originalUrl });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀  Server running on port ${PORT}`);
    console.log(`📡  API base: http://localhost:${PORT}/api`);
});
