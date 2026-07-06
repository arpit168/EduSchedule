import Notification from '../models/notificationModel.js';

const getNotifications = async (req, res, next) => {
  try {
    const { role = 'All' } = req.query;
    const userId = req.user ? req.user._id.toString() : null;

    const query = {
      $or: [{ recipient: 'All' }, { recipient: role }, { recipient: userId }],
    };

    const notifications = await Notification.find(query).sort({ createdAt: -1 }).limit(30);
    const unreadCount = await Notification.countDocuments({ ...query, isRead: false });

    res.status(200).json({ success: true, count: notifications.length, unreadCount, data: notifications });
  } catch (error) {
    next(error);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.status(200).json({ success: true, message: 'Marked as read' });
  } catch (error) {
    next(error);
  }
};

const markAllAsRead = async (req, res, next) => {
  try {
    const { role = 'All' } = req.query;
    const userId = req.user ? req.user._id.toString() : null;

    const query = {
      $or: [{ recipient: 'All' }, { recipient: role }, { recipient: userId }],
    };

    await Notification.updateMany(query, { isRead: true });
    res.status(200).json({ success: true, message: 'Marked all as read' });
  } catch (error) {
    next(error);
  }
};

const createNotification = async (req, res, next) => {
  try {
    const notification = await Notification.create(req.body);
    const io = req.app.get('io');
    if (io) {
      io.emit('new_notification', notification);
    }
    res.status(201).json({ success: true, data: notification });
  } catch (error) {
    next(error);
  }
};

export { getNotifications, markAsRead, markAllAsRead, createNotification };
