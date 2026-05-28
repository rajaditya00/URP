const express = require('express');
const router = express.Router();
const { getFacilities, createFacility, updateFacility, deleteFacility } = require('../controllers/facilityController');
const { protect, authorize } = require('../middleware/auth');

// GET all facilities (role-scoped)
// POST create facility (SUPER_ADMIN or COLLEGE)
router.route('/')
  .get(protect, getFacilities)
  .post(protect, authorize('SUPER_ADMIN', 'COLLEGE'), createFacility);

// PUT update facility
// DELETE facility
router.route('/:id')
  .put(protect, authorize('SUPER_ADMIN', 'COLLEGE'), updateFacility)
  .delete(protect, authorize('SUPER_ADMIN', 'COLLEGE'), deleteFacility);

module.exports = router;
