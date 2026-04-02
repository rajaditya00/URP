const Grievance = require('../models/Grievance');

exports.getGrievances = async (req, res) => {
  try {
    const items = await Grievance.find({ university: req.user.university });
    res.status(200).json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createGrievance = async (req, res) => {
  try {
    const item = new Grievance({
      ...req.body,
      university: req.user.university
    });
    await item.save();
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteGrievance = async (req, res) => {
  try {
    const item = await Grievance.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Not found' });
    if (item.university.toString() !== req.user.university.toString()) {
        return res.status(403).json({ message: 'Unauthorized' });
    }
    await item.deleteOne();
    res.status(200).json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
