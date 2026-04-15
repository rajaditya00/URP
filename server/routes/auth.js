const express = require('express');
const router = express.Router();
const { signup, login, sendAdminOtp, verifyAdminOtp } = require('../controllers/authController');

router.post('/signup', signup);
router.post('/login', login);
router.post('/system-admin/send-otp', sendAdminOtp);
router.post('/system-admin/verify-otp', verifyAdminOtp);

module.exports = router;
