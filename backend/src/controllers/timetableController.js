import Timetable from '../models/timetableModel.js';
import Notification from '../models/notificationModel.js';
import AuditLog from '../models/auditLogModel.js';
import { checkSlotConflicts } from '../services/conflictService.js';
import { generateTimetable } from '../services/generatorService.js';

const getTimetables = async (req, res, next) => {
  try {
    const { sessionYear = '2026-2027', classRef } = req.query;
    const query = { sessionYear };
    if (classRef && classRef !== 'all') query.classRef = classRef;

    const timetables = await Timetable.find(query)
      .populate({
        path: 'classRef',
        populate: { path: 'department', select: 'name code' },
      })
      .populate('slots.subject', 'name code credits color type')
      .populate('slots.teacher', 'name employeeId email profilePhoto')
      .populate('slots.room', 'roomNumber building type');

    res.status(200).json({ success: true, count: timetables.length, data: timetables });
  } catch (error) {
    next(error);
  }
};

const getTeacherTimetable = async (req, res, next) => {
  try {
    const { teacherId } = req.params;
    const { sessionYear = '2026-2027' } = req.query;

    const allTimetables = await Timetable.find({ sessionYear })
      .populate('classRef', 'className section semester')
      .populate('slots.subject', 'name code credits color type')
      .populate('slots.teacher', 'name employeeId email profilePhoto')
      .populate('slots.room', 'roomNumber building type');

    const teacherSlots = [];
    for (const tt of allTimetables) {
      for (const slot of tt.slots) {
        if (slot.teacher && slot.teacher._id.toString() === teacherId.toString()) {
          teacherSlots.push({
            ...slot.toObject(),
            classInfo: tt.classRef,
            sessionYear: tt.sessionYear,
            timetableId: tt._id,
          });
        }
      }
    }

    res.status(200).json({ success: true, count: teacherSlots.length, data: teacherSlots });
  } catch (error) {
    next(error);
  }
};

const getClassTimetable = async (req, res, next) => {
  try {
    const { classId } = req.params;
    const { sessionYear = '2026-2027' } = req.query;

    const timetable = await Timetable.findOne({ classRef: classId, sessionYear })
      .populate('classRef', 'className section semester strength')
      .populate('slots.subject', 'name code credits color type')
      .populate('slots.teacher', 'name employeeId email profilePhoto')
      .populate('slots.room', 'roomNumber building type');

    if (!timetable) {
      return res.status(404).json({ success: false, message: 'Timetable not found for this class' });
    }

    res.status(200).json({ success: true, data: timetable });
  } catch (error) {
    next(error);
  }
};

