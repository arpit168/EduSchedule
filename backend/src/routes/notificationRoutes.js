import express from 'express';
import { getNotifications, markAsRead, markAllAsRead, createNotification } from '../controllers/notificationController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getNotifications)
  .post(protect, authorize('Admin'), createNotification);

router.put('/mark-all-read', protect, markAllAsRead);
router.put('/:id/read', protect, markAsRead);

export default router;
