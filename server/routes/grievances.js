const express = require('express');
const router = express.Router();
const { getGrievances, createGrievance, updateGrievance, deleteGrievance } = require('../controllers/grievanceController');
const { protect, authorize } = require('../middleware/auth');

// GET all relevant grievances (role-scoped)
// POST new grievance (any authenticated user)
router.route('/')
  .get(protect, getGrievances)
  .post(protect, createGrievance);

// PUT update grievance status (college admin / super admin only)
// DELETE grievance (submitter or admin)
router.route('/:id')
  .put(protect, updateGrievance)
  .delete(protect, deleteGrievance);

module.exports = router;
