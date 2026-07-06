import express from 'express';
import { getDepartments, getDepartmentById, createDepartment, updateDepartment, deleteDepartment } from '../controllers/departmentController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getDepartments)
  .post(protect, authorize('Admin'), createDepartment);

router.route('/:id')
  .get(protect, getDepartmentById)
  .put(protect, authorize('Admin', 'HOD'), updateDepartment)
  .delete(protect, authorize('Admin'), deleteDepartment);

export default router;
