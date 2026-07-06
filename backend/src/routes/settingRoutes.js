const express = require('express');
const { getSettings, updateSettings, getAuditLogs } = require('../controllers/settingController');
const { protect, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

router.route('/')
  .get(protect, getSettings)
  .put(protect, authorize('Admin'), updateSettings);

router.get('/audit-logs', protect, authorize('Admin'), getAuditLogs);

module.exports = router;
