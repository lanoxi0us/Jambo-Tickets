const express = require('express');
const r = express.Router();
const ctrl = require('../controllers/contact.controller');
const { protect, restrictTo } = require('../middleware/auth');
r.post('/', ctrl.submitContact);
r.get('/', protect, restrictTo('ADMIN'), ctrl.getAllMessages);
module.exports = r;
