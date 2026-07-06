import Teacher from '../models/teacherModel.js';
import ClassModel from '../models/classModel.js';
import Subject from '../models/subjectModel.js';
import Room from '../models/roomModel.js';
import Timetable from '../models/timetableModel.js';
import Department from '../models/departmentModel.js';

const getDashboardStats = async (req, res, next) => {
  try {
    const totalTeachers = await Teacher.countDocuments();
    const totalClasses = await ClassModel.countDocuments();
    const totalSubjects = await Subject.countDocuments();
    const totalRooms = await Room.countDocuments();

    // Determine current day and period for live occupancy stats
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const now = new Date();
    const currentDay = daysOfWeek[now.getDay()]; // e.g. 'Monday'
    
    // For demo/default, if Sunday or outside working hours, default to 'Monday' Period 2 for active preview
    const activeDay = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].includes(currentDay) ? currentDay : 'Monday';
    const activePeriod = 2; // Default to period 2 for live demo stats

    const allTimetables = await Timetable.find({ sessionYear: '2026-2027' }).populate('slots.teacher slots.room classRef');
    
    let todaysClassesCount = 0;
    const occupiedTeacherIds = new Set();
    const upcomingClasses = [];

    for (const tt of allTimetables) {
      for (const slot of tt.slots) {
        if (slot.isBreak || slot.isLunch) continue;
        if (slot.day === activeDay && slot.subject && slot.teacher) {
          todaysClassesCount++;
          if (slot.periodNumber === activePeriod) {
            occupiedTeacherIds.add(slot.teacher._id.toString());
          }
          if (slot.periodNumber >= activePeriod) {
            upcomingClasses.push({
              classRef: tt.classRef,
              subject: slot.subject,
              teacher: slot.teacher,
              room: slot.room,
              timeSlot: slot.timeSlot,
              periodNumber: slot.periodNumber,
            });
          }
        }
      }
    }

    const freeTeachersCount = Math.max(0, totalTeachers - occupiedTeacherIds.size);

    // Sort upcoming classes by period number
    upcomingClasses.sort((a, b) => a.periodNumber - b.periodNumber);

    res.status(200).json({
      success: true,
      stats: {
        totalTeachers,
        totalClasses,
        totalSubjects,
        totalRooms,
        todaysClasses: todaysClassesCount,
        freeTeachers: freeTeachersCount,
        occupiedTeachers: occupiedTeacherIds.size,
        upcomingClasses: upcomingClasses.slice(0, 8), // top 8 upcoming
      },
    });
  } catch (error) {
    next(error);
  }
};

const getTeacherWorkloadReport = async (req, res, next) => {
  try {
    const { department } = req.query;
    const query = {};
    if (department && department !== 'all') query.department = department;

    const teachers = await Teacher.find(query).populate('department', 'name code');
    const allTimetables = await Timetable.find({ sessionYear: '2026-2027' }).populate('slots.teacher');

    const workloadMap = {};
    teachers.forEach((t) => {
      workloadMap[t._id.toString()] = {
        teacherId: t._id,
        name: t.name,
        employeeId: t.employeeId,
        department: t.department ? t.department.name : 'N/A',
        maxWeeklyPeriods: t.maxWeeklyPeriods || 20,
        assignedPeriods: 0,
        utilizationPercentage: 0,
      };
    });

    for (const tt of allTimetables) {
      for (const slot of tt.slots) {
        if (slot.isBreak || slot.isLunch || !slot.teacher) continue;
        const tid = slot.teacher._id ? slot.teacher._id.toString() : slot.teacher.toString();
        if (workloadMap[tid]) {
          workloadMap[tid].assignedPeriods++;
        }
      }
    }

    const report = Object.values(workloadMap).map((item) => ({
      ...item,
      utilizationPercentage: Math.min(100, Math.round((item.assignedPeriods / item.maxWeeklyPeriods) * 100)),
    }));

    // Also build chart data by department
    const deptChartMap = {};
    report.forEach((r) => {
      if (!deptChartMap[r.department]) {
        deptChartMap[r.department] = { name: r.department, assigned: 0, capacity: 0 };
      }
      deptChartMap[r.department].assigned += r.assignedPeriods;
      deptChartMap[r.department].capacity += r.maxWeeklyPeriods;
    });

    res.status(200).json({
      success: true,
      data: report,
      chartData: Object.values(deptChartMap),
    });
  } catch (error) {
    next(error);
  }
};

