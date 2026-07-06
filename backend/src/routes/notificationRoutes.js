const express = require('express');
const { getNotifications, markAsRead, markAllAsRead, createNotification } = require('../controllers/notificationController');
const { protect, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

router.route('/')
  .get(protect, getNotifications)
  .post(protect, authorize('Admin'), createNotification);

router.put('/mark-all-read', protect, markAllAsRead);
router.put('/:id/read', protect, markAsRead);

module.exports = router;
