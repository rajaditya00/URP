const express = require('express');
const router = express.Router();
const { getExaminations, createExamination, deleteExamination } = require('../controllers/examinationController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(protect, getExaminations)
  .post(protect, authorize('SUPER_ADMIN', 'COLLEGE_ADMIN'), createExamination);

router.route('/:id')
  .delete(protect, authorize('SUPER_ADMIN'), deleteExamination);

module.exports = router;