const getSubjectDistributionReport = async (req, res, next) => {
  try {
    const subjects = await Subject.find().populate('department', 'name code');
    
    const byType = { Theory: 0, Lab: 0, Seminar: 0, Project: 0 };
    const byDept = {};

    subjects.forEach((s) => {
      byType[s.type || 'Theory'] = (byType[s.type || 'Theory'] || 0) + 1;
      const deptName = s.department ? s.department.name : 'General';
      byDept[deptName] = (byDept[deptName] || 0) + 1;
    });

    const typeChart = Object.keys(byType).map((key) => ({ name: key, value: byType[key] }));
    const deptChart = Object.keys(byDept).map((key) => ({ name: key, value: byDept[key] }));

    res.status(200).json({
      success: true,
      byType: typeChart,
      byDepartment: deptChart,
      totalSubjects: subjects.length,
    });
  } catch (error) {
    next(error);
  }
};

const getRoomUsageReport = async (req, res, next) => {
  try {
    const rooms = await Room.find().sort({ roomNumber: 1 });
    const allTimetables = await Timetable.find({ sessionYear: '2026-2027' }).populate('slots.room');

    // Total working periods per week = 6 days * 8 periods = 48 periods
    const MAX_WEEKLY_SLOTS = 48;
    const roomUsageMap = {};

    rooms.forEach((r) => {
      roomUsageMap[r._id.toString()] = {
        roomId: r._id,
        roomNumber: r.roomNumber,
        building: r.building,
        type: r.type,
        capacity: r.capacity,
        occupiedPeriods: 0,
        utilizationPercentage: 0,
      };
    });

    for (const tt of allTimetables) {
      for (const slot of tt.slots) {
        if (slot.isBreak || slot.isLunch || !slot.room) continue;
        const rid = slot.room._id ? slot.room._id.toString() : slot.room.toString();
        if (roomUsageMap[rid]) {
          roomUsageMap[rid].occupiedPeriods++;
        }
      }
    }

    const report = Object.values(roomUsageMap).map((item) => ({
      ...item,
      utilizationPercentage: Math.min(100, Math.round((item.occupiedPeriods / MAX_WEEKLY_SLOTS) * 100)),
    }));

    res.status(200).json({ success: true, data: report });
  } catch (error) {
    next(error);
  }
};

const getFreeTeachersFinder = async (req, res, next) => {
  try {
    const { day = 'Monday', periodNumber = 1, department } = req.query;
    const query = {};
    if (department && department !== 'all') query.department = department;

    const allTeachers = await Teacher.find(query).populate('department', 'name code');
    const allTimetables = await Timetable.find({ sessionYear: '2026-2027' }).populate('slots.teacher');

    const occupiedTeacherIds = new Set();
    for (const tt of allTimetables) {
      for (const slot of tt.slots) {
        if (slot.day === day && slot.periodNumber === Number(periodNumber) && slot.teacher) {
          occupiedTeacherIds.add(slot.teacher._id ? slot.teacher._id.toString() : slot.teacher.toString());
        }
      }
    }

    const freeTeachers = allTeachers.filter((t) => !occupiedTeacherIds.has(t._id.toString()));

    res.status(200).json({
      success: true,
      count: freeTeachers.length,
      data: freeTeachers,
    });
  } catch (error) {
    next(error);
  }
};

export {
  getDashboardStats,
  getTeacherWorkloadReport,
  getSubjectDistributionReport,
  getRoomUsageReport,
  getFreeTeachersFinder,
};