const checkConflictApi = async (req, res, next) => {
  try {
    const { day, periodNumber, teacherId, roomId, classRefId, sessionYear = '2026-2027', ignoreSlotId } = req.body;
    const result = await checkSlotConflicts({ day, periodNumber, teacherId, roomId, classRefId, sessionYear, ignoreSlotId });
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

const updateSlot = async (req, res, next) => {
  try {
    const { classRefId, sessionYear = '2026-2027', day, periodNumber, subject, teacher, room, force = false } = req.body;

    // Check conflicts unless force bypass is requested
    const conflictCheck = await checkSlotConflicts({
      day,
      periodNumber,
      teacherId: teacher || null,
      roomId: room || null,
      classRefId,
      sessionYear,
    });

    if (conflictCheck.hasConflict && conflictCheck.criticalCount > 0 && !force) {
      return res.status(409).json({
        success: false,
        message: 'Scheduling conflict detected!',
        conflicts: conflictCheck.conflicts,
      });
    }

    let timetable = await Timetable.findOne({ classRef: classRefId, sessionYear });
    if (!timetable) {
      timetable = await Timetable.create({
        classRef: classRefId,
        sessionYear,
        status: 'Published',
        slots: [],
      });
    }

    const slotIndex = timetable.slots.findIndex((s) => s.day === day && s.periodNumber === Number(periodNumber));
    if (slotIndex !== -1) {
      timetable.slots[slotIndex].subject = subject || null;
      timetable.slots[slotIndex].teacher = teacher || null;
      timetable.slots[slotIndex].room = room || null;
    } else {
      timetable.slots.push({
        day,
        periodNumber: Number(periodNumber),
        periodName: `Period ${periodNumber}`,
        subject: subject || null,
        teacher: teacher || null,
        room: room || null,
      });
    }

    await timetable.save();

    const populated = await Timetable.findById(timetable._id)
      .populate('classRef', 'className section')
      .populate('slots.subject', 'name code color')
      .populate('slots.teacher', 'name employeeId email profilePhoto')
      .populate('slots.room', 'roomNumber building');

    // Emit Socket.io event
    const io = req.app.get('io');
    if (io) {
      io.emit('timetable_updated', { classRefId, sessionYear, day, periodNumber, updatedTimetable: populated });
    }

    // Audit log
    await AuditLog.create({
      user: req.user ? req.user.name : 'Admin',
      role: req.user ? req.user.role : 'Admin',
      action: 'UPDATE_SLOT',
      module: 'Timetable',
      details: { classRefId, day, periodNumber, subject, teacher, room },
      ipAddress: req.ip,
    });

    res.status(200).json({ success: true, data: populated, conflictsBypassed: force && conflictCheck.hasConflict ? conflictCheck.conflicts : [] });
  } catch (error) {
    next(error);
  }
};

const swapSlots = async (req, res, next) => {
  try {
    const { source, target, sessionYear = '2026-2027', force = false } = req.body;
    // source & target: { classRefId, day, periodNumber }

    const ttSource = await Timetable.findOne({ classRef: source.classRefId, sessionYear });
    const ttTarget = await Timetable.findOne({ classRef: target.classRefId, sessionYear });

    if (!ttSource || !ttTarget) {
      return res.status(404).json({ success: false, message: 'Source or target timetable not found' });
    }

    const sourceSlotIndex = ttSource.slots.findIndex((s) => s.day === source.day && s.periodNumber === Number(source.periodNumber));
    const targetSlotIndex = ttTarget.slots.findIndex((s) => s.day === target.day && s.periodNumber === Number(target.periodNumber));

    const sourceSlot = sourceSlotIndex !== -1 ? ttSource.slots[sourceSlotIndex] : null;
    const targetSlot = targetSlotIndex !== -1 ? ttTarget.slots[targetSlotIndex] : null;

    // Check conflicts for swapped positions
    const conflictCheckSource = await checkSlotConflicts({
      day: source.day,
      periodNumber: source.periodNumber,
      teacherId: targetSlot ? targetSlot.teacher : null,
      roomId: targetSlot ? targetSlot.room : null,
      classRefId: source.classRefId,
      sessionYear,
    });

    const conflictCheckTarget = await checkSlotConflicts({
      day: target.day,
      periodNumber: target.periodNumber,
      teacherId: sourceSlot ? sourceSlot.teacher : null,
      roomId: sourceSlot ? sourceSlot.room : null,
      classRefId: target.classRefId,
      sessionYear,
    });

    const allConflicts = [...(conflictCheckSource.conflicts || []), ...(conflictCheckTarget.conflicts || [])];
    const hasCritical = allConflicts.some((c) => c.severity === 'CRITICAL');

    if (hasCritical && !force) {
      return res.status(409).json({
        success: false,
        message: 'Swap creates a scheduling clash!',
        conflicts: allConflicts,
      });
    }

    // Perform swap
    const tempSubject = sourceSlot ? sourceSlot.subject : null;
    const tempTeacher = sourceSlot ? sourceSlot.teacher : null;
    const tempRoom = sourceSlot ? sourceSlot.room : null;

    if (sourceSlotIndex !== -1) {
      ttSource.slots[sourceSlotIndex].subject = targetSlot ? targetSlot.subject : null;
      ttSource.slots[sourceSlotIndex].teacher = targetSlot ? targetSlot.teacher : null;
      ttSource.slots[sourceSlotIndex].room = targetSlot ? targetSlot.room : null;
    }

    if (targetSlotIndex !== -1) {
      ttTarget.slots[targetSlotIndex].subject = tempSubject;
      ttTarget.slots[targetSlotIndex].teacher = tempTeacher;
      ttTarget.slots[targetSlotIndex].room = tempRoom;
    }

    await ttSource.save();
    if (source.classRefId !== target.classRefId) {
      await ttTarget.save();
    }

    const io = req.app.get('io');
    if (io) {
      io.emit('timetable_updated', { message: 'Slots swapped successfully' });
    }

    res.status(200).json({ success: true, message: 'Periods swapped successfully' });
  } catch (error) {
    next(error);
  }
};

const triggerAutoGenerate = async (req, res, next) => {
  try {
    const { sessionYear = '2026-2027', departmentId, classRefId, overwriteExisting = true } = req.body;

    const result = await generateTimetable({ sessionYear, departmentId, classRefId, overwriteExisting });

    // Notify all via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.emit('timetable_generated', result);
    }

    await Notification.create({
      recipient: 'All',
      title: 'Timetable Auto-Generated',
      message: `Successfully auto-generated timetables for ${result.classesGenerated} classes (${result.totalSlotsGenerated} periods assigned).`,
      type: 'Assignment',
    });

    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export {
  getTimetables,
  getTeacherTimetable,
  getClassTimetable,
  checkConflictApi,
  updateSlot,
  swapSlots,
  triggerAutoGenerate,
};
