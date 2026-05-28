const express = require('express');
const router = express.Router();
const { getQuestions, getRecentTrends } = require('../controllers/questionController');
const { protect } = require('../middleware/auth');

router.route('/trends')
  .get(protect, getRecentTrends);

router.route('/')
  .get(protect, getQuestions);

module.exports = router;
