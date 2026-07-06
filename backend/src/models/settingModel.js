import mongoose from 'mongoose';

const periodConfigSchema = new mongoose.Schema({
  periodNumber: { type: Number, required: true },
  name: { type: String, required: true }, // e.g. "Period 1", "Break", "Lunch"
  startTime: { type: String, required: true }, // e.g. "09:00"
  endTime: { type: String, required: true }, // e.g. "09:50"
  isBreak: { type: Boolean, default: false },
  isLunch: { type: Boolean, default: false },
});

const settingSchema = new mongoose.Schema(
  {
    schoolName: {
      type: String,
      default: 'Antigravity Institute of Technology & Sciences',
    },
    logo: {
      type: String,
      default: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=150&auto=format&fit=crop&q=80',
    },
    workingDays: {
      type: [String],
      default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    },
    periods: {
      type: [periodConfigSchema],
      default: [
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
    },
    sessionYear: {
      type: String,
      default: '2026-2027',
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'dark',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Setting', settingSchema);
