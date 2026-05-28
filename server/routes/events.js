const express = require('express');
const router = express.Router();
const { getEvents, createEvent, updateEvent, deleteEvent } = require('../controllers/eventController');
const { protect, authorize } = require('../middleware/auth');

// GET all events (role-scoped)
// POST create event (SUPER_ADMIN or COLLEGE)
router.route('/')
  .get(protect, getEvents)
  .post(protect, authorize('SUPER_ADMIN', 'COLLEGE'), createEvent);

// PUT update event
// DELETE event
router.route('/:id')
  .put(protect, authorize('SUPER_ADMIN', 'COLLEGE'), updateEvent)
  .delete(protect, authorize('SUPER_ADMIN', 'COLLEGE'), deleteEvent);

module.exports = router;
