const express = require('express');
const router = express.Router();
const { 
    getStudentData, 
    addProject, 
    addAchievement, 
    getMentoredStudents, 
    getStudentProjects, 
    evaluateProject,
    getCollegeMentors 
} = require('../controllers/projectController');
const { protect } = require('../middleware/auth');

router.route('/')
  .get(protect, getStudentData)
  .post(protect, addProject);

router.route('/achievement')
  .post(protect, addAchievement);

// Faculty Mentoring Routes
router.get('/mentored-students', protect, getMentoredStudents);
router.get('/student-projects/:studentId', protect, getStudentProjects);
router.put('/evaluate', protect, evaluateProject);
router.get('/mentors', protect, getCollegeMentors);

module.exports = router;
