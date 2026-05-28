const ClassSession = require('../models/ClassSession');
const Notification = require('../models/Notification');

// @desc    Create/Schedule a new class session
// @route   POST /api/class-sessions
// @access  Private (Professor only)
exports.createSession = async (req, res) => {
  try {
    const { department, semester, batch, subject, date, time, duration, topicPlanned } = req.body;

    if (!department || !semester || !subject || !date || !time || !duration) {
      return res.status(400).json({ error: 'Please provide all required fields' });
    }

    const session = await ClassSession.create({
      faculty: req.user._id,
      college: req.user.college,
      department,
      semester,
      batch: batch || 'All',
      subject,
      date,
      time,
      duration: Number(duration),
      topicPlanned,
      status: 'scheduled'
    });

    // Notify students of scheduled class
    try {
      await Notification.create({
        college: req.user.college,
        recipientType: 'DEPARTMENT',
        recipientDept: department,
        recipientSem: semester,
        title: `New Lecture Scheduled: ${subject}`,
        message: `Professor ${req.user.name} scheduled a new lecture for ${subject} on ${date} at ${time} (Duration: ${duration} mins).`,
        type: 'Schedule',
        referenceId: String(session._id)
      });
    } catch (notifErr) {
      console.error('Failed to create notification for scheduled class:', notifErr.message);
    }

    res.status(201).json({ success: true, data: session });
  } catch (err) {
    console.error('Create class session error:', err.message);
    res.status(500).json({ error: 'Server Error' });
  }
};

// @desc    Get class sessions
// @route   GET /api/class-sessions
// @access  Private (Professor or Student)
exports.getSessions = async (req, res) => {
  try {
    let query = { college: req.user.college };

    if (req.user.role === 'PROFESSOR' || req.user.role === 'STAFF') {
      query.faculty = req.user._id;
    } else if (req.user.role === 'STUDENT') {
      query.department = req.user.department;
      query.semester = req.user.semester;
    }

    const sessions = await ClassSession.find(query)
      .populate('faculty', 'name email')
      .sort({ date: 1, time: 1 });

    res.status(200).json({ success: true, data: sessions });
  } catch (err) {
    console.error('Get class sessions error:', err.message);
    res.status(500).json({ error: 'Server Error' });
  }
};

// @desc    Mark a class session as completed and log the topic covered
// @route   PUT /api/class-sessions/:id/complete
// @access  Private (Professor only)
exports.markComplete = async (req, res) => {
  try {
    const { topicCovered } = req.body;

    if (!topicCovered) {
      return res.status(400).json({ error: 'Please specify the topic covered today' });
    }

    let session = await ClassSession.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ error: 'Class session not found' });
    }

    // Verify ownership
    if (String(session.faculty) !== String(req.user._id)) {
      return res.status(403).json({ error: 'Not authorized to modify this session' });
    }

    session.status = 'completed';
    session.topicCovered = topicCovered;
    session.completedAt = Date.now();
    await session.save();

    // Notify students of completed class + topic taught
    try {
      await Notification.create({
        college: req.user.college,
        recipientType: 'DEPARTMENT',
        recipientDept: session.department,
        recipientSem: session.semester,
        title: `Lecture Completed: ${session.subject}`,
        message: `Professor ${req.user.name} completed the lecture for ${session.subject}. Topic taught: "${topicCovered}".`,
        type: 'Schedule',
        referenceId: String(session._id)
      });
    } catch (notifErr) {
      console.error('Failed to create notification for completed class:', notifErr.message);
    }

    res.status(200).json({ success: true, data: session });
  } catch (err) {
    console.error('Mark complete error:', err.message);
    res.status(500).json({ error: 'Server Error' });
  }
};

// @desc    Delete a class session
// @route   DELETE /api/class-sessions/:id
// @access  Private (Professor only)
exports.deleteSession = async (req, res) => {
  try {
    const session = await ClassSession.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ error: 'Class session not found' });
    }

    // Verify ownership
    if (String(session.faculty) !== String(req.user._id)) {
      return res.status(403).json({ error: 'Not authorized to delete this session' });
    }

    const cancellationReason = req.body.reason || req.query.reason || 'No reason provided';

    // Update status to cancelled and record the reason instead of deleting
    session.status = 'cancelled';
    session.cancellationReason = cancellationReason;
    await session.save();

    // Notify students of cancellation with the reason
    try {
      await Notification.create({
        college: req.user.college,
        recipientType: 'DEPARTMENT',
        recipientDept: session.department,
        recipientSem: session.semester,
        title: `⚠️ Lecture Cancelled: ${session.subject}`,
        message: `Professor ${req.user.name} has cancelled the lecture for ${session.subject} scheduled on ${session.date} at ${session.time}. Reason: "${cancellationReason}".`,
        type: 'Schedule',
        referenceId: String(session._id)
      });
    } catch (notifErr) {
      console.error('Failed to create notification for cancelled class:', notifErr.message);
    }

    res.status(200).json({ success: true, message: 'Class session cancelled and students notified', data: session });
  } catch (err) {
    console.error('Delete class session error:', err.message);
    res.status(500).json({ error: 'Server Error' });
  }
};

// @desc    Update class session lecture plan/agenda
// @route   PUT /api/class-sessions/:id
// @access  Private (Professor only)
exports.updateSessionPlan = async (req, res) => {
  try {
    const { topicPlanned } = req.body;

    let session = await ClassSession.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ error: 'Class session not found' });
    }

    // Verify ownership
    if (String(session.faculty) !== String(req.user._id)) {
      return res.status(403).json({ error: 'Not authorized to modify this session' });
    }

    if (session.status !== 'scheduled') {
      return res.status(400).json({ error: 'Can only edit plan for scheduled lectures' });
    }

    session.topicPlanned = topicPlanned;
    await session.save();

    res.status(200).json({ success: true, data: session });
  } catch (err) {
    console.error('Update session plan error:', err.message);
    res.status(500).json({ error: 'Server Error' });
  }
};

