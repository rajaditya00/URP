const express = require('express');
const router = express.Router();
const { getFacilitys, createFacility, deleteFacility } = require('../controllers/facilityController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(protect, getFacilitys)
  .post(protect, authorize('SUPER_ADMIN', 'COLLEGE_ADMIN'), createFacility);

router.route('/:id')
  .delete(protect, authorize('SUPER_ADMIN'), deleteFacility);

module.exports = router;
