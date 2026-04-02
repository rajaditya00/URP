const express = require('express');
const router = express.Router();
const { getEvents, createEvent, deleteEvent } = require('../controllers/eventController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(protect, getEvents)
  .post(protect, authorize('SUPER_ADMIN', 'COLLEGE_ADMIN'), createEvent);

router.route('/:id')
  .delete(protect, authorize('SUPER_ADMIN'), deleteEvent);

module.exports = router;
