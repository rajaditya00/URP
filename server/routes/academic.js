const express = require('express');
const router = express.Router();
const { getCourses, createCourse, deleteCourse } = require('../controllers/academicController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(protect, getCourses)
  .post(protect, authorize('SUPER_ADMIN', 'COLLEGE_ADMIN'), createCourse);

router.route('/:id')
  .delete(protect, authorize('SUPER_ADMIN', 'COLLEGE_ADMIN'), deleteCourse);

module.exports = router;
