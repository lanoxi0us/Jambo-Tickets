const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/booking.controller');
const { protect, restrictTo, optionalAuth } = require('../middleware/auth');

router.post('/initiate', optionalAuth, ctrl.initiateBooking);
router.get('/admin/all', protect, restrictTo('ADMIN'), ctrl.getAllBookingsAdmin);
router.get('/my', protect, ctrl.getMyBookings);
router.get('/confirm/:bookingRef', ctrl.confirmBooking);
router.get('/download/:bookingRef', ctrl.downloadTicket);
router.get('/qr/:bookingRef', ctrl.getQRCode);
router.post('/scan/:qrCode', protect, restrictTo('ADMIN', 'ORGANISER'), ctrl.scanTicket);
router.get('/:id', protect, ctrl.getSingleBooking);

module.exports = router;
