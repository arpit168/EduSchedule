const express = require('express');
const { getEvents, createEvent, updateEvent, deleteEvent } = require('../controllers/calendarController');
const { protect, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

router.route('/')
  .get(protect, getEvents)
  .post(protect, authorize('Admin', 'HOD'), createEvent);

router.route('/:id')
  .put(protect, authorize('Admin', 'HOD'), updateEvent)
  .delete(protect, authorize('Admin', 'HOD'), deleteEvent);

module.exports = router;
