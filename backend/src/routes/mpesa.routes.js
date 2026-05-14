const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/mpesa.controller');

router.post('/callback', ctrl.callback);
router.get('/status/:checkoutRequestId', ctrl.pollStatus);

module.exports = router;
