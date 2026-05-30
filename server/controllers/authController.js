const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const Otp = require('../models/Otp');

const JWT_SECRET = process.env.JWT_SECRET || 'URP_super_secret_key_123';

// =========================================================
// SECURE IN-MEMORY OTP STORE (DB-independent)
// Structure: email -> { otp, createdAt, attempts, locked }
// =========================================================
const otpStore = new Map();
const rateLimiter = new Map(); // email -> lastSentAt (timestamp)

const OTP_EXPIRY_MS = 5 * 60 * 1000;  // 5 minutes
const COOLDOWN_MS = 60 * 1000;       // 60s between requests
const MAX_ATTEMPTS = 3;

// =========================================================
// SIGNUP
// =========================================================
const signup = async (req, res) => {
    try {
        const { name, email, password, role, parentUniversityId, parentCollegeId } = req.body;

        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: 'User already exists' });

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

// =========================================================
// LOGIN
// =========================================================
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        let user;
        if (email.includes('@')) {
            user = await User.findOne({ email }).populate('university').populate('college');
        } else {
            const University = require('../models/University');
            const uni = await University.findOne({ generatedCredential: email });
            if (uni) {
                user = await User.findOne({ university: uni._id, role: 'SUPER_ADMIN' }).populate('university').populate('college');
            } else {
                const College = require('../models/College');
                const col = await College.findOne({ generatedCredential: email });
                if (col) {
                    user = await User.findOne({ college: col._id, role: 'COLLEGE' }).populate('university').populate('college');
                }
            }
        }

        if (!user) return res.status(400).json({ msg: 'Invalid Credentials' });

        const isMatch = await user.matchPassword(password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });

        const payload = { user: { id: user.id, role: user.role, name: user.name } };
        jwt.sign(payload, JWT_SECRET, { expiresIn: '72h' }, (err, token) => {
            if (err) {
                console.error('JWT Sign Error:', err);
                return res.status(500).json({ msg: 'Token generation failed' });
            }
            res.json({ token, user: { id: user.id, name: user.name, role: user.role, email: user.email, university: user.university, college: user.college, mustChangePassword: user.mustChangePassword } });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// =========================================================
// CHANGE PASSWORD
// =========================================================
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword)
            return res.status(400).json({ msg: 'Please provide current and new password' });

        if (newPassword.length < 6)
            return res.status(400).json({ msg: 'New password must be at least 6 characters' });

        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        const isMatch = await user.matchPassword(currentPassword);
        if (!isMatch) return res.status(400).json({ msg: 'Current password is incorrect' });

        user.password = newPassword;
        user.mustChangePassword = false;
        user.generatedPassword = undefined;
        await user.save();

        res.json({ msg: 'Password updated successfully' });
    } catch (err) {
        console.error('Change password error:', err.message);
        res.status(500).json({ msg: 'Server error' });
    }
};

// =========================================================
// SEND SYSTEM ADMIN OTP
// =========================================================
const sendAdminOtp = async (req, res) => {
    try {
        const { email, securityCode } = req.body;
        if (!email || !securityCode) return res.status(400).json({ msg: 'Email and Security Code are required.' });

        const adminEmail = process.env.SYSTEM_ADMIN_EMAIL || 'rajaditya.addy00@gmail.com';
        const adminCode = process.env.SYSTEM_ADMIN_SECURITY_CODE || 'admin123';

        if (email !== adminEmail || securityCode !== adminCode) {
            return res.status(401).json({ msg: 'Invalid Administrator Email or Security Code.' });
        }

        // --- Rate Limit: 60s cooldown ---
        const lastSent = rateLimiter.get(email);
        if (lastSent) {
            const elapsed = Date.now() - lastSent;
            if (elapsed < COOLDOWN_MS) {
                const waitSec = Math.ceil((COOLDOWN_MS - elapsed) / 1000);
                return res.status(429).json({ msg: `Please wait ${waitSec}s before requesting a new OTP.`, cooldown: waitSec });
            }
        }

        // Clear any previous locked OTP
        otpStore.delete(email);

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Store in memory
        otpStore.set(email, { otp, createdAt: Date.now(), attempts: 0, locked: false });
        rateLimiter.set(email, Date.now());

        // Print prominently to terminal
        console.log('\n\x1b[43m\x1b[30m ══════════════════════════════════════════════ \x1b[0m');
        console.log('\x1b[43m\x1b[30m   🔐  SYSTEM ADMIN OTP — INTELLIQ                 \x1b[0m');
        console.log('\x1b[43m\x1b[30m ══════════════════════════════════════════════ \x1b[0m');
        console.log(`\x1b[1m   📧  Email  : \x1b[36m${email}\x1b[0m`);
        console.log(`\x1b[1m   🔑  OTP    : \x1b[32m${otp}\x1b[0m`);
        console.log(`\x1b[1m   ⏱️   Expires: 5 minutes\x1b[0m`);
        console.log('\x1b[43m\x1b[30m ══════════════════════════════════════════════ \x1b[0m\n');

        // Respond immediately — terminal OTP only (email removed to prevent blocking)
        res.json({
            msg: 'OTP generated! Check the backend terminal for your code.',
            expiresIn: OTP_EXPIRY_MS / 1000,
            cooldown: COOLDOWN_MS / 1000
        });

    } catch (err) {
        console.error('sendAdminOtp error:', err);
        res.status(500).json({ msg: 'Server error generating OTP.' });
    }
};

