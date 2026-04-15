const ELearningCourse = require('../models/ELearningCourse');

// GET all courses
const getCourses = async (req, res) => {
    try {
        const courses = await ELearningCourse.find().sort({ createdAt: -1 });
        res.json(courses);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// GET single course
const getCourseById = async (req, res) => {
    try {
        let course = null;
        if (req.params.id && req.params.id.length === 24) {
             course = await ELearningCourse.findById(req.params.id);
        } else {
             course = await ELearningCourse.findOne({ id: req.params.id });
        }
        res.json(course || { title: 'Not found' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// POST new course
const addCourse = async (req, res) => {
    try {
        const { title, university, subject, semester, instructor, duration, image, rating, enrolled, progress, description, pdfUrl, topics } = req.body;
        
        const newCourse = new ELearningCourse({
            title, university, subject, semester, instructor, duration, image, rating, enrolled, progress, description, pdfUrl, topics
        });
        
        const course = await newCourse.save();
        res.json(course);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

module.exports = {
    getCourses,
    addCourse,
    getCourseById
};
