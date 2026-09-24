const express = require('express');

const {
    getDashboardSummary
} = require('../controllers/dashboard.controller');

const {
    authenticate
} = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authenticate);

router.get('/summary', getDashboardSummary);

module.exports = router;