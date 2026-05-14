const express = require('express');
const r = express.Router();
const ctrl = require('../controllers/payout.controller');
const { protect, restrictTo } = require('../middleware/auth');
r.post('/', protect, restrictTo('ORGANISER'), ctrl.requestPayout);
r.get('/my', protect, restrictTo('ORGANISER'), ctrl.getMyPayouts);
r.get('/', protect, restrictTo('ADMIN'), ctrl.getAllPayouts);
r.patch('/:id/status', protect, restrictTo('ADMIN'), ctrl.updatePayoutStatus);
module.exports = r;
