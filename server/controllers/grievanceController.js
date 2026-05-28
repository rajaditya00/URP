const Grievance = require('../models/Grievance');
const Notification = require('../models/Notification');

// ─── GET Grievances ────────────────────────────────────────────────────────────
// All roles can fetch their relevant grievances
exports.getGrievances = async (req, res) => {
  try {
    const user = req.user;
    let query = {};

    if (user.role === 'SUPER_ADMIN') {
      // University admin sees all university-level grievances
      query = { university: user.university };
    } else if (user.role === 'COLLEGE') {
      // College admin sees their college-level grievances
      query = { college: user.college };
    } else if (user.role === 'PROFESSOR' || user.role === 'STAFF') {
      // Faculty see department grievances + their own submissions
      query = {
        college: user.college,
        $or: [
          { submittedBy: user._id },
          { department: user.department }
        ]
      };
    } else if (user.role === 'STUDENT') {
      // Students see their own grievances
      query = { college: user.college, submittedBy: user._id };
    }

    const items = await Grievance.find(query)
      .populate('submittedBy', 'name email role department')
      .populate('resolvedBy', 'name email')
      .sort({ createdAt: -1 });
    res.status(200).json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── CREATE Grievance ─────────────────────────────────────────────────────────
// Any authenticated user can submit a grievance
exports.createGrievance = async (req, res) => {
  try {
    const user = req.user;
    const { title, description, category, priority, isAnonymous } = req.body;

    if (!title) return res.status(400).json({ error: 'Title is required' });

    const item = new Grievance({
      title,
      description,
      category: category || 'Other',
      priority: priority || 'Medium',
      isAnonymous: isAnonymous || false,
      submittedBy: user._id,
      submitterName: isAnonymous ? 'Anonymous' : user.name,
      submitterRole: user.role,
      submitterDept: user.department || '',
      university: user.university || null,
      college: user.college || null,
    });

    await item.save();

    // Notify college admin if college-level grievance
    if (user.college) {
      try {
        const notification = new Notification({
          college: user.college,
          recipientType: 'ALL',
          title: 'New Grievance Submitted',
          message: `A new grievance "${title}" has been submitted and requires attention.`,
          type: 'System',
          referenceId: item._id.toString()
        });
        await notification.save();
      } catch (notifErr) {
        console.error('Failed to save grievance notification:', notifErr.message);
      }
    }

    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── UPDATE Grievance Status (Admin response) ─────────────────────────────────
exports.updateGrievance = async (req, res) => {
  try {
    const user = req.user;
    const { status, resolution } = req.body;

    const item = await Grievance.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Grievance not found' });

    // Only college admin or super admin can update status
    const isCollegeAdmin = user.role === 'COLLEGE' && item.college && item.college.toString() === user.college?.toString();
    const isSuperAdmin = user.role === 'SUPER_ADMIN' && item.university && item.university.toString() === user.university?.toString();

    if (!isCollegeAdmin && !isSuperAdmin) {
      return res.status(403).json({ message: 'Not authorized to update this grievance' });
    }

    if (status) item.status = status;
    if (resolution) item.resolution = resolution;

    if (status === 'Resolved' || status === 'Closed') {
      item.resolvedBy = user._id;
      item.resolvedAt = new Date();
    }

    await item.save();

    // Notify the grievance submitter
    if (item.submittedBy && item.college) {
      try {
        const notification = new Notification({
          college: item.college,
          recipientType: 'STUDENT',
          recipientStudent: item.submittedBy,
          title: `Grievance ${status}: ${item.title}`,
          message: resolution
            ? `Your grievance has been ${status?.toLowerCase()}. Note: ${resolution}`
            : `Your grievance "${item.title}" has been marked as ${status?.toLowerCase()}.`,
          type: 'System',
          referenceId: item._id.toString()
        });
        await notification.save();
      } catch (notifErr) {
        console.error('Failed to save grievance update notification:', notifErr.message);
      }
    }

    res.status(200).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── DELETE Grievance ─────────────────────────────────────────────────────────
exports.deleteGrievance = async (req, res) => {
  try {
    const user = req.user;
    const item = await Grievance.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Not found' });

    // Allow delete by the submitter or admin
    const isSubmitter = item.submittedBy?.toString() === user._id?.toString();
    const isAdmin = user.role === 'SUPER_ADMIN' || user.role === 'COLLEGE';

    if (!isSubmitter && !isAdmin) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await item.deleteOne();
    res.status(200).json({ message: 'Grievance deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
