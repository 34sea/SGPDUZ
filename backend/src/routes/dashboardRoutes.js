const express = require('express');
const router = express.Router();
const controller = require('../controllers/dashboardReportsController');

router.get('/metrics', controller.getDashboardAndReportsData);

module.exports = router;