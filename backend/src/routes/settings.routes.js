const express = require('express');
const r = express.Router();
const ctrl = require('../controllers/settings.controller');
const { protect, restrictTo } = require('../middleware/auth');
r.get('/', ctrl.getSettings);
r.put('/', protect, restrictTo('ADMIN'), ctrl.updateSettings);
module.exports = r;
