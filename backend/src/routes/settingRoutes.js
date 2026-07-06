import express from 'express';
import { getSettings, updateSettings, getAuditLogs } from '../controllers/settingController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getSettings)
  .put(protect, authorize('Admin'), updateSettings);

router.get('/audit-logs', protect, authorize('Admin'), getAuditLogs);

export default router;