// =========================================================
// VERIFY SYSTEM ADMIN OTP
// =========================================================
const verifyAdminOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) return res.status(400).json({ msg: 'Email and OTP are required.' });

        const record = otpStore.get(email);

        if (!record) {
            return res.status(400).json({ msg: 'No OTP found for this email. Please request one.' });
        }

        // Brute-force lockout
        if (record.locked) {
            return res.status(403).json({ msg: 'Too many failed attempts. Please request a new OTP.', locked: true });
        }

        // Expiry check
        if (Date.now() - record.createdAt > OTP_EXPIRY_MS) {
            otpStore.delete(email);
            return res.status(400).json({ msg: 'OTP has expired. Please request a new one.', expired: true });
        }

        // Wrong OTP
        if (record.otp !== otp) {
            record.attempts += 1;
            const remaining = MAX_ATTEMPTS - record.attempts;

            if (remaining <= 0) {
                record.locked = true;
                console.log(`\x1b[31m⛔  LOCKOUT: ${email} failed ${MAX_ATTEMPTS} times.\x1b[0m`);
                return res.status(403).json({ msg: `Locked after ${MAX_ATTEMPTS} wrong attempts. Request a new OTP.`, locked: true });
            }

            return res.status(400).json({ msg: `Incorrect OTP. ${remaining} attempt(s) remaining.`, attemptsLeft: remaining });
        }

        // SUCCESS
        otpStore.delete(email);
        rateLimiter.delete(email);
        console.log(`\x1b[32m✅  SYSTEM ADMIN AUTHENTICATED: ${email}\x1b[0m\n`);

        const payload = {
            user: { id: `admin_${Date.now()}`, role: 'SYSTEM_ADMIN', name: 'System Administrator', email }
        };

        jwt.sign(payload, JWT_SECRET, { expiresIn: '72h' }, (err, token) => {
            if (err) return res.status(500).json({ msg: 'Token generation error.' });
            res.json({ token, user: payload.user });
        });

    } catch (err) {
        console.error('verifyAdminOtp error:', err);
        res.status(500).json({ msg: 'Server error verifying OTP.' });
    }
};

// =========================================================
// FORGOT PASSWORD
// =========================================================
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ msg: 'If that email exists, an OTP has been sent.' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        await Otp.findOneAndUpdate(
            { identifier: `reset_${email}` },
            { otp, createdAt: Date.now() },
            { upsert: true, new: true }
        );

        // Print prominently to terminal (bypassing SMTP for reliability)
        console.log('\n\x1b[45m\x1b[30m ══════════════════════════════════════════════ \x1b[0m');
        console.log('\x1b[45m\x1b[30m   🔑  PASSWORD RESET OTP — INTELLIQ               \x1b[0m');
        console.log('\x1b[45m\x1b[30m ══════════════════════════════════════════════ \x1b[0m');
        console.log(`\x1b[1m   📧  Email  : \x1b[36m${email}\x1b[0m`);
        console.log(`\x1b[1m   🔑  OTP    : \x1b[32m${otp}\x1b[0m`);
        console.log(`\x1b[1m   ⏱️   Expires: 10 minutes\x1b[0m`);
        console.log('\x1b[45m\x1b[30m ══════════════════════════════════════════════ \x1b[0m\n');

        res.json({ msg: 'OTP generated! Check the backend terminal for your code.' });
    } catch (err) {
        console.error('Forgot Password Error:', err.message);
        res.status(500).json({ msg: 'Server Error during password reset request' });
    }
};

