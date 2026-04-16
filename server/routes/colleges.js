const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const College = require('../models/College');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const sendEmail = require('../utils/sendEmail');

// Generate a random password: 2 uppercase + 6 random alphanumeric
const generatePassword = (prefix = 'CC') => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let pass = prefix;
  for (let i = 0; i < 6; i++) pass += chars.charAt(Math.floor(Math.random() * chars.length));
  return pass;
};

// GET all colleges for the logged-in university
router.get('/', protect, async (req, res) => {
  try {
    const colleges = await College.find({ university: req.user.university });
    // Attach admin user info for each college
    const result = await Promise.all(colleges.map(async (col) => {
      const admin = await User.findOne({ college: col._id, role: 'COLLEGE' }).select('email name createdAt');
      return { ...col.toObject(), adminUser: admin || null };
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST - Add a new college + create college admin user + email credentials
router.post('/', protect, authorize('SUPER_ADMIN'), async (req, res) => {
  try {
    const { name, address, email, phone, principalName } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'College name and email are required' });
    }

    // Check if a user with this email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'A user with this email already exists' });
    }

    // Generate credentials for the college admin
    const generatedPassword = generatePassword('CL');
    
    // Generate College ID (Abbreviation + 3 digits)
    let prefix = name.split(' ').map(w => w[0]).join('').replace(/[^A-Za-z]/g, '').toUpperCase();
    if (!prefix) prefix = 'COL';
    const randomDigits = Math.floor(100 + Math.random() * 900);
    const generatedCredential = `${prefix}${randomDigits}`;

    // Create the college record with populated credentials
    const college = new College({
      university: req.user.university,
      name, address, email, phone, principalName,
      generatedCredential,
      generatedPassword
    });
    await college.save();

    // Create the college admin user
    const collegeAdmin = new User({
      name: principalName || name + ' Admin',
      email,
      password: generatedPassword, // pre-save hook will hash
      role: 'COLLEGE',
      university: req.user.university,
      college: college._id
    });
    await collegeAdmin.save();

    // Dispatch credentials via email
    const message = `Hello, ${principalName || name}!

Your college has been registered on CampusCore URP by the University Administrator.

========================================
  YOUR COLLEGE LOGIN CREDENTIALS
========================================

  College Name   : ${name}
  Login Email    : ${email}
  Password       : ${generatedPassword}

  Login URL      : http://localhost:5173/login

========================================

Note:
- Use the email and password above to sign in to the platform.
- You can change your password after logging in.
- Contact your University Admin if you face any issues.

CampusCore URP Team`;

    await sendEmail({
      email,
      subject: 'CampusCore - Your College Login Credentials',
      message
    });

    console.log(`[>> COLLEGE CREDENTIALS DISPATCHED <<] Email: ${email} | Password: ${generatedPassword}`);

    res.status(201).json({
      college,
      credentials: { email, password: generatedPassword, collegeId: generatedCredential },
      msg: 'College created and credentials dispatched via email'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// POST - Generate or regenerate credentials for an existing college
router.post('/:id/credentials', protect, authorize('SUPER_ADMIN'), async (req, res) => {
  try {
    const college = await College.findOne({ _id: req.params.id, university: req.user.university });
    if (!college) return res.status(404).json({ message: 'College not found' });

    // Find the college admin
    const collegeAdmin = await User.findOne({ college: college._id, role: 'COLLEGE' });
    if (!collegeAdmin) return res.status(404).json({ message: 'College Admin user not found' });

    // Generate credentials
    const generatedPassword = generatePassword('CL');
    let generatedCredential = college.generatedCredential;
    
    if (!generatedCredential) {
      let prefix = college.name.split(' ').map(w => w[0]).join('').replace(/[^A-Za-z]/g, '').toUpperCase();
      if (!prefix) prefix = 'COL';
      const randomDigits = Math.floor(100 + Math.random() * 900);
      generatedCredential = `${prefix}${randomDigits}`;
    }

    // Update college
    college.generatedCredential = generatedCredential;
    college.generatedPassword = generatedPassword;
    await college.save();

    // Update admin user password
    collegeAdmin.password = generatedPassword;
    await collegeAdmin.save(); // triggers pre-save hook for hashing

    // Dispatch email
    const message = `Hello, ${college.principalName || college.name}!

Your college credentials on CampusCore URP have been updated by the University Administrator.

========================================
  YOUR NEW COLLEGE LOGIN CREDENTIALS
========================================

  College Name   : ${college.name}
  Login Email    : ${collegeAdmin.email}
  Password       : ${generatedPassword}

  Login URL      : http://localhost:5173/login
========================================

CampusCore URP Team`;

    await sendEmail({
      email: collegeAdmin.email,
      subject: 'CampusCore - Your Updated Login Credentials',
      message
    });

    console.log(`[>> COLLEGE CREDENTIALS REGENERATED <<] Email: ${collegeAdmin.email} | Password: ${generatedPassword}`);

    res.json({
      college,
      credentials: { email: collegeAdmin.email, password: generatedPassword, collegeId: generatedCredential },
      msg: 'Credentials regenerated and dispatched via email'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// PUT - Update college details AND module permissions
router.put('/:id', protect, authorize('SUPER_ADMIN'), async (req, res) => {
  try {
    const college = await College.findOne({ _id: req.params.id, university: req.user.university });
    if (!college) return res.status(404).json({ message: 'College not found' });
    Object.assign(college, req.body);
    await college.save();
    res.json(college);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE
router.delete('/:id', protect, authorize('SUPER_ADMIN'), async (req, res) => {
  try {
    const college = await College.findOneAndDelete({ _id: req.params.id, university: req.user.university });
    if (!college) return res.status(404).json({ message: 'Not found' });
    // Also remove the college admin user
    await User.deleteMany({ college: college._id });
    res.json({ message: 'College and associated users removed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
