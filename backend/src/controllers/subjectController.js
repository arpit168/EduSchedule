import Subject from '../models/subjectModel.js';
import { importSubjectsFromExcel } from '../services/importExportService.js';
import fs from 'fs';

const getSubjects = async (req, res, next) => {
  try {
    const { search, department, sort = 'name' } = req.query;
    const query = {};

    if (department && department !== 'all') {
      query.department = department;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
      ];
    }

    const subjects = await Subject.find(query)
      .populate('department', 'name code')
      .populate('assignedTeachers', 'name employeeId email profilePhoto')
      .sort(sort);

    res.status(200).json({ success: true, count: subjects.length, data: subjects });
  } catch (error) {
    next(error);
  }
};

const getSubjectById = async (req, res, next) => {
  try {
    const subject = await Subject.findById(req.params.id)
      .populate('department', 'name code')
      .populate('assignedTeachers', 'name employeeId email profilePhoto');

    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }
    res.status(200).json({ success: true, data: subject });
  } catch (error) {
    next(error);
  }
};

const createSubject = async (req, res, next) => {
  try {
    const subject = await Subject.create(req.body);
    const populated = await Subject.findById(subject._id)
      .populate('department', 'name code')
      .populate('assignedTeachers', 'name employeeId');
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

const updateSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findByIdAndUpdate(req.params.id, req.body, {
      returnDocument: 'after',
      runValidators: true,
    })
      .populate('department', 'name code')
      .populate('assignedTeachers', 'name employeeId');

    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }
    res.status(200).json({ success: true, data: subject });
  } catch (error) {
    next(error);
  }
};

const deleteSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    await subject.deleteOne();
    res.status(200).json({ success: true, message: 'Subject removed successfully' });
  } catch (error) {
    next(error);
  }
};

const bulkUploadSubjects = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an Excel file' });
    }

    const { importedCount, errors } = await importSubjectsFromExcel(req.file.path);

    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(200).json({
      success: true,
      importedCount,
      errors,
      message: `Successfully imported/updated ${importedCount} subjects from Excel!`,
    });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};

export { getSubjects, getSubjectById, createSubject, updateSubject, deleteSubject, bulkUploadSubjects };
