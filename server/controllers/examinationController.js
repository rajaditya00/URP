const Examination = require('../models/Examination');
const Notification = require('../models/Notification');

// ─── GET Examinations ─────────────────────────────────────────────────────────
exports.getExaminations = async (req, res) => {
  try {
    const user = req.user;
    const { department, semester, type, status } = req.query;

    let query = {};

    if (user.role === 'SUPER_ADMIN') {
      query.university = user.university;
    } else {
      // COLLEGE, PROFESSOR, STUDENT - scoped to their college
      query.college = user.college;
      if (!query.college) query.university = user.university;
    }

    // Scope for students/faculty - filter by their dept/sem
    if (user.role === 'STUDENT') {
      if (user.department) query.department = user.department;
      if (user.semester) query.semester = user.semester;
    } else {
      // Optional query filters
      if (department && department !== 'All') query.department = department;
      if (semester && semester !== 'All') query.semester = semester;
    }
    if (type && type !== 'All') query.type = type;
    if (status && status !== 'All') query.status = status;

    const items = await Examination.find(query).sort({ date: 1, createdAt: -1 });
    res.status(200).json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── CREATE Examination ───────────────────────────────────────────────────────
exports.createExamination = async (req, res) => {
  try {
    const user = req.user;
    const { title, description, subject, department, semester, type, date, time, duration, totalMarks, venue } = req.body;

    if (!title) return res.status(400).json({ error: 'Title is required' });

    const item = new Examination({
      title,
      description,
      subject,
      department,
      semester,
      type: type || 'Internal',
      date,
      time,
      duration,
      totalMarks: totalMarks || 100,
      venue,
      status: 'Scheduled',
      university: user.university || null,
      college: user.college || null,
    });

    await item.save();

    // Notify relevant students when exam is scheduled
    if (user.college && department && semester) {
      try {
        const notification = new Notification({
          college: user.college,
          recipientType: 'DEPARTMENT',
          recipientDept: department,
          recipientSem: semester,
          title: `Exam Scheduled: ${title}`,
          message: `A ${type || 'Internal'} examination "${title}" for ${subject || department} has been scheduled on ${date || 'TBA'}.`,
          type: 'System',
          referenceId: item._id.toString()
        });
        await notification.save();
      } catch (notifErr) {
        console.error('Failed to save exam notification:', notifErr.message);
      }
    }

    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── UPDATE Examination ───────────────────────────────────────────────────────
exports.updateExamination = async (req, res) => {
  try {
    const user = req.user;
    const item = await Examination.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Examination not found' });

    // Verify ownership (college or university scope)
    const isSameCollege = item.college && item.college.toString() === user.college?.toString();
    const isSameUni = item.university && item.university.toString() === user.university?.toString();
    if (!isSameCollege && !isSameUni) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    Object.assign(item, req.body);
    await item.save();
    res.status(200).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── DELETE Examination ───────────────────────────────────────────────────────
exports.deleteExamination = async (req, res) => {
  try {
    const user = req.user;
    const item = await Examination.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Not found' });

    const isSameCollege = item.college && item.college.toString() === user.college?.toString();
    const isSameUni = item.university && item.university.toString() === user.university?.toString();
    if (!isSameCollege && !isSameUni) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await item.deleteOne();
    res.status(200).json({ message: 'Examination deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
