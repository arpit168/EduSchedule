import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';

import User from '../models/userModel.js';
import Department from '../models/departmentModel.js';
import Teacher from '../models/teacherModel.js';
import Subject from '../models/subjectModel.js';
import ClassModel from '../models/classModel.js';
import Room from '../models/roomModel.js';
import Assignment from '../models/assignmentModel.js';
import Timetable from '../models/timetableModel.js';
import AcademicCalendar from '../models/calendarModel.js';
import Setting from '../models/settingModel.js';
import Notification from '../models/notificationModel.js';
import { generateTimetable } from '../services/generatorService.js';

const seedDatabase = async () => {
  try {
    await connectDB();
    console.log('Connected to MongoDB for Seeding...');

    // Clear existing data
    await User.deleteMany();
    await Department.deleteMany();
    await Teacher.deleteMany();
    await Subject.deleteMany();
    await ClassModel.deleteMany();
    await Room.deleteMany();
    await Assignment.deleteMany();
    await Timetable.deleteMany();
    await AcademicCalendar.deleteMany();
    await Setting.deleteMany();
    await Notification.deleteMany();

    console.log('Old data cleared!');

    // 1. Create Settings
    await Setting.create({
      schoolName: 'Antigravity Institute of Technology & Sciences',
      logo: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=150&auto=format&fit=crop&q=80',
      workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      sessionYear: '2026-2027',
      theme: 'dark',
    });

    // 2. Create Departments
    const cseDept = await Department.create({ name: 'Computer Science & Engineering', code: 'CSE', description: 'Department of Computer Science and Engineering' });
    const itDept = await Department.create({ name: 'Information Technology', code: 'IT', description: 'Department of Information Technology' });
    const mbaDept = await Department.create({ name: 'Business Administration', code: 'MBA', description: 'Department of Management Studies' });

    // 3. Create Users (Admin, HOD, Teacher)
    const adminUser = await User.create({
      name: 'Dr. Arpit Sharma',
      email: 'admin@antigravity.edu',
      password: 'password123',
      role: 'Admin',
      phone: '+91 9876543210',
      profilePhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    });

    const hodUser = await User.create({
      name: 'Dr. Rajesh Rao',
      email: 'hod@antigravity.edu',
      password: 'password123',
      role: 'HOD',
      department: cseDept._id,
      phone: '+91 9876543211',
      profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    });

    const teacherUser1 = await User.create({
      name: 'Prof. Anita Verma',
      email: 'anita@antigravity.edu',
      password: 'password123',
      role: 'Teacher',
      department: cseDept._id,
      phone: '+91 9876543212',
      profilePhoto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    });

    const teacherUser2 = await User.create({
      name: 'Prof. Vikram Singh',
      email: 'vikram@antigravity.edu',
      password: 'password123',
      role: 'Teacher',
      department: cseDept._id,
      phone: '+91 9876543213',
      profilePhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    });

    // 4. Create Teachers
    const tRajesh = await Teacher.create({
      name: 'Dr. Rajesh Rao',
      employeeId: 'EMP1001',
      department: cseDept._id,
      email: 'hod@antigravity.edu',
      phone: '+91 9876543211',
      qualification: 'Ph.D in CSE (IIT Bombay)',
      experience: 16,
      workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      maxDailyPeriods: 3,
      maxWeeklyPeriods: 15,
      profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      userAccount: hodUser._id,
    });

    const tAnita = await Teacher.create({
      name: 'Prof. Anita Verma',
      employeeId: 'EMP1002',
      department: cseDept._id,
      email: 'anita@antigravity.edu',
      phone: '+91 9876543212',
      qualification: 'M.Tech in Software Systems',
      experience: 9,
      workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      maxDailyPeriods: 4,
      maxWeeklyPeriods: 22,
      profilePhoto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
      userAccount: teacherUser1._id,
    });

    const tVikram = await Teacher.create({
      name: 'Prof. Vikram Singh',
      employeeId: 'EMP1003',
      department: cseDept._id,
      email: 'vikram@antigravity.edu',
      phone: '+91 9876543213',
      qualification: 'M.Tech in AI & ML',
      experience: 7,
      workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      maxDailyPeriods: 5,
      maxWeeklyPeriods: 24,
      profilePhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
      userAccount: teacherUser2._id,
    });

    const tSuresh = await Teacher.create({
      name: 'Dr. Suresh Kumar',
      employeeId: 'EMP1004',
      department: itDept._id,
      email: 'suresh@antigravity.edu',
      phone: '+91 9876543214',
      qualification: 'Ph.D in Networking',
      experience: 12,
      workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      maxDailyPeriods: 4,
      maxWeeklyPeriods: 20,
      profilePhoto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
    });

    const tMeha = await Teacher.create({
      name: 'Prof. Meha Kapoor',
      employeeId: 'EMP1005',
      department: mbaDept._id,
      email: 'meha@antigravity.edu',
      phone: '+91 9876543215',
      qualification: 'MBA, Ph.D in Finance',
      experience: 8,
      workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      maxDailyPeriods: 4,
      maxWeeklyPeriods: 18,
      profilePhoto: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
    });

    // Update HOD reference in departments
    cseDept.hod = tRajesh._id;
    await cseDept.save();
    itDept.hod = tSuresh._id;
    await itDept.save();
    mbaDept.hod = tMeha._id;
    await mbaDept.save();

    // 5. Create Rooms
    const r101 = await Room.create({ roomNumber: 'Room 101', capacity: 60, type: 'Classroom', building: 'Main Block', floor: '1st Floor' });
    const r102 = await Room.create({ roomNumber: 'Room 102', capacity: 60, type: 'Classroom', building: 'Main Block', floor: '1st Floor' });
    const r203 = await Room.create({ roomNumber: 'Room 203', capacity: 65, type: 'Classroom', building: 'Tech Block', floor: '2nd Floor' });
    const rLab1 = await Room.create({ roomNumber: 'Computer Lab 1', capacity: 40, type: 'Lab', building: 'Tech Block', floor: '1st Floor' });
    const rLab2 = await Room.create({ roomNumber: 'AI & ML Lab', capacity: 40, type: 'Lab', building: 'Tech Block', floor: '3rd Floor' });
    const rSem = await Room.create({ roomNumber: 'Seminar Hall A', capacity: 120, type: 'Auditorium', building: 'Admin Block', floor: 'Ground Floor' });

    // 6. Create Subjects
    const sDbms = await Subject.create({ name: 'Database Management Systems', code: 'CS301', department: cseDept._id, credits: 4, weeklyRequiredPeriods: 4, assignedTeachers: [tAnita._id, tRajesh._id], color: 'indigo' });
    const sDsa = await Subject.create({ name: 'Data Structures & Algorithms', code: 'CS201', department: cseDept._id, credits: 4, weeklyRequiredPeriods: 4, assignedTeachers: [tVikram._id], color: 'emerald' });
    const sOs = await Subject.create({ name: 'Operating Systems', code: 'CS302', department: cseDept._id, credits: 3, weeklyRequiredPeriods: 3, assignedTeachers: [tAnita._id], color: 'violet' });
    const sCn = await Subject.create({ name: 'Computer Networks', code: 'IT301', department: itDept._id, credits: 3, weeklyRequiredPeriods: 3, assignedTeachers: [tSuresh._id], color: 'blue' });
    const sAi = await Subject.create({ name: 'Artificial Intelligence', code: 'CS401', department: cseDept._id, credits: 4, weeklyRequiredPeriods: 4, assignedTeachers: [tVikram._id, tRajesh._id], color: 'purple' });
    const sWeb = await Subject.create({ name: 'Full Stack Web Development', code: 'IT202', department: itDept._id, credits: 3, weeklyRequiredPeriods: 3, assignedTeachers: [tSuresh._id], color: 'cyan' });
    const sFin = await Subject.create({ name: 'Financial Management', code: 'MB101', department: mbaDept._id, credits: 3, weeklyRequiredPeriods: 3, assignedTeachers: [tMeha._id], color: 'amber' });
    const sLabDbms = await Subject.create({ name: 'DBMS Lab', code: 'CS301L', department: cseDept._id, credits: 2, weeklyRequiredPeriods: 2, assignedTeachers: [tAnita._id], type: 'Lab', color: 'rose' });

    // 7. Create Classes
    const cBca2a = await ClassModel.create({ className: 'BCA', section: '2A', semester: 3, batch: '2025-2028', strength: 55, department: cseDept._id });
    const cBca2b = await ClassModel.create({ className: 'BCA', section: '2B', semester: 3, batch: '2025-2028', strength: 58, department: cseDept._id });
    const cBtech3a = await ClassModel.create({ className: 'BTech CSE', section: '3A', semester: 5, batch: '2024-2028', strength: 60, department: cseDept._id });
    const cMba1a = await ClassModel.create({ className: 'MBA', section: '1A', semester: 1, batch: '2026-2028', strength: 45, department: mbaDept._id });

    // 8. Create Assignments
    await Assignment.create({ teacher: tAnita._id, subject: sDbms._id, classRef: cBca2a._id, room: r203._id, weeklyPeriods: 4 });
    await Assignment.create({ teacher: tVikram._id, subject: sDsa._id, classRef: cBca2a._id, room: r101._id, weeklyPeriods: 4 });
    await Assignment.create({ teacher: tAnita._id, subject: sOs._id, classRef: cBca2a._id, room: r102._id, weeklyPeriods: 3 });
    await Assignment.create({ teacher: tSuresh._id, subject: sCn._id, classRef: cBca2a._id, room: r101._id, weeklyPeriods: 3 });
    await Assignment.create({ teacher: tAnita._id, subject: sLabDbms._id, classRef: cBca2a._id, room: rLab1._id, weeklyPeriods: 2 });

    await Assignment.create({ teacher: tRajesh._id, subject: sDbms._id, classRef: cBca2b._id, room: r203._id, weeklyPeriods: 4 });
    await Assignment.create({ teacher: tVikram._id, subject: sAi._id, classRef: cBtech3a._id, room: rLab2._id, weeklyPeriods: 4 });
    await Assignment.create({ teacher: tSuresh._id, subject: sWeb._id, classRef: cBtech3a._id, room: rLab1._id, weeklyPeriods: 3 });
    await Assignment.create({ teacher: tMeha._id, subject: sFin._id, classRef: cMba1a._id, room: rSem._id, weeklyPeriods: 4 });

    // 9. Trigger Auto Timetable Generator for initial schedule!
    console.log('Running Auto Timetable Generator for realistic schedule...');
    const genResult = await generateTimetable({ sessionYear: '2026-2027', overwriteExisting: true });
    console.log(`Timetable Generation Complete: Generated ${genResult.classesGenerated} classes with ${genResult.totalSlotsGenerated} scheduled periods!`);

    // 10. Create Academic Calendar events
    await AcademicCalendar.create({ title: 'Independence Day Holiday', date: new Date('2026-08-15'), type: 'Holiday', isWorkingDay: false, description: 'National Holiday' });
    await AcademicCalendar.create({ title: 'Mid-Semester Examinations', date: new Date('2026-10-12'), endDate: new Date('2026-10-18'), type: 'Exam', isWorkingDay: true, description: 'Mid-term exams for all semesters' });
    await AcademicCalendar.create({ title: 'Annual Technical Symposium (Antigravity TechFest)', date: new Date('2026-11-05'), type: 'Event', isWorkingDay: true, description: 'National level tech fest and coding competition' });
    await AcademicCalendar.create({ title: 'Winter Vacation Begins', date: new Date('2026-12-24'), endDate: new Date('2027-01-02'), type: 'Holiday', isWorkingDay: false, description: 'Winter break' });

    // 11. Create Notifications
    await Notification.create({ recipient: 'All', title: 'Welcome to Antigravity Timetable System', message: 'The new 2026-2027 Academic Session Timetables have been published and are now live!', type: 'System', isRead: false });
    await Notification.create({ recipient: 'All', title: 'Mid-Semester Exam Dates Announced', message: 'Mid-term exams will start from October 12th. Please review the Academic Calendar.', type: 'Holiday', isRead: false });

    console.log('Database Seeding Completed Successfully! You can now log in with:');
    console.log('Admin: admin@antigravity.edu / password123');
    console.log('Teacher: anita@antigravity.edu / password123');
    console.log('HOD: hod@antigravity.edu / password123');

    process.exit(0);
  } catch (error) {
    console.error('Error during database seeding:', error);
    process.exit(1);
  }
};

seedDatabase();
