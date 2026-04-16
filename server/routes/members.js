const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const sendEmail = require('../utils/sendEmail');

// Generate a random password
const generatePassword = (prefix = 'CC') => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let pass = prefix;
  for (let i = 0; i < 6; i++) pass += chars.charAt(Math.floor(Math.random() * chars.length));
  return pass;
};

// GET all members (professors + students) under the logged-in college
router.get('/', protect, authorize('COLLEGE'), async (req, res) => {
  try {
    const members = await User.find({
      college: req.user.college,
      role: { $in: ['PROFESSOR', 'STUDENT'] }
    }).select('-password').sort({ role: 1, createdAt: -1 });
    res.json(members);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST - Create a professor
router.post('/professor', protect, authorize('COLLEGE'), async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: 'A user with this email already exists' });
    }

    const generatedPassword = generatePassword('PR');

    const professor = new User({
      name,
      email,
      password: generatedPassword,
      role: 'PROFESSOR',
      university: req.user.university,
      college: req.user.college
    });
    await professor.save();

    // Dispatch credentials via email
    const message = `Hello, ${name}!

You have been registered as a Professor/Faculty on CampusCore URP.

========================================
  YOUR LOGIN CREDENTIALS
========================================

  Name           : ${name}
  Login Email    : ${email}
  Password       : ${generatedPassword}
  Role           : Professor / Faculty

  Login URL      : http://localhost:5173/login

========================================

Note:
- Use the email and password above to sign in.
- You can change your password after logging in.

CampusCore URP Team`;

    await sendEmail({
      email,
      subject: 'CampusCore - Your Professor Login Credentials',
      message
    });

    console.log(`[>> PROFESSOR CREDENTIALS DISPATCHED <<] Email: ${email} | Password: ${generatedPassword}`);

    res.status(201).json({
      member: { id: professor.id, name, email, role: 'PROFESSOR' },
      credentials: { email, password: generatedPassword },
      msg: 'Professor created and credentials dispatched via email'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// POST - Create a student
router.post('/student', protect, authorize('COLLEGE'), async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: 'A user with this email already exists' });
    }

    const generatedPassword = generatePassword('ST');

    const student = new User({
      name,
      email,
      password: generatedPassword,
      role: 'STUDENT',
      university: req.user.university,
      college: req.user.college
    });
    await student.save();

    // Dispatch credentials via email
    const message = `Hello, ${name}!

You have been registered as a Student on CampusCore URP.

========================================
  YOUR LOGIN CREDENTIALS
========================================

  Name           : ${name}
  Login Email    : ${email}
  Password       : ${generatedPassword}
  Role           : Student

  Login URL      : http://localhost:5173/login

========================================

Note:
- Use the email and password above to sign in.
- You can change your password after logging in.

CampusCore URP Team`;

    await sendEmail({
      email,
      subject: 'CampusCore - Your Student Login Credentials',
      message
    });

    console.log(`[>> STUDENT CREDENTIALS DISPATCHED <<] Email: ${email} | Password: ${generatedPassword}`);

    res.status(201).json({
      member: { id: student.id, name, email, role: 'STUDENT' },
      credentials: { email, password: generatedPassword },
      msg: 'Student created and credentials dispatched via email'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE a member (professor or student)
router.delete('/:id', protect, authorize('COLLEGE'), async (req, res) => {
  try {
    const member = await User.findOneAndDelete({
      _id: req.params.id,
      college: req.user.college,
      role: { $in: ['PROFESSOR', 'STUDENT'] }
    });
    if (!member) return res.status(404).json({ message: 'Member not found' });
    res.json({ message: `${member.role} account removed` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
