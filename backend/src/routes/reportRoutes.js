const express = require('express');
const {
  getDashboardStats,
  getTeacherWorkloadReport,
  getSubjectDistributionReport,
  getRoomUsageReport,
  getFreeTeachersFinder,
} = require('../controllers/reportController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/stats', protect, getDashboardStats);
router.get('/workload', protect, getTeacherWorkloadReport);
router.get('/subjects', protect, getSubjectDistributionReport);
router.get('/rooms', protect, getRoomUsageReport);
router.get('/free-teachers', protect, getFreeTeachersFinder);

module.exports = router;
