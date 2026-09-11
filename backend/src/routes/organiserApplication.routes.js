const express = require('express');
const r = express.Router();
const ctrl = require('../controllers/organiserApplication.controller');
const { protect, restrictTo } = require('../middleware/auth');

r.post('/', protect, ctrl.submitApplication);
r.get('/my', protect, ctrl.getMyApplications);
r.get('/', protect, restrictTo('ADMIN'), ctrl.getAllApplications);
r.patch('/:id/status', protect, restrictTo('ADMIN'), ctrl.updateApplicationStatus);

module.exports = r;
