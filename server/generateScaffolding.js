const fs = require('fs');
const path = require('path');

const domains = [
  { name: 'Placement', var: 'placement' },
  { name: 'Examination', var: 'examination' },
  { name: 'Notice', var: 'notice' },
  { name: 'Event', var: 'event' }, // Non-Academic
  { name: 'College', var: 'college' },
  { name: 'Facility', var: 'facility' },
  { name: 'Grievance', var: 'grievance' }
];

domains.forEach(domain => {
  // MODEL
  const modelContent = `const mongoose = require('mongoose');

const ${domain.var}Schema = new mongoose.Schema({
  university: { type: mongoose.Schema.Types.ObjectId, ref: 'University', required: true },
  title: { type: String, required: true },
  description: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('${domain.name}', ${domain.var}Schema);
`;
  fs.writeFileSync(path.join(__dirname, 'models', `${domain.name}.js`), modelContent);

  // CONTROLLER
  const controllerContent = `const ${domain.name} = require('../models/${domain.name}');

exports.get${domain.name}s = async (req, res) => {
  try {
    const items = await ${domain.name}.find({ university: req.user.university });
    res.status(200).json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create${domain.name} = async (req, res) => {
  try {
    const item = new ${domain.name}({
      ...req.body,
      university: req.user.university
    });
    await item.save();
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.delete${domain.name} = async (req, res) => {
  try {
    const item = await ${domain.name}.findById(req.params.id);
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
`;
  fs.writeFileSync(path.join(__dirname, 'controllers', `${domain.var}Controller.js`), controllerContent);

  // ROUTE
  const routeContent = `const express = require('express');
const router = express.Router();
const { get${domain.name}s, create${domain.name}, delete${domain.name} } = require('../controllers/${domain.var}Controller');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(protect, get${domain.name}s)
  .post(protect, authorize('SUPER_ADMIN', 'COLLEGE_ADMIN'), create${domain.name});

router.route('/:id')
  .delete(protect, authorize('SUPER_ADMIN'), delete${domain.name});

module.exports = router;
`;
  fs.writeFileSync(path.join(__dirname, 'routes', `${domain.var}s.js`), routeContent);
});

console.log('Successfully generated Models, Controllers, and Routes for:', domains.map(d => d.name).join(', '));
