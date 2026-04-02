const express = require('express');
const router = express.Router();
const { getGrievances, createGrievance, deleteGrievance } = require('../controllers/grievanceController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(protect, getGrievances)
  .post(protect, authorize('SUPER_ADMIN', 'COLLEGE_ADMIN'), createGrievance);

router.route('/:id')
  .delete(protect, authorize('SUPER_ADMIN'), deleteGrievance);

module.exports = router;
