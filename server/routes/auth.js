const express = require('express');
const router = express.Router();
const { signup, login, changePassword, sendAdminOtp, verifyAdminOtp, forgotPassword, resetPassword, systemAdminLogin, updateProfile, getProfile } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/signup', signup);
router.post('/login', login);
router.put('/change-password', protect, changePassword);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, upload.single('profileImage'), updateProfile);
router.post('/system-admin/send-otp', sendAdminOtp);
router.post('/system-admin/verify-otp', verifyAdminOtp);
router.post('/system-admin/login', systemAdminLogin);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;
