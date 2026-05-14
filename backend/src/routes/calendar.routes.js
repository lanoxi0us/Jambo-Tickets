const express = require('express');
const r = express.Router();
const ctrl = require('../controllers/calendar.controller');
r.get('/', ctrl.getCalendarEvents);
module.exports = r;
