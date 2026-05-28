const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

// ─── GET - Retrieve all notifications relevant to the authenticated user ───────
router.get('/', protect, async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Not authenticated' });

    let query = {};

    if (user.role === 'STUDENT') {
      // Students see: ALL college notifications + their dept/sem specific + personal
      query = {
        college: user.college,
        $or: [
          { recipientType: 'ALL' },
          {
            recipientType: 'DEPARTMENT',
            recipientDept: user.department,
            $or: [
              { recipientSem: user.semester },
              { recipientSem: { $exists: false } },
              { recipientSem: '' },
              { recipientSem: null }
            ]
          },
          { recipientType: 'STUDENT', recipientStudent: user._id }
        ]
      };
    } else if (user.role === 'PROFESSOR' || user.role === 'STAFF') {
      // Faculty see: ALL college notifications + their department notifications
      query = {
        college: user.college,
        $or: [
          { recipientType: 'ALL' },
          { recipientType: 'DEPARTMENT', recipientDept: user.department },
        ]
      };
    } else if (user.role === 'COLLEGE') {
      // College admin sees all notifications for their college
      query = { college: user.college };
    } else if (user.role === 'SUPER_ADMIN') {
      // University admin - they don't have a college, skip college filter
      // Show no notifications (university-level has no college notifications)
      return res.json([]);
    } else {
      query = { college: user.college };
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(100);

    res.json(notifications);
  } catch (err) {
    console.error('Fetch notifications error:', err.message);
    res.status(500).json({ error: 'Server Error' });
  }
});

// ─── GET unread count ─────────────────────────────────────────────────────────
router.get('/unread-count', protect, async (req, res) => {
  try {
    const user = req.user;
    let query = {};

    if (user.role === 'STUDENT') {
      query = {
        college: user.college,
        readBy: { $ne: user._id },
        $or: [
          { recipientType: 'ALL' },
          { recipientType: 'DEPARTMENT', recipientDept: user.department,
            $or: [{ recipientSem: user.semester }, { recipientSem: { $exists: false } }, { recipientSem: '' }] },
          { recipientType: 'STUDENT', recipientStudent: user._id }
        ]
      };
    } else if (user.role === 'PROFESSOR' || user.role === 'STAFF') {
      query = {
        college: user.college,
        readBy: { $ne: user._id },
        $or: [
          { recipientType: 'ALL' },
          { recipientType: 'DEPARTMENT', recipientDept: user.department }
        ]
      };
    } else {
      query = { college: user.college, readBy: { $ne: user._id } };
    }

    const count = await Notification.countDocuments(query);
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
});

// ─── PUT - Mark a single notification as read ─────────────────────────────────
router.put('/:id/read', protect, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ error: 'Notification not found' });

    if (!notification.readBy.includes(req.user._id)) {
      notification.readBy.push(req.user._id);
      await notification.save();
    }

    res.json({ msg: 'Notification marked as read', notification });
  } catch (err) {
    console.error('Read notification error:', err.message);
    res.status(500).json({ error: 'Server Error' });
  }
});

// ─── PUT - Mark all relevant notifications as read ────────────────────────────
router.put('/mark-all-read', protect, async (req, res) => {
  try {
    const user = req.user;
    let query = {};

    if (user.role === 'STUDENT') {
      query = {
        college: user.college,
        $or: [
          { recipientType: 'ALL' },
          { recipientType: 'DEPARTMENT', recipientDept: user.department,
            $or: [{ recipientSem: user.semester }, { recipientSem: { $exists: false } }, { recipientSem: '' }] },
          { recipientType: 'STUDENT', recipientStudent: user._id }
        ]
      };
    } else if (user.role === 'PROFESSOR' || user.role === 'STAFF') {
      query = {
        college: user.college,
        $or: [
          { recipientType: 'ALL' },
          { recipientType: 'DEPARTMENT', recipientDept: user.department }
        ]
      };
    } else {
      query = { college: user.college };
    }

    await Notification.updateMany(
      { ...query, readBy: { $ne: user._id } },
      { $addToSet: { readBy: user._id } }
    );

    res.json({ msg: 'All notifications marked as read' });
  } catch (err) {
    console.error('Mark all read error:', err.message);
    res.status(500).json({ error: 'Server Error' });
  }
});

// ─── DELETE - Remove a notification (Admin only) ──────────────────────────────
router.delete('/:id', protect, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ error: 'Not found' });

    // Only college admin can delete notifications
    if (req.user.role !== 'COLLEGE' && req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await notification.deleteOne();
    res.json({ msg: 'Notification deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
});

module.exports = router;
