import express from 'express';
import { getTeachers, getTeacherById, createTeacher, updateTeacher, deleteTeacher, bulkUploadTeachers } from '../controllers/teacherController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import upload from '../utils/upload.js';

const router = express.Router();

router.route('/')
  .get(protect, getTeachers)
  .post(protect, authorize('Admin', 'HOD'), createTeacher);

router.post('/bulk-upload', protect, authorize('Admin'), upload.single('file'), bulkUploadTeachers);

router.route('/:id')
  .get(protect, getTeacherById)
  .put(protect, authorize('Admin', 'HOD'), updateTeacher)
  .delete(protect, authorize('Admin'), deleteTeacher);

export default router;
