const express = require('express');
const router = express.Router();
const { createSession, getSessions, markComplete, deleteSession, updateSessionPlan } = require('../controllers/classSessionController');
const { protect } = require('../middleware/auth');

router.route('/')
  .get(protect, getSessions)
  .post(protect, createSession);

router.route('/:id/complete')
  .put(protect, markComplete);

router.route('/:id')
  .put(protect, updateSessionPlan)
  .delete(protect, deleteSession);

module.exports = router;

