import express from 'express';
import { getRooms, getRoomById, createRoom, updateRoom, deleteRoom, bulkUploadRooms } from '../controllers/roomController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import upload from '../utils/upload.js';

const router = express.Router();

router.route('/')
  .get(protect, getRooms)
  .post(protect, authorize('Admin'), createRoom);

router.post('/bulk-upload', protect, authorize('Admin'), upload.single('file'), bulkUploadRooms);

router.route('/:id')
  .get(protect, getRoomById)
  .put(protect, authorize('Admin'), updateRoom)
  .delete(protect, authorize('Admin'), deleteRoom);

export default router;