// =========================================================
// RESET PASSWORD
// =========================================================
const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        if (!email || !otp || !newPassword)
            return res.status(400).json({ msg: 'Please provide email, OTP, and new password.' });

        if (newPassword.length < 6)
            return res.status(400).json({ msg: 'New password must be at least 6 characters' });

        const record = await Otp.findOne({ identifier: `reset_${email}` });

        if (!record) return res.status(400).json({ msg: 'No active password reset request found.' });
        if (record.otp !== otp) return res.status(400).json({ msg: 'Invalid OTP Code Provided' });

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: 'User not found' });

        user.password = newPassword;
        user.generatedPassword = undefined;
        await user.save();

        await Otp.deleteOne({ identifier: `reset_${email}` });

        res.json({ msg: 'Password reset successfully. You can now log in.' });
    } catch (err) {
        console.error('Reset Password Error:', err.message);
        res.status(500).json({ msg: 'Server Error during password reset' });
    }
};

// =========================================================
// SYSTEM ADMIN DIRECT LOGIN (no OTP)
// =========================================================
const systemAdminLogin = (req, res) => {
    const { email, securityCode } = req.body;
    if (!email || !securityCode)
        return res.status(400).json({ msg: 'Email and Security Code are required.' });

    const adminEmail = process.env.SYSTEM_ADMIN_EMAIL || 'rajaditya.addy00@gmail.com';
    const adminCode = process.env.SYSTEM_ADMIN_SECURITY_CODE || 'admin123';

    if (email !== adminEmail || securityCode !== adminCode) {
        console.log(`\x1b[31m❌  SYSTEM ADMIN LOGIN FAILED — email: ${email}\x1b[0m`);
        return res.status(401).json({ msg: 'Invalid Administrator Email or Security Code.' });
    }

    const payload = {
        user: { id: `admin_${Date.now()}`, role: 'SYSTEM_ADMIN', name: 'System Administrator', email }
    };

    jwt.sign(payload, JWT_SECRET, { expiresIn: '72h' }, (err, token) => {
        if (err) return res.status(500).json({ msg: 'Token generation error.' });
        console.log(`\x1b[32m✅  SYSTEM ADMIN AUTHENTICATED: ${email}\x1b[0m`);
        res.json({ token, user: payload.user });
    });
};

const updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        const { name, mobile, dob, address, aadharNo, department, position, specialRole, semester } = req.body;

        if (name) user.name = name;
        if (mobile !== undefined) user.mobile = mobile;
        if (dob !== undefined) user.dob = dob;
        if (address !== undefined) user.address = address;
        if (aadharNo !== undefined) user.aadharNo = aadharNo;
        if (department !== undefined) user.department = department;
        if (position !== undefined) user.position = position;
        if (specialRole !== undefined) user.specialRole = specialRole;
        if (semester !== undefined) user.semester = semester;

        if (req.file) {
            user.profileImage = `uploads/profileImage/${req.file.filename}`;
        }

        await user.save();

        res.json({
            msg: 'Profile updated successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                position: user.position,
                department: user.department,
                specialRole: user.specialRole,
                status: user.status || 'Active',
                mobile: user.mobile,
                dob: user.dob,
                aadharNo: user.aadharNo,
                address: user.address,
                profileImage: user.profileImage,
                semester: user.semester,
                createdAt: user.createdAt,
            }
        });
    } catch (err) {
        console.error('Update profile error:', err.message);
        res.status(500).json({ msg: 'Server error' });
    }
};

const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .select('-password')
            .populate('university', 'name')
            .populate('college', 'name')
            .populate('mentor', 'name email department position');
        if (!user) return res.status(404).json({ msg: 'User not found' });
        res.json(user);
    } catch (err) {
        console.error('Get profile error:', err.message);
        res.status(500).json({ msg: 'Server error' });
    }
};

module.exports = { signup, login, changePassword, sendAdminOtp, verifyAdminOtp, forgotPassword, resetPassword, systemAdminLogin, updateProfile, getProfile };
