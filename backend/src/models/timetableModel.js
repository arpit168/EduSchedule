import mongoose from 'mongoose';

const periodSlotSchema = new mongoose.Schema({
  day: {
    type: String,
    enum: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    required: true,
  },
  periodNumber: {
    type: Number,
    required: true, // 1 to 8 (or 0 for break/lunch)
  },
  timeSlot: {
    type: String, // e.g., "09:00 - 09:50"
    default: '',
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    default: null,
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    default: null,
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    default: null,
  },
  isBreak: {
    type: Boolean,
    default: false,
  },
  breakLabel: {
    type: String,
    default: '', // e.g. "Tea Break", "Lunch"
  },
});

const timetableSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    classRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
    },
    academicYear: {
      type: String,
      default: '2026-2027',
    },
    semester: {
      type: Number,
      required: true,
    },
    schedule: [periodSlotSchema],
    status: {
      type: String,
      enum: ['Draft', 'Published', 'Archived'],
      default: 'Draft',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent multiple active timetables for same class in same academic year
timetableSchema.index({ classRef: 1, academicYear: 1, semester: 1 }, { unique: true });

export default mongoose.model('Timetable', timetableSchema);
