const express = require('express');
const { getTeachers, getTeacherById, createTeacher, updateTeacher, deleteTeacher, bulkUploadTeachers } = require('../controllers/teacherController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const upload = require('../utils/upload');

const router = express.Router();

router.route('/')
  .get(protect, getTeachers)
  .post(protect, authorize('Admin', 'HOD'), createTeacher);

router.post('/bulk-upload', protect, authorize('Admin'), upload.single('file'), bulkUploadTeachers);

router.route('/:id')
  .get(protect, getTeacherById)
  .put(protect, authorize('Admin', 'HOD'), updateTeacher)
  .delete(protect, authorize('Admin'), deleteTeacher);

module.exports = router;
