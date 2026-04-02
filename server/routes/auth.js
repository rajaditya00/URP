const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

// ---- LOGIN ----
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).populate('university');
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user._id, role: user.role, universityId: user.university?._id },
      process.env.JWT_SECRET || 'supersecretcampuscorekey',
      { expiresIn: '1d' }
    );
    res.json({ token, user: { name: user.name, role: user.role, email: user.email, university: user.university } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---- FORGOT PASSWORD ---- (sends a reset token to registered email)
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'No account found with this email.' });

    // Generate a 6-digit OTP / reset token
    const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
    const resetTokenExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes

    // Store hashed token on user
    user.resetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetTokenExpiry = resetTokenExpiry;
    await user.save();

    const message = `Hello,

A password reset was requested for your CampusCore account.

Your One-Time Reset Code: ${resetToken}

This code is valid for 15 minutes. Do NOT share it with anyone.

If you did not request this, please ignore this email.

- CampusCore Security Team`;

    await sendEmail({ email: user.email, subject: 'CampusCore - Password Reset Code', message });

    res.json({ message: 'A reset code has been sent to your registered email.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---- RESET PASSWORD ---- (validate OTP and set new password)
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

    const user = await User.findOne({
      email,
      resetToken: hashedOtp,
      resetTokenExpiry: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ message: 'Invalid or expired reset code. Request a new one.' });

    user.password = newPassword; // pre-save hash hook will handle bcrypt
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.json({ message: 'Password updated successfully. You can now sign in.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
