const express = require('express');
const router = express.Router();
const Result = require('../models/Result');
const { protect, authorize } = require('../middleware/auth');

// Create a Result (Super Admin)
router.post('/', protect, authorize('SUPER_ADMIN'), async (req, res) => {
    try {
        const { title, description, semester, link } = req.body;
        const result = new Result({
            title,
            description,
            semester,
            link,
            university: req.user.university // Taken from authenticated user
        });

        await result.save();
        res.json(result);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get results for a university
router.get('/', protect, async (req, res) => {
    try {
        // Find Results that belong to the user's university
        const results = await Result.find({ university: req.user.university }).sort({ createdAt: -1 });
        res.json(results);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Delete a Result (Super Admin)
router.delete('/:id', protect, authorize('SUPER_ADMIN'), async (req, res) => {
    try {
        const result = await Result.findById(req.params.id);
        if (!result) return res.status(404).json({ msg: 'Result not found' });
        
        // Check authority
        if (result.university.toString() !== req.user.university.toString()) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        await Result.deleteOne({ _id: result._id });
        res.json({ msg: 'Result removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
