const express = require('express');
const r = express.Router();
const ctrl = require('../controllers/newsletter.controller');
const { protect, restrictTo } = require('../middleware/auth');
r.post('/', ctrl.subscribe);
r.get('/', protect, restrictTo('ADMIN'), ctrl.getSubscribers);
module.exports = r;
