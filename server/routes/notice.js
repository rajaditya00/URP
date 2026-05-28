const express = require('express');
const router = express.Router();
const Notice = require('../models/Notice');
const College = require('../models/College');
const Notification = require('../models/Notification');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// ─── POST - Create University Notice (Super Admin) ────────────────────────────
router.post('/', protect, authorize('SUPER_ADMIN'), upload.single('noticePdf'), async (req, res) => {
  try {
    const { title, description, type } = req.body;
    const pdfUrl = req.file ? `uploads/noticePdf/${req.file.filename}` : null;

    const notice = new Notice({
      title,
      description,
      type: type || 'Important',
      pdfUrl,
      university: req.user.university
    });

    await notice.save();

    // Notify all colleges in this university
    try {
      const colleges = await College.find({ university: req.user.university });
      const notifications = colleges.map(col => ({
        college: col._id,
        recipientType: 'ALL',
        title: 'New University Circular',
        message: `Circular: "${title}" has been published by the University. Click to view details.`,
        type: 'Notice',
        referenceId: notice._id.toString()
      }));
      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
      }
    } catch (notifErr) {
      console.error('Failed to save notice notifications:', notifErr.message);
    }

    res.json(notice);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// ─── POST - Create College-Level Notice (College Admin) ──────────────────────
router.post('/college', protect, authorize('COLLEGE'), upload.single('noticePdf'), async (req, res) => {
  try {
    const { title, description, type, targetDepartment, targetSemester } = req.body;
    const pdfUrl = req.file ? `uploads/noticePdf/${req.file.filename}` : null;

    // Store college notice with college reference
    const notice = new Notice({
      title,
      description,
      type: type || 'General',
      pdfUrl,
      university: req.user.university,
      college: req.user.college,
      targetDepartment,
      targetSemester
    });

    await notice.save();

    // Determine notification scope
    let recipientType = 'ALL';
    let recipientDept = undefined;
    let recipientSem = undefined;

    if (targetDepartment && targetSemester) {
      recipientType = 'DEPARTMENT';
      recipientDept = targetDepartment;
      recipientSem = targetSemester;
    } else if (targetDepartment) {
      recipientType = 'DEPARTMENT';
      recipientDept = targetDepartment;
    }

    // Notify relevant students/faculty
    try {
      const notification = new Notification({
        college: req.user.college,
        recipientType,
        recipientDept,
        recipientSem,
        title: `Notice: ${title}`,
        message: `"${title}" has been posted. ${description ? description.substring(0, 120) + '...' : ''}`,
        type: 'Notice',
        referenceId: notice._id.toString()
      });
      await notification.save();
    } catch (notifErr) {
      console.error('Failed to save college notice notification:', notifErr.message);
    }

    res.json(notice);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// ─── GET - Fetch all notices for authenticated user's university/college ───────
router.get('/', protect, async (req, res) => {
  try {
    const user = req.user;
    let query = { university: user.university };

    // Students and faculty also see college-specific notices
    if (user.college) {
      query = {
        university: user.university,
        $or: [
          { college: { $exists: false } },
          { college: null },
          { college: user.college }
        ]
      };
    }

    const notices = await Notice.find(query).sort({ createdAt: -1 });
    res.json(notices);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// ─── GET - Fetch college-level notices only ───────────────────────────────────
router.get('/college', protect, async (req, res) => {
  try {
    if (!req.user.college) {
      return res.status(400).json({ error: 'No college associated with this account' });
    }
    const notices = await Notice.find({ college: req.user.college }).sort({ createdAt: -1 });
    res.json(notices);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// ─── DELETE - University Notice (Super Admin) ─────────────────────────────────
router.delete('/:id', protect, authorize('SUPER_ADMIN', 'COLLEGE'), async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);
    if (!notice) return res.status(404).json({ msg: 'Notice not found' });

    // Check authority
    if (req.user.role === 'SUPER_ADMIN') {
      if (notice.university?.toString() !== req.user.university?.toString()) {
        return res.status(401).json({ msg: 'Not authorized' });
      }
    } else if (req.user.role === 'COLLEGE') {
      if (notice.college?.toString() !== req.user.college?.toString()) {
        return res.status(401).json({ msg: 'Not authorized to delete this notice' });
      }
    }

    await Notice.deleteOne({ _id: notice._id });
    res.json({ msg: 'Notice removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
