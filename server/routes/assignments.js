const express = require('express');
const router = express.Router();
const { createAssignment, getAssignments, submitAssignment, gradeSubmission } = require('../controllers/assignmentController');
const { protect } = require('../middleware/auth');

router.route('/')
  .get(protect, getAssignments)
  .post(protect, createAssignment);

router.route('/:id/submit')
  .put(protect, submitAssignment);

router.route('/:id/grade/:submissionId')
  .put(protect, gradeSubmission);

module.exports = router;
