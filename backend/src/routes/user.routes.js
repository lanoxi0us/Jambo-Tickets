const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/user.controller');
const { protect, restrictTo } = require('../middleware/auth');

router.get('/admin/dashboard', protect, restrictTo('ADMIN'), ctrl.getAdminDashboard);
router.get('/organiser/dashboard', protect, restrictTo('ORGANISER', 'ADMIN'), ctrl.getOrganiserDashboard);
router.get('/', protect, restrictTo('ADMIN'), ctrl.getAllUsers);
router.put('/:id/role', protect, restrictTo('ADMIN'), ctrl.updateUserRole);
router.put('/:id/suspend', protect, restrictTo('ADMIN'), ctrl.suspendUser);

module.exports = router;
