const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Connect DB
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/campuscore')
.then(() => console.log('MongoDB Connected to CampusCore DB'))
.catch(err => console.log('MongoDB Connection Error:', err));

// Basic Routes
app.get('/', (req, res) => {
    res.send('CampusCore API running');
});

// Import API routes
const authRoutes = require('./routes/auth');
const universityRoutes = require('./routes/university');
const academicRoutes = require('./routes/academic');
const placementRoutes = require('./routes/placements');
const examinationRoutes = require('./routes/examinations');
const noticeRoutes = require('./routes/notices');
const eventRoutes = require('./routes/events');
const collegeRoutes = require('./routes/colleges');
const facilityRoutes = require('./routes/facilitys');
const grievanceRoutes = require('./routes/grievances');

app.use('/api/auth', authRoutes);
app.use('/api/university', universityRoutes);
app.use('/api/academic', academicRoutes);
app.use('/api/placement', placementRoutes);
app.use('/api/examination', examinationRoutes);
app.use('/api/notice', noticeRoutes);
app.use('/api/event', eventRoutes);
app.use('/api/college', collegeRoutes);
app.use('/api/facility', facilityRoutes);
app.use('/api/grievance', grievanceRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
