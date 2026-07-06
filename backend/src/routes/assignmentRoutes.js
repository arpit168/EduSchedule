const express = require('express');
const { getAssignments, createAssignment, updateAssignment, deleteAssignment } = require('../controllers/assignmentController');
const { protect, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

router.route('/')
  .get(protect, getAssignments)
  .post(protect, authorize('Admin', 'HOD'), createAssignment);

router.route('/:id')
  .put(protect, authorize('Admin', 'HOD'), updateAssignment)
  .delete(protect, authorize('Admin', 'HOD'), deleteAssignment);

module.exports = router;
