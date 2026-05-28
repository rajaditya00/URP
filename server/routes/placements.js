const express = require('express');
const router = express.Router();
const { getPlacements, createPlacement, updatePlacement, deletePlacement } = require('../controllers/placementController');
const { protect, authorize } = require('../middleware/auth');

// GET all placements (role-scoped)
// POST create placement (SUPER_ADMIN or COLLEGE)
router.route('/')
  .get(protect, getPlacements)
  .post(protect, authorize('SUPER_ADMIN', 'COLLEGE'), createPlacement);

// PUT update placement
// DELETE placement
router.route('/:id')
  .put(protect, authorize('SUPER_ADMIN', 'COLLEGE'), updatePlacement)
  .delete(protect, authorize('SUPER_ADMIN', 'COLLEGE'), deletePlacement);

module.exports = router;
