const express = require('express');
const router = express.Router();
const { getCourses, addCourse, getCourseById } = require('../controllers/elearningController');

// GET all courses
router.get('/', getCourses);

// GET single course
router.get('/:id', getCourseById);

// POST new course
router.post('/', addCourse);

module.exports = router;
