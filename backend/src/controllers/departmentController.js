import Department from '../models/departmentModel.js';
import Teacher from '../models/teacherModel.js';
import Subject from '../models/subjectModel.js';
import ClassModel from '../models/classModel.js';

const getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find().populate('hod', 'name email employeeId profilePhoto');
    res.status(200).json({ success: true, count: departments.length, data: departments });
  } catch (error) {
    next(error);
  }
};

const getDepartmentById = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id).populate('hod', 'name email employeeId profilePhoto');
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }
    res.status(200).json({ success: true, data: department });
  } catch (error) {
    next(error);
  }
};

const createDepartment = async (req, res, next) => {
  try {
    const { name, code, hod, description } = req.body;
    const department = await Department.create({ name, code, hod: hod || null, description });
    res.status(201).json({ success: true, data: department });
  } catch (error) {
    next(error);
  }
};

const updateDepartment = async (req, res, next) => {
  try {
    const department = await Department.findByIdAndUpdate(req.params.id, req.body, {
      returnDocument: 'after',
      runValidators: true,
    }).populate('hod', 'name email employeeId profilePhoto');

    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }
    res.status(200).json({ success: true, data: department });
  } catch (error) {
    next(error);
  }
};

const deleteDepartment = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    // Check if teachers or subjects exist in this department
    const teachersCount = await Teacher.countDocuments({ department: req.params.id });
    if (teachersCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete department. There are ${teachersCount} teachers assigned to this department.`,
      });
    }

    await department.deleteOne();
    res.status(200).json({ success: true, message: 'Department deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export { getDepartments, getDepartmentById, createDepartment, updateDepartment, deleteDepartment };
