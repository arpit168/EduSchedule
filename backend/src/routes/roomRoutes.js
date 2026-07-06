const express = require('express');
const { getRooms, getRoomById, createRoom, updateRoom, deleteRoom, bulkUploadRooms } = require('../controllers/roomController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const upload = require('../utils/upload');

const router = express.Router();

router.route('/')
  .get(protect, getRooms)
  .post(protect, authorize('Admin'), createRoom);

router.post('/bulk-upload', protect, authorize('Admin'), upload.single('file'), bulkUploadRooms);

router.route('/:id')
  .get(protect, getRoomById)
  .put(protect, authorize('Admin'), updateRoom)
  .delete(protect, authorize('Admin'), deleteRoom);

module.exports = router;
