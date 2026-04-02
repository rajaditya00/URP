const express = require('express');
const router = express.Router();
const College = require('../models/College');
const { protect, authorize } = require('../middleware/auth');

// GET all colleges for the logged-in university
router.get('/', protect, async (req, res) => {
  try {
    const colleges = await College.find({ university: req.user.university });
    res.json(colleges);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST - Add a new college
router.post('/', protect, authorize('SUPER_ADMIN'), async (req, res) => {
  try {
    const college = new College({ ...req.body, university: req.user.university });
    await college.save();
    res.status(201).json(college);
  } catch (err) {
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
    res.json({ message: 'College removed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
