const express = require('express');
const router = express.Router();
const { getPlacements, createPlacement, deletePlacement } = require('../controllers/placementController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(protect, getPlacements)
  .post(protect, authorize('SUPER_ADMIN', 'COLLEGE_ADMIN'), createPlacement);

router.route('/:id')
  .delete(protect, authorize('SUPER_ADMIN'), deletePlacement);

module.exports = router;
