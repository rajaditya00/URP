const Event = require('../models/Event');
const Notification = require('../models/Notification');

// ─── GET Events ───────────────────────────────────────────────────────────────
exports.getEvents = async (req, res) => {
  try {
    const user = req.user;
    const { type, status, department } = req.query;
    let query = {};

    if (user.role === 'SUPER_ADMIN') {
      query.university = user.university;
    } else {
      // COLLEGE, PROFESSOR, STUDENT - see college events
      if (user.college) {
        query.$or = [
          { college: user.college },
          { university: user.university, college: { $exists: false } },
          { university: user.university, college: null }
        ];
      } else {
        query.university = user.university;
      }
    }

    if (type && type !== 'All') query.type = type;
    if (status && status !== 'All') query.status = status;
    if (department && department !== 'All') query.department = department;

    const items = await Event.find(query).sort({ date: 1, createdAt: -1 });
    res.status(200).json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── CREATE Event ─────────────────────────────────────────────────────────────
exports.createEvent = async (req, res) => {
  try {
    const user = req.user;
    const { title, description, type, date, time, venue, organizer, department, registrationLink, imageUrl } = req.body;

    if (!title) return res.status(400).json({ error: 'Title is required' });

    const item = new Event({
      title,
      description,
      type: type || 'Academic',
      date,
      time,
      venue,
      organizer,
      department,
      registrationLink,
      imageUrl,
      status: 'Upcoming',
      university: user.university || null,
      college: user.college || null,
    });

    await item.save();

    // Notify college members about new event
    if (user.college) {
      try {
        const notification = new Notification({
          college: user.college,
          recipientType: 'ALL',
          title: `New Event: ${title}`,
          message: `A new ${type || 'Academic'} event "${title}" has been announced${date ? ` on ${date}` : ''}${venue ? ` at ${venue}` : ''}.`,
          type: 'System',
          referenceId: item._id.toString()
        });
        await notification.save();
      } catch (notifErr) {
        console.error('Failed to save event notification:', notifErr.message);
      }
    }

    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── UPDATE Event ─────────────────────────────────────────────────────────────
exports.updateEvent = async (req, res) => {
  try {
    const user = req.user;
    const item = await Event.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Event not found' });

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

// ─── DELETE Event ─────────────────────────────────────────────────────────────
exports.deleteEvent = async (req, res) => {
  try {
    const user = req.user;
    const item = await Event.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Not found' });

    const isSameCollege = item.college && item.college.toString() === user.college?.toString();
    const isSameUni = item.university && item.university.toString() === user.university?.toString();
    if (!isSameCollege && !isSameUni) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await item.deleteOne();
    res.status(200).json({ message: 'Event deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
