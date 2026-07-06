import express from 'express';
import { getClasses, getClassById, createClass, updateClass, deleteClass } from '../controllers/classController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getClasses)
  .post(protect, authorize('Admin', 'HOD'), createClass);

router.route('/:id')
  .get(protect, getClassById)
  .put(protect, authorize('Admin', 'HOD'), updateClass)
  .delete(protect, authorize('Admin'), deleteClass);

export default router;
