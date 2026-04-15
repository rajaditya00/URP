const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/User');

const otpStore = new Map();

const JWT_SECRET = process.env.JWT_SECRET || 'URP_super_secret_key_123';

const signup = async (req, res) => {
    try {
        const { name, email, password, role, parentUniversityId, parentCollegeId } = req.body;
        
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({
            name, email, password: hashedPassword, role,
            parentUniversityId: parentUniversityId || undefined,
            parentCollegeId: parentCollegeId || undefined
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

        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const payload = { user: { id: user.id, role: user.role, name: user.name } };
        jwt.sign(payload, JWT_SECRET, { expiresIn: '72h' }, (err, token) => {
            if (err) {
               console.error('JWT Sign Error:', err);
               return res.status(500).json({ msg: 'Token generation failed' });
            }
            res.json({ token, user: { id: user.id, name: user.name, role: user.role, email: user.email } });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
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

module.exports = { signup, login, sendAdminOtp, verifyAdminOtp };
