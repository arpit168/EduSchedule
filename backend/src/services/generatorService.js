import Timetable from '../models/timetableModel.js';
import Assignment from '../models/assignmentModel.js';
import ClassModel from '../models/classModel.js';
import Teacher from '../models/teacherModel.js';
import Room from '../models/roomModel.js';
import Setting from '../models/settingModel.js';
import { checkSlotConflicts } from './conflictService.js';

/**
 * Enterprise Auto Timetable Generator Algorithm
 * Generates clash-free schedules for all classes based on teacher assignments,
 * room availability, weekly credit rules, and workload balancing.
 */
const generateTimetable = async ({
  sessionYear = '2026-2027',
  departmentId = null,
  classRefId = null,
  overwriteExisting = true,
}) => {
  const settings = (await Setting.findOne()) || {
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    periods: [
      { periodNumber: 1, name: 'Period 1', startTime: '09:00', endTime: '09:50', isBreak: false, isLunch: false },
      { periodNumber: 2, name: 'Period 2', startTime: '09:50', endTime: '10:40', isBreak: false, isLunch: false },
      { periodNumber: 3, name: 'Period 3', startTime: '10:40', endTime: '11:30', isBreak: false, isLunch: false },
      { periodNumber: 0, name: 'Short Break', startTime: '11:30', endTime: '11:45', isBreak: true, isLunch: false },
      { periodNumber: 4, name: 'Period 4', startTime: '11:45', endTime: '12:35', isBreak: false, isLunch: false },
      { periodNumber: 5, name: 'Period 5', startTime: '12:35', endTime: '01:25', isBreak: false, isLunch: false },
      { periodNumber: 0, name: 'Lunch Break', startTime: '01:25', endTime: '02:15', isBreak: false, isLunch: true },
      { periodNumber: 6, name: 'Period 6', startTime: '02:15', endTime: '03:05', isBreak: false, isLunch: false },
      { periodNumber: 7, name: 'Period 7', startTime: '03:05', endTime: '03:55', isBreak: false, isLunch: false },
      { periodNumber: 8, name: 'Period 8', startTime: '03:55', endTime: '04:45', isBreak: false, isLunch: false },
    ],
  };

  const workingDays = settings.workingDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const periodConfigs = settings.periods || [];
  const theoryPeriods = periodConfigs.filter((p) => !p.isBreak && !p.isLunch);

  // Build query for classes
  const classQuery = {};
  if (departmentId) classQuery.department = departmentId;
  if (classRefId) classQuery._id = classRefId;

  const classes = await ClassModel.find(classQuery);
  if (classes.length === 0) {
    const error = new Error('No classes found matching your criteria. Please create classes or seed the database before running timetable auto-generation.');
    error.statusCode = 404;
    throw error;
  }

  let totalSlotsGenerated = 0;
  let classesGenerated = 0;
  const generationLogs = [];

  for (const cls of classes) {
    // 1. Fetch Assignments for this class
    const assignments = await Assignment.find({ classRef: cls._id, sessionYear })
      .populate('teacher')
      .populate('subject')
      .populate('room');

    if (assignments.length === 0) {
      generationLogs.push(`Skipped ${cls.className} ${cls.section}: No subject/teacher assignments found.`);
      continue;
    }

    // 2. Prepare empty slots structure
    const slots = [];
    for (const day of workingDays) {
      for (const pConfig of periodConfigs) {
        slots.push({
          day,
          periodNumber: pConfig.periodNumber,
          periodName: pConfig.name,
          timeSlot: `${pConfig.startTime}-${pConfig.endTime}`,
          subject: null,
          teacher: null,
          room: null,
          isBreak: pConfig.isBreak,
          isLunch: pConfig.isLunch,
        });
      }
    }

    // 3. Schedule assignments using greedy heuristic balancing across days
    // Sort assignments by weeklyPeriods descending (hardest to schedule first)
    assignments.sort((a, b) => b.weeklyPeriods - a.weeklyPeriods);

    for (const assign of assignments) {
      let periodsNeeded = assign.weeklyPeriods;
      let periodsScheduled = 0;
      const scheduledDaysForSubject = new Set();

      // Try to place 1 period per day first to balance workload
      for (const day of workingDays) {
        if (periodsScheduled >= periodsNeeded) break;

        // Find an available slot on this day
        for (const pConfig of theoryPeriods) {
          if (periodsScheduled >= periodsNeeded) break;

          const slotIndex = slots.findIndex(
            (s) => s.day === day && s.periodNumber === pConfig.periodNumber && !s.subject && !s.isBreak && !s.isLunch
          );

          if (slotIndex !== -1) {
            // Check conflict against already scheduled database slots & current loop
            const conflictCheck = await checkSlotConflicts({
              day,
              periodNumber: pConfig.periodNumber,
              teacherId: assign.teacher ? assign.teacher._id : null,
              roomId: assign.room ? assign.room._id : null,
              classRefId: cls._id,
              sessionYear,
            });

            if (!conflictCheck.hasConflict || conflictCheck.criticalCount === 0) {
              slots[slotIndex].subject = assign.subject._id;
              slots[slotIndex].teacher = assign.teacher._id;
              slots[slotIndex].room = assign.room ? assign.room._id : null;
              periodsScheduled++;
              scheduledDaysForSubject.add(day);
              totalSlotsGenerated++;
              break; // move to next day for this subject
            }
          }
        }
      }

      // If still need periods (e.g. weeklyPeriods > 6 or couldnt fit 1 per day), allow 2nd slot per day
      if (periodsScheduled < periodsNeeded) {
        for (const day of workingDays) {
          if (periodsScheduled >= periodsNeeded) break;
          for (const pConfig of theoryPeriods) {
            if (periodsScheduled >= periodsNeeded) break;

            const slotIndex = slots.findIndex(
              (s) => s.day === day && s.periodNumber === pConfig.periodNumber && !s.subject && !s.isBreak && !s.isLunch
            );

            if (slotIndex !== -1) {
              const conflictCheck = await checkSlotConflicts({
                day,
                periodNumber: pConfig.periodNumber,
                teacherId: assign.teacher ? assign.teacher._id : null,
                roomId: assign.room ? assign.room._id : null,
                classRefId: cls._id,
                sessionYear,
              });

              if (!conflictCheck.hasConflict || conflictCheck.criticalCount === 0) {
                slots[slotIndex].subject = assign.subject._id;
                slots[slotIndex].teacher = assign.teacher._id;
                slots[slotIndex].room = assign.room ? assign.room._id : null;
                periodsScheduled++;
                totalSlotsGenerated++;
              }
            }
          }
        }
      }

      if (periodsScheduled < periodsNeeded) {
        generationLogs.push(
          `Warning for ${cls.className} ${cls.section}: Could only schedule ${periodsScheduled}/${periodsNeeded} periods for subject ${assign.subject.name} due to constraint clashes.`
        );
      }
    }

    // 4. Save to database
    if (overwriteExisting) {
      await Timetable.findOneAndUpdate(
        { classRef: cls._id, sessionYear },
        { classRef: cls._id, sessionYear, status: 'Published', slots },
        { upsert: true, returnDocument: 'after' }
      );
    } else {
      const existing = await Timetable.findOne({ classRef: cls._id, sessionYear });
      if (!existing) {
        await Timetable.create({ classRef: cls._id, sessionYear, status: 'Published', slots });
      }
    }

    classesGenerated++;
    generationLogs.push(`Successfully generated timetable for ${cls.className} ${cls.section}.`);
  }

  return {
    success: true,
    classesGenerated,
    totalSlotsGenerated,
    logs: generationLogs,
  };
};

export { generateTimetable };
