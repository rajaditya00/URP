const Facility = require('../models/Facility');

// ─── GET Facilities ───────────────────────────────────────────────────────────
exports.getFacilities = async (req, res) => {
  try {
    const user = req.user;
    const { type, status } = req.query;
    let query = {};

    if (user.role === 'SUPER_ADMIN') {
      query.university = user.university;
    } else {
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

    const items = await Facility.find(query).sort({ type: 1, createdAt: -1 });
    res.status(200).json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── CREATE Facility ──────────────────────────────────────────────────────────
exports.createFacility = async (req, res) => {
  try {
    const user = req.user;
    const { title, description, type, location, capacity, operatingHours, inCharge, contactNo, imageUrl, status } = req.body;

    if (!title) return res.status(400).json({ error: 'Title is required' });

    const item = new Facility({
      title,
      description,
      type: type || 'Other',
      location,
      capacity,
      operatingHours,
      inCharge,
      contactNo,
      imageUrl,
      status: status || 'Operational',
      university: user.university || null,
      college: user.college || null,
    });

    await item.save();
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── UPDATE Facility ──────────────────────────────────────────────────────────
exports.updateFacility = async (req, res) => {
  try {
    const user = req.user;
    const item = await Facility.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Facility not found' });

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

// ─── DELETE Facility ──────────────────────────────────────────────────────────
exports.deleteFacility = async (req, res) => {
  try {
    const user = req.user;
    const item = await Facility.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Not found' });

    const isSameCollege = item.college && item.college.toString() === user.college?.toString();
    const isSameUni = item.university && item.university.toString() === user.university?.toString();
    if (!isSameCollege && !isSameUni) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await item.deleteOne();
    res.status(200).json({ message: 'Facility deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
