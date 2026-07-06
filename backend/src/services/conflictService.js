import Timetable from '../models/timetableModel.js';
import Teacher from '../models/teacherModel.js';
import Room from '../models/roomModel.js';
import AcademicCalendar from '../models/calendarModel.js';
import Setting from '../models/settingModel.js';

/**
 * Enterprise Conflict Detection Engine
 * Checks all scheduling constraints before a class slot is created or modified.
 */
const checkSlotConflicts = async ({
  day,
  periodNumber,
  teacherId,
  roomId,
  classRefId,
  sessionYear = '2026-2027',
  ignoreSlotId = null, // when editing/swapping an existing slot
}) => {
  const conflicts = [];

  // 1. Check Global School Working Days
  const settings = await Setting.findOne();
  if (settings && settings.workingDays && !settings.workingDays.includes(day)) {
    conflicts.push({
      type: 'HOLIDAY_CONFLICT',
      severity: 'HIGH',
      message: `${day} is marked as a non-working day / holiday in School Settings!`,
    });
  }

  // 2. Check Teacher Constraints (if teacher is assigned)
  if (teacherId) {
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      conflicts.push({
        type: 'UNAVAILABLE_TEACHER',
        severity: 'HIGH',
        message: 'Assigned teacher does not exist in the system.',
      });
    } else {
      // Check working days
      if (teacher.workingDays && !teacher.workingDays.includes(day)) {
        conflicts.push({
          type: 'UNAVAILABLE_TEACHER',
          severity: 'HIGH',
          message: `Teacher ${teacher.name} (${teacher.employeeId}) is not available on ${day}s!`,
        });
      }

      // Check available time slots
      const periodString = `Period ${periodNumber}`;
      if (teacher.availableTimeSlots && !teacher.availableTimeSlots.includes(periodString)) {
        conflicts.push({
          type: 'UNAVAILABLE_TEACHER',
          severity: 'MEDIUM',
          message: `Teacher ${teacher.name} is not available during ${periodString}!`,
        });
      }

      // Fetch all timetables for this session year to check double booking and workload limits
      const allTimetables = await Timetable.find({ sessionYear }).populate('classRef');
      
      let dailyPeriodsCount = 0;
      let weeklyPeriodsCount = 0;

      for (const tt of allTimetables) {
        for (const slot of tt.slots) {
          if (slot.isBreak || slot.isLunch) continue;
          if (ignoreSlotId && slot._id && slot._id.toString() === ignoreSlotId.toString()) continue;

          if (slot.teacher && slot.teacher.toString() === teacherId.toString()) {
            weeklyPeriodsCount++;
            if (slot.day === day) {
              dailyPeriodsCount++;
            }

            // Check Double Booking: Same Teacher, Same Day, Same Period, Different Class/Slot
            if (slot.day === day && slot.periodNumber === periodNumber) {
              const className = tt.classRef ? `${tt.classRef.className} ${tt.classRef.section}` : 'Another Class';
              conflicts.push({
                type: 'TEACHER_DOUBLE_BOOKING',
                severity: 'CRITICAL',
                message: `Teacher ${teacher.name} is already teaching ${className} on ${day} at Period ${periodNumber}!`,
                conflictingSlot: slot,
                conflictingClass: className,
              });
            }
          }
        }
      }

      // Check Daily & Weekly Max Periods limit
      if (dailyPeriodsCount >= (teacher.maxDailyPeriods || 4)) {
        conflicts.push({
          type: 'EXCEED_MAX_PERIODS',
          severity: 'MEDIUM',
          message: `Teacher ${teacher.name} has already reached maximum daily limit (${teacher.maxDailyPeriods} periods) for ${day}!`,
        });
      }
      if (weeklyPeriodsCount >= (teacher.maxWeeklyPeriods || 20)) {
        conflicts.push({
          type: 'EXCEED_MAX_PERIODS',
          severity: 'MEDIUM',
          message: `Teacher ${teacher.name} has reached maximum weekly workload limit (${teacher.maxWeeklyPeriods} periods)!`,
        });
      }
    }
  }

  // 3. Check Room Constraints (if room is assigned)
  if (roomId) {
    const room = await Room.findById(roomId);
    if (!room || !room.isAvailable) {
      conflicts.push({
        type: 'UNAVAILABLE_ROOM',
        severity: 'HIGH',
        message: `Room is currently unavailable or under maintenance!`,
      });
    } else {
      // Check Room Double Booking
      const allTimetables = await Timetable.find({ sessionYear }).populate('classRef');
      for (const tt of allTimetables) {
        for (const slot of tt.slots) {
          if (slot.isBreak || slot.isLunch) continue;
          if (ignoreSlotId && slot._id && slot._id.toString() === ignoreSlotId.toString()) continue;

          if (slot.room && slot.room.toString() === roomId.toString() && slot.day === day && slot.periodNumber === periodNumber) {
            const className = tt.classRef ? `${tt.classRef.className} ${tt.classRef.section}` : 'Another Class';
            conflicts.push({
              type: 'ROOM_DOUBLE_BOOKING',
              severity: 'CRITICAL',
              message: `Room ${room.roomNumber} (${room.building}) is already occupied by ${className} on ${day} at Period ${periodNumber}!`,
              conflictingSlot: slot,
              conflictingClass: className,
            });
          }
        }
      }
    }
  }

  return {
    hasConflict: conflicts.length > 0,
    conflicts,
    criticalCount: conflicts.filter((c) => c.severity === 'CRITICAL').length,
  };
};

export { checkSlotConflicts };
