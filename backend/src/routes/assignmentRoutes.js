import express from 'express';
import { getAssignments, createAssignment, updateAssignment, deleteAssignment } from '../controllers/assignmentController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getAssignments)
  .post(protect, authorize('Admin', 'HOD'), createAssignment);

router.route('/:id')
  .put(protect, authorize('Admin', 'HOD'), updateAssignment)
  .delete(protect, authorize('Admin', 'HOD'), deleteAssignment);

export default router;
