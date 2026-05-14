const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/event.controller');
const { protect, restrictTo, optionalAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', ctrl.getEvents);
router.get('/admin/all', protect, restrictTo('ADMIN'), ctrl.getAllEventsAdmin);
router.get('/organiser/mine', protect, restrictTo('ORGANISER', 'ADMIN'), ctrl.getOrganiserEvents);
router.get('/:slug', ctrl.getEventBySlug);
router.post('/', protect, restrictTo('ORGANISER', 'ADMIN'), upload.single('coverImage'), ctrl.createEvent);
router.put('/:id', protect, restrictTo('ORGANISER', 'ADMIN'), upload.single('coverImage'), ctrl.updateEvent);
router.delete('/:id', protect, restrictTo('ORGANISER', 'ADMIN'), ctrl.deleteEvent);
router.get('/:id/analytics', protect, restrictTo('ORGANISER', 'ADMIN'), ctrl.getEventAnalytics);
router.patch('/:id/approve', protect, restrictTo('ADMIN'), ctrl.approveEvent);

module.exports = router;
