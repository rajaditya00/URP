const express = require('express');
const router = express.Router();
const { signup, login, changePassword, sendAdminOtp, verifyAdminOtp, forgotPassword, resetPassword } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/signup', signup);
router.post('/login', login);
router.put('/change-password', protect, changePassword);
router.post('/system-admin/send-otp', sendAdminOtp);
router.post('/system-admin/verify-otp', verifyAdminOtp);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;
