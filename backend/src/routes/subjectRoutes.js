const express = require('express');
const { getSubjects, getSubjectById, createSubject, updateSubject, deleteSubject, bulkUploadSubjects } = require('../controllers/subjectController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const upload = require('../utils/upload');

const router = express.Router();

router.route('/')
  .get(protect, getSubjects)
  .post(protect, authorize('Admin', 'HOD'), createSubject);

router.post('/bulk-upload', protect, authorize('Admin'), upload.single('file'), bulkUploadSubjects);

router.route('/:id')
  .get(protect, getSubjectById)
  .put(protect, authorize('Admin', 'HOD'), updateSubject)
  .delete(protect, authorize('Admin'), deleteSubject);

module.exports = router;
