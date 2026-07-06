import Assignment from '../models/assignmentModel.js';

const getAssignments = async (req, res, next) => {
  try {
    const { classRef, teacher, subject, sessionYear = '2026-2027' } = req.query;
    const query = { sessionYear };

    if (classRef && classRef !== 'all') query.classRef = classRef;
    if (teacher && teacher !== 'all') query.teacher = teacher;
    if (subject && subject !== 'all') query.subject = subject;

    const assignments = await Assignment.find(query)
      .populate('teacher', 'name employeeId email profilePhoto')
      .populate('subject', 'name code credits color')
      .populate('classRef', 'className section semester')
      .populate('room', 'roomNumber building type')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: assignments.length, data: assignments });
  } catch (error) {
    next(error);
  }
};

const createAssignment = async (req, res, next) => {
  try {
    const assignment = await Assignment.create(req.body);
    const populated = await Assignment.findById(assignment._id)
      .populate('teacher', 'name employeeId')
      .populate('subject', 'name code')
      .populate('classRef', 'className section')
      .populate('room', 'roomNumber');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

const updateAssignment = async (req, res, next) => {
  try {
    const assignment = await Assignment.findByIdAndUpdate(req.params.id, req.body, {
      returnDocument: 'after',
      runValidators: true,
    })
      .populate('teacher', 'name employeeId')
      .populate('subject', 'name code')
      .populate('classRef', 'className section')
      .populate('room', 'roomNumber');

    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }
    res.status(200).json({ success: true, data: assignment });
  } catch (error) {
    next(error);
  }
};

const deleteAssignment = async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }
    await assignment.deleteOne();
    res.status(200).json({ success: true, message: 'Assignment removed successfully' });
  } catch (error) {
    next(error);
  }
};

export { getAssignments, createAssignment, updateAssignment, deleteAssignment };
