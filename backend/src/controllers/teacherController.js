import Teacher from '../models/teacherModel.js';
import User from '../models/userModel.js';
import { importTeachersFromExcel } from '../services/importExportService.js';
import fs from 'fs';

const getTeachers = async (req, res, next) => {
  try {
    const { search, department, sort = '-createdAt', page = 1, limit = 50 } = req.query;

    const query = {};

    if (department && department !== 'all') {
      query.department = department;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Teacher.countDocuments(query);
    const teachers = await Teacher.find(query)
      .populate('department', 'name code')
      .populate('userAccount', 'role email')
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: teachers.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: teachers,
    });
  } catch (error) {
    next(error);
  }
};

const getTeacherById = async (req, res, next) => {
  try {
    const teacher = await Teacher.findById(req.params.id)
      .populate('department', 'name code')
      .populate('userAccount', 'role email');

    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }
    res.status(200).json({ success: true, data: teacher });
  } catch (error) {
    next(error);
  }
};

const createTeacher = async (req, res, next) => {
  try {
    const teacher = await Teacher.create(req.body);
    const populated = await Teacher.findById(teacher._id).populate('department', 'name code');
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

const updateTeacher = async (req, res, next) => {
  try {
    const teacher = await Teacher.findByIdAndUpdate(req.params.id, req.body, {
      returnDocument: 'after',
      runValidators: true,
    }).populate('department', 'name code');

    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }
    res.status(200).json({ success: true, data: teacher });
  } catch (error) {
    next(error);
  }
};

const deleteTeacher = async (req, res, next) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    await teacher.deleteOne();
    res.status(200).json({ success: true, message: 'Teacher removed successfully' });
  } catch (error) {
    next(error);
  }
};

const bulkUploadTeachers = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an Excel file' });
    }

    const { importedCount, errors } = await importTeachersFromExcel(req.file.path);

    // remove temp file
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(200).json({
      success: true,
      importedCount,
      errors,
      message: `Successfully imported/updated ${importedCount} teachers from Excel!`,
    });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};

export { getTeachers, getTeacherById, createTeacher, updateTeacher, deleteTeacher, bulkUploadTeachers };
