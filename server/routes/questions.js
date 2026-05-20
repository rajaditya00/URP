const express = require('express');
const router = express.Router();
const { getQuestions } = require('../controllers/questionController');
const { protect } = require('../middleware/auth');

router.route('/')
  .get(protect, getQuestions);

module.exports = router;
