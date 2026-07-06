import express from 'express';
import {
  getTimetables,
  getTeacherTimetable,
  getClassTimetable,
  checkConflictApi,
  updateSlot,
  swapSlots,
  triggerAutoGenerate,
} from '../controllers/timetableController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getTimetables)
  .post(protect, authorize('Admin', 'HOD'), updateSlot);

router.post('/swap', protect, authorize('Admin', 'HOD'), swapSlots);
router.post('/check-conflict', protect, checkConflictApi);
router.post('/auto-generate', protect, authorize('Admin'), triggerAutoGenerate);

router.get('/teacher/:teacherId', protect, getTeacherTimetable);
router.get('/class/:classId', protect, getClassTimetable);

export default router;
