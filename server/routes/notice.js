const express = require('express');
const router = express.Router();
const Notice = require('../models/Notice');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload'); // Added multer support

// Create a notice (Super Admin)
router.post('/', protect, authorize('SUPER_ADMIN'), upload.single('noticePdf'), async (req, res) => {
    try {
        const { title, description } = req.body;
        // Construct the URL path correctly since req.file.path depends on the OS
        const pdfUrl = req.file ? `uploads/noticePdf/${req.file.filename}` : null;

        const notice = new Notice({
            title,
            description,
            pdfUrl,
            university: req.user.university // Taken from authenticated user
        });

        await notice.save();
        res.json(notice);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get notices for a university (Super Admin, College, Professor, Student)
router.get('/', protect, async (req, res) => {
    try {
        // Find notices that belong to the user's university
        const notices = await Notice.find({ university: req.user.university }).sort({ createdAt: -1 });
        res.json(notices);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Delete a notice (Super Admin)
router.delete('/:id', protect, authorize('SUPER_ADMIN'), async (req, res) => {
    try {
        const notice = await Notice.findById(req.params.id);
        if (!notice) return res.status(404).json({ msg: 'Notice not found' });
        
        // Check authority
        if (notice.university.toString() !== req.user.university.toString()) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        await Notice.deleteOne({ _id: notice._id });
        res.json({ msg: 'Notice removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
