const Placement = require('../models/Placement');
const Notification = require('../models/Notification');

// ─── GET Placements ───────────────────────────────────────────────────────────
exports.getPlacements = async (req, res) => {
  try {
    const user = req.user;
    const { status, department, jobType } = req.query;
    let query = {};

    if (user.role === 'SUPER_ADMIN') {
      query.university = user.university;
    } else {
      // College, Faculty, Student - see college-level + university-level placements
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

    // Filter by student's department for better relevance
    if (user.role === 'STUDENT' && user.department) {
      query.$or = query.$or || [{ college: user.college }];
      // Don't force department filter - show all placements, just sort relevant first
    }

    if (status && status !== 'All') query.status = status;
    if (jobType && jobType !== 'All') query.jobType = jobType;

    const items = await Placement.find(query).sort({ createdAt: -1 });
    res.status(200).json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── CREATE Placement ─────────────────────────────────────────────────────────
exports.createPlacement = async (req, res) => {
  try {
    const user = req.user;
    const {
      companyName, companyLogo, jobTitle, description,
      eligibleDepartments, eligibleSemesters, minCGPA, minBacklogs,
      ctcLPA, ctcLabel, jobType, location,
      applicationDeadline, driveDate, selectionProcess, applyLink, contactEmail
    } = req.body;

    if (!companyName || !jobTitle) {
      return res.status(400).json({ error: 'Company name and job title are required' });
    }

    const item = new Placement({
      companyName,
      companyLogo,
      jobTitle,
      description,
      eligibleDepartments: eligibleDepartments || [],
      eligibleSemesters: eligibleSemesters || [],
      minCGPA: minCGPA || 0,
      minBacklogs: minBacklogs || 0,
      ctcLPA,
      ctcLabel: ctcLabel || (ctcLPA ? `${ctcLPA} LPA` : 'As per industry norms'),
      jobType: jobType || 'Full Time',
      location,
      applicationDeadline,
      driveDate,
      selectionProcess: selectionProcess || [],
      applyLink,
      contactEmail,
      status: 'Open',
      university: user.university || null,
      college: user.college || null,
    });

    await item.save();

    // Notify students about new placement opportunity
    if (user.college) {
      try {
        const notification = new Notification({
          college: user.college,
          recipientType: 'ALL',
          title: `Placement: ${companyName} is hiring!`,
          message: `${companyName} is recruiting for ${jobTitle}. CTC: ${item.ctcLabel}. Apply by ${applicationDeadline || 'TBA'}.`,
          type: 'System',
          referenceId: item._id.toString()
        });
        await notification.save();
      } catch (notifErr) {
        console.error('Failed to save placement notification:', notifErr.message);
      }
    }

    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── UPDATE Placement ─────────────────────────────────────────────────────────
exports.updatePlacement = async (req, res) => {
  try {
    const user = req.user;
    const item = await Placement.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Placement not found' });

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

// ─── DELETE Placement ─────────────────────────────────────────────────────────
exports.deletePlacement = async (req, res) => {
  try {
    const user = req.user;
    const item = await Placement.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Not found' });

    const isSameCollege = item.college && item.college.toString() === user.college?.toString();
    const isSameUni = item.university && item.university.toString() === user.university?.toString();
    if (!isSameCollege && !isSameUni) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await item.deleteOne();
    res.status(200).json({ message: 'Placement deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
