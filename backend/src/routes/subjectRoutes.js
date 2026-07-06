import express from 'express';
import { getSubjects, getSubjectById, createSubject, updateSubject, deleteSubject, bulkUploadSubjects } from '../controllers/subjectController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import upload from '../utils/upload.js';

const router = express.Router();

router.route('/')
  .get(protect, getSubjects)
  .post(protect, authorize('Admin', 'HOD'), createSubject);

router.post('/bulk-upload', protect, authorize('Admin'), upload.single('file'), bulkUploadSubjects);

router.route('/:id')
  .get(protect, getSubjectById)
  .put(protect, authorize('Admin', 'HOD'), updateSubject)
  .delete(protect, authorize('Admin'), deleteSubject);

export default router;
