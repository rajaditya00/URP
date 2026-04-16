const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

const otpStore = new Map();

const JWT_SECRET = process.env.JWT_SECRET || 'URP_super_secret_key_123';

const signup = async (req, res) => {
    try {
        const { name, email, password, role, parentUniversityId, parentCollegeId } = req.body;
        
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        // Password hashing is handled by User model pre-save hook
        user = new User({
            name, email, password, role,
            university: parentUniversityId || undefined,
            college: parentCollegeId || undefined
        });

        await user.save();

        const payload = { user: { id: user.id, role: user.role, name: user.name } };
        jwt.sign(payload, JWT_SECRET, { expiresIn: '72h' }, (err, token) => {
            if (err) throw err;
            res.json({ token, user: { id: user.id, name: user.name, role: user.role, email: user.email } });
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        let user = await User.findOne({ email }).populate('university').populate('college');
        if (!user) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const payload = { user: { id: user.id, role: user.role, name: user.name } };
        jwt.sign(payload, JWT_SECRET, { expiresIn: '72h' }, (err, token) => {
            if (err) {
               console.error('JWT Sign Error:', err);
               return res.status(500).json({ msg: 'Token generation failed' });
            }
            res.json({ token, user: { id: user.id, name: user.name, role: user.role, email: user.email, university: user.university, college: user.college } });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ msg: 'Please provide current and new password' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ msg: 'New password must be at least 6 characters' });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        const isMatch = await user.matchPassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Current password is incorrect' });
        }

        user.password = newPassword; // pre-save hook will hash it
        await user.save();

        res.json({ msg: 'Password updated successfully' });
    } catch (err) {
        console.error('Change password error:', err.message);
        res.status(500).json({ msg: 'Server error' });
    }
};

const sendAdminOtp = async (req, res) => {
    try {
        const { email } = req.body;
        
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        otpStore.set(email, { otp, expires: Date.now() + 10 * 60 * 1000 });

        console.log(`[>> SYSTEM ADMIN OTP SENT <<] Email: ${email} | OTP Code: ${otp}`);

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER || 'dummy@gmail.com',
                pass: process.env.GMAIL_PASS || 'dummy'
            }
        });

        if (process.env.GMAIL_USER) {
           try {
               await transporter.sendMail({
                  from: process.env.GMAIL_USER,
                  to: email,
                  subject: 'URP System Admin - Secure Login OTP',
                  text: `Your robust OTP for the System Admin Dashboard is: ${otp}`
               });
           } catch(e) {
               console.log('Mail configuration invalid. Relying strictly on console printed OTP.');
           }
        }

        res.json({ msg: 'OTP generated successfully. Sent to Email (or printed to backend terminal).' });
    } catch (err) {
        console.error('OTP Gen Error:', err);
        res.status(500).json({ msg: 'Server Error generating OTP backend side' });
    }
};

// Start of verifyAdminOtp (which was already here before my duplicate insertion)

const verifyAdminOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const record = otpStore.get(email);

        if (!record) return res.status(400).json({ msg: 'No active OTP was requested for this email address.' });
        if (Date.now() > record.expires) {
            otpStore.delete(email);
            return res.status(400).json({ msg: 'OTP has expired. Generate a new one.' });
        }
        if (record.otp !== otp) return res.status(400).json({ msg: 'Invalid OTP Code Provided' });

        otpStore.delete(email);

        const payload = { user: { id: 'admin_' + Date.now().toString(), role: 'SYSTEM_ADMIN', name: 'System Administrator', email } };
        jwt.sign(payload, JWT_SECRET, { expiresIn: '72h' }, (err, token) => {
            if (err) return res.status(500).json({ msg: 'Token Error' });
            res.json({ token, user: payload.user });
        });
    } catch (err) {
        console.error('OTP Verify Error:', err);
        res.status(500).json({ msg: 'Server Error parsing OTP verifier' });
    }
};

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ msg: 'If that email addresses exists, an OTP has been sent.' }); // Don't leak user existence
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        // Store OTP with 10-minute expiry
        otpStore.set(`reset_${email}`, { otp, expires: Date.now() + 10 * 60 * 1000 });

        const message = `Hello,

You recently requested to reset your password for your CampusCore URP account.

Your password reset OTP is: ${otp}

This OTP is valid for 10 minutes. If you did not request a password reset, please ignore this email.

Thanks,
CampusCore URP Team`;

        await sendEmail({
            email,
            subject: 'CampusCore - Password Reset Request',
            message
        });

        console.log(`[>> FORGOT PASSWORD OTP SENT <<] Email: ${email} | OTP Code: ${otp}`);
        
        res.json({ msg: 'If that email exists, an OTP has been sent.' });
    } catch (err) {
        console.error('Forgot Password Error:', err.message);
        res.status(500).json({ msg: 'Server Error during password reset request' });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        
        if (!email || !otp || !newPassword) {
            return res.status(400).json({ msg: 'Please provide email, OTP, and new password.' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ msg: 'New password must be at least 6 characters' });
        }

        const record = otpStore.get(`reset_${email}`);

        if (!record) {
            return res.status(400).json({ msg: 'No active password reset request found. Please try again.' });
        }

        if (Date.now() > record.expires) {
            otpStore.delete(`reset_${email}`);
            return res.status(400).json({ msg: 'OTP has expired. Generate a new one.' });
        }

        if (record.otp !== otp) {
            return res.status(400).json({ msg: 'Invalid OTP Code Provided' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'User not found' });
        }

        // OTP is valid, change password
        user.password = newPassword; // the pre-save hook handles hashing
        await user.save();
        
        // Clean up OTP store
        otpStore.delete(`reset_${email}`);

        res.json({ msg: 'Password reset successfully. You can now log in.' });
    } catch (err) {
        console.error('Reset Password Error:', err.message);
        res.status(500).json({ msg: 'Server Error during password reset' });
    }
};

module.exports = { signup, login, changePassword, sendAdminOtp, verifyAdminOtp, forgotPassword, resetPassword };
