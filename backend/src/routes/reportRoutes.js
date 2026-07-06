import express from 'express';
import {
  getDashboardStats,
  getTeacherWorkloadReport,
  getSubjectDistributionReport,
  getRoomUsageReport,
  getFreeTeachersFinder,
} from '../controllers/reportController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/stats', protect, getDashboardStats);
router.get('/workload', protect, getTeacherWorkloadReport);
router.get('/subjects', protect, getSubjectDistributionReport);
router.get('/rooms', protect, getRoomUsageReport);
router.get('/free-teachers', protect, getFreeTeachersFinder);

export default router;
