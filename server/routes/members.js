const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Schedule = require('../models/Schedule');
const Notification = require('../models/Notification');
const { protect, authorize } = require('../middleware/auth');
const sendEmail = require('../utils/sendEmail');

// Generate a random password
const generatePassword = (prefix = 'CC') => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let pass = prefix;
  for (let i = 0; i < 6; i++) pass += chars.charAt(Math.floor(Math.random() * chars.length));
  return pass;
};

// ─── GET all members (professors + students) under the logged-in college ──────
router.get('/', protect, authorize('COLLEGE'), async (req, res) => {
  try {
    const { role, search, batch, department, semester } = req.query;

    let query = { college: req.user.college };

    if (role) {
      query.role = role;
    } else {
      query.role = { $in: ['PROFESSOR', 'STUDENT', 'STAFF'] };
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { name: searchRegex },
        { rollNo: searchRegex },
        { registrationNo: searchRegex },
        { email: searchRegex }
      ];
    }

    if (batch && batch !== 'All') query.batch = batch;
    if (department && department !== 'All') query.department = department;
    if (semester && semester !== 'All') query.semester = semester;

    const members = await User.find(query)
      .select('-password')
      .populate('mentor', 'name email department position')
      .sort({ role: 1, createdAt: -1 });

    res.json(members);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET college stats summary ─────────────────────────────────────────────────
router.get('/stats', protect, authorize('COLLEGE'), async (req, res) => {
  try {
    const collegeId = req.user.college;

    const [totalStudents, totalFaculty, totalStaff, studentsWithMentor] = await Promise.all([
      User.countDocuments({ college: collegeId, role: 'STUDENT' }),
      User.countDocuments({ college: collegeId, role: 'PROFESSOR' }),
      User.countDocuments({ college: collegeId, role: 'STAFF' }),
      User.countDocuments({ college: collegeId, role: 'STUDENT', mentor: { $ne: null } }),
    ]);

    // Get department breakdown
    const deptBreakdown = await User.aggregate([
      { $match: { college: collegeId, role: 'STUDENT' } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Get batch breakdown
    const batchBreakdown = await User.aggregate([
      { $match: { college: collegeId, role: 'STUDENT' } },
      { $group: { _id: '$batch', count: { $sum: 1 } } },
      { $sort: { _id: -1 } }
    ]);

    res.json({
      totalStudents,
      totalFaculty,
      totalStaff,
      studentsWithMentor,
      deptBreakdown,
      batchBreakdown
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET single member by ID ──────────────────────────────────────────────────
router.get('/:id', protect, authorize('COLLEGE'), async (req, res) => {
  try {
    const member = await User.findById(req.params.id)
      .select('-password')
      .populate('university', 'name')
      .populate('college', 'name')
      .populate('mentor', 'name email department position');

    if (!member) return res.status(404).json({ error: 'Member not found' });

    const memberCollegeId = member.college?._id?.toString() || member.college?.toString();
    const userCollegeId = req.user.college?.toString();

    if (memberCollegeId !== userCollegeId) {
      return res.status(404).json({ error: 'Member not found in your college' });
    }
    res.json(member);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── PUT - Update member profile/details ──────────────────────────────────────
router.put('/:id', protect, authorize('COLLEGE'), async (req, res) => {
  try {
    const member = await User.findOne({ _id: req.params.id, college: req.user.college });
    if (!member) return res.status(404).json({ error: 'Member not found in your college' });

    const allowedFields = [
      'name', 'email', 'department', 'position', 'specialRole',
      'mobile', 'semester', 'batch', 'programme', 'rollNo',
      'registrationNo', 'address', 'fatherName', 'motherName',
      'gender', 'dob', 'casteCategory', 'aadharNo', 'profileImage', 'mentor'
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        member[field] = req.body[field];
      }
    });

    await member.save();
    const updated = await User.findById(member._id)
      .select('-password')
      .populate('mentor', 'name email department position');
    res.json({ msg: 'Member updated successfully', member: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── PUT - Allot a mentor to a student ────────────────────────────────────────
router.put('/allot-mentor', protect, authorize('COLLEGE'), async (req, res) => {
  try {
    const { studentId, rollNo, mentorId } = req.body;
    if (!studentId && !rollNo) {
      return res.status(400).json({ error: 'Student ID or Roll Number is required' });
    }

    let query = { college: req.user.college, role: 'STUDENT' };
    if (studentId) query._id = studentId;
    else query.rollNo = rollNo;

    const student = await User.findOneAndUpdate(
      query,
      { mentor: mentorId || null },
      { new: true }
    ).populate('mentor', 'name email department position');

    if (!student) {
      return res.status(404).json({ error: 'Student not found in your college' });
    }

    res.json({ msg: 'Mentor successfully allotted!', student });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST - Create a professor ────────────────────────────────────────────────
router.post('/professor', protect, authorize('COLLEGE'), async (req, res) => {
  try {
    const { name, email, department, position, specialRole, mobile } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: 'A user with this email already exists' });
    }

    const generatedPassword = generatePassword('PR');

    const professor = new User({
      name, email,
      password: generatedPassword,
      role: 'PROFESSOR',
      department, position, specialRole, mobile,
      university: req.user.university,
      college: req.user.college,
      mustChangePassword: true
    });
    await professor.save();

    const message = `Hello, ${name}!

You have been registered as a Professor/Faculty on All Campus Digital.

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
- You MUST change your password after your first login.

All Campus Digital Team`;

    try {
      await sendEmail({ email, subject: 'All Campus Digital - Your Professor Login Credentials', message });
    } catch (emailErr) {
      console.error('Email dispatch failed:', emailErr.message);
    }

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

// ─── POST - Create a student ──────────────────────────────────────────────────
router.post('/student', protect, authorize('COLLEGE'), async (req, res) => {
  try {
    const {
      name, email, rollNo, registrationNo, department, semester,
      batch, programme, address, fatherName, motherName, gender,
      dob, casteCategory, mobile, aadharNo
    } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: 'A user with this email already exists' });
    }

    const generatedPassword = generatePassword('ST');

    const student = new User({
      name, email,
      password: generatedPassword,
      role: 'STUDENT',
      rollNo, registrationNo, department, semester, batch, programme,
      address, fatherName, motherName, gender, dob, casteCategory, mobile, aadharNo,
      university: req.user.university,
      college: req.user.college,
      mustChangePassword: true
    });
    await student.save();

    const message = `Hello, ${name}!

You have been registered as a Student on All Campus Digital.

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
- You MUST change your password after your first login.

All Campus Digital Team`;

    try {
      await sendEmail({ email, subject: 'All Campus Digital - Your Student Login Credentials', message });
    } catch (emailErr) {
      console.error('Email dispatch failed:', emailErr.message);
    }

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

// ─── POST - Create a staff member ─────────────────────────────────────────────
router.post('/staff', protect, authorize('COLLEGE'), async (req, res) => {
  try {
    const { name, email, department, position, mobile } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: 'A user with this email already exists' });
    }

    const generatedPassword = generatePassword('SF');

    const staff = new User({
      name, email,
      password: generatedPassword,
      role: 'STAFF',
      department, position, mobile,
      university: req.user.university,
      college: req.user.college,
      mustChangePassword: true
    });
    await staff.save();

    const message = `Hello, ${name}!

You have been registered as a Staff member on All Campus Digital.

========================================
  YOUR LOGIN CREDENTIALS
========================================

  Name           : ${name}
  Login Email    : ${email}
  Password       : ${generatedPassword}
  Role           : Staff

  Login URL      : http://localhost:5173/login

========================================

Note:
- Use the email and password above to sign in.
- You MUST change your password after your first login.

All Campus Digital Team`;

    try {
      await sendEmail({ email, subject: 'All Campus Digital - Your Staff Login Credentials', message });
    } catch (emailErr) {
      console.error('Email dispatch failed:', emailErr.message);
    }

    console.log(`[>> STAFF CREDENTIALS DISPATCHED <<] Email: ${email} | Password: ${generatedPassword}`);

    res.status(201).json({
      member: { id: staff.id, name, email, role: 'STAFF' },
      credentials: { email, password: generatedPassword },
      msg: 'Staff member created and credentials dispatched via email'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ─── DELETE a member ──────────────────────────────────────────────────────────
router.delete('/:id', protect, authorize('COLLEGE'), async (req, res) => {
  try {
    const member = await User.findOneAndDelete({
      _id: req.params.id,
      college: req.user.college,
      role: { $in: ['PROFESSOR', 'STUDENT', 'STAFF'] }
    });
    if (!member) return res.status(404).json({ message: 'Member not found' });
    res.json({ message: `${member.role} account removed` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET - Schedules for department (with optional semester filter) ────────────
// Accessible by COLLEGE admin, PROFESSOR, STUDENT
router.get('/schedules/:department', protect, async (req, res) => {
  try {
    const { semester } = req.query;
    const query = {
      college: req.user.college,
      department: decodeURIComponent(req.params.department)
    };
    if (semester && semester !== 'All') query.semester = semester;

    const schedules = await Schedule.find(query).sort({ date: 1, time: 1 });
    res.json(schedules);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST - Create a new schedule entry ──────────────────────────────────────
router.post('/schedules', protect, authorize('COLLEGE'), async (req, res) => {
  try {
    const { department, semester, title, description, date, time, type } = req.body;
    if (!department || !semester || !title) {
      return res.status(400).json({ error: 'Department, Semester, and Title are required' });
    }

    const schedule = new Schedule({
      college: req.user.college,
      department, semester, title, description, date, time,
      type: type || 'Class'
    });
    await schedule.save();

    // Notify students in this dept/semester
    try {
      const notification = new Notification({
        college: req.user.college,
        recipientType: 'DEPARTMENT',
        recipientDept: department,
        recipientSem: semester,
        title: `Schedule Posted: ${title}`,
        message: `A new ${type || 'Class'} schedule entry "${title}" has been posted for ${semester}${date ? ` on ${date}` : ''}.`,
        type: 'Schedule',
        referenceId: schedule._id.toString()
      });
      await notification.save();
    } catch (notifErr) {
      console.error('Failed to save schedule notification:', notifErr.message);
    }

    res.status(201).json({ msg: 'Schedule created successfully!', schedule });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── PUT - Update a schedule entry ───────────────────────────────────────────
router.put('/schedules/:id', protect, authorize('COLLEGE'), async (req, res) => {
  try {
    const schedule = await Schedule.findOne({ _id: req.params.id, college: req.user.college });
    if (!schedule) return res.status(404).json({ error: 'Schedule not found' });

    Object.assign(schedule, req.body);
    await schedule.save();
    res.json({ msg: 'Schedule updated successfully!', schedule });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── DELETE - Remove a schedule entry ────────────────────────────────────────
router.delete('/schedules/:id', protect, authorize('COLLEGE'), async (req, res) => {
  try {
    const schedule = await Schedule.findOneAndDelete({
      _id: req.params.id,
      college: req.user.college
    });
    if (!schedule) return res.status(404).json({ error: 'Schedule not found' });
    res.json({ msg: 'Schedule deleted successfully!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
