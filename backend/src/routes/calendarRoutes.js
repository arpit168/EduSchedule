import express from 'express';
import { getEvents, createEvent, updateEvent, deleteEvent } from '../controllers/calendarController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getEvents)
  .post(protect, authorize('Admin', 'HOD'), createEvent);

router.route('/:id')
  .put(protect, authorize('Admin', 'HOD'), updateEvent)
  .delete(protect, authorize('Admin', 'HOD'), deleteEvent);

export default router;
