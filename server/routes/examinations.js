const express = require('express');
const router = express.Router();
const { getExaminations, createExamination, updateExamination, deleteExamination } = require('../controllers/examinationController');
const { protect, authorize } = require('../middleware/auth');

// GET all exams (role-scoped: students get their dept/sem exams)
// POST create exam (COLLEGE admin or SUPER_ADMIN)
router.route('/')
  .get(protect, getExaminations)
  .post(protect, authorize('SUPER_ADMIN', 'COLLEGE'), createExamination);

// PUT update exam details
// DELETE exam
router.route('/:id')
  .put(protect, authorize('SUPER_ADMIN', 'COLLEGE'), updateExamination)
  .delete(protect, authorize('SUPER_ADMIN', 'COLLEGE'), deleteExamination);

module.exports = router;
