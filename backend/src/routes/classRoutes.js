const express = require('express');
const { getClasses, getClassById, createClass, updateClass, deleteClass } = require('../controllers/classController');
const { protect, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

router.route('/')
  .get(protect, getClasses)
  .post(protect, authorize('Admin', 'HOD'), createClass);

router.route('/:id')
  .get(protect, getClassById)
  .put(protect, authorize('Admin', 'HOD'), updateClass)
  .delete(protect, authorize('Admin'), deleteClass);

module.exports = router;
