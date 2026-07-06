import mongoose from 'mongoose';

const teacherSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide teacher name'],
      trim: true,
    },
    employeeId: {
      type: String,
      required: [true, 'Please provide employee ID'],
      unique: true,
      trim: true,
    },
    designation: {
      type: String,
      enum: ['Professor', 'Associate Professor', 'Assistant Professor', 'Lecturer', 'Guest Faculty'],
      default: 'Assistant Professor',
    },
    department: {
      type: String,
      required: [true, 'Please provide department'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide email'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      default: '',
    },
    specialization: [
      {
        type: String,
        trim: true,
      },
    ],
    maxWeeklyPeriods: {
      type: Number,
      default: 24, // Standard UGC/AICTE max workload
    },
    preferredSlots: [
      {
        day: { type: String, enum: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] },
        periodNumber: { type: Number },
      },
    ],
    unavailableSlots: [
      {
        day: { type: String, enum: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] },
        periodNumber: { type: Number },
        reason: { type: String, default: 'Busy' },
      },
    ],
    isVisiting: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['Active', 'On Leave', 'Inactive'],
      default: 'Active',
    },
    colorCode: {
      type: String,
      default: '#6366F1', // Indigo for timetable UI
    },
    userRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for instant search
teacherSchema.index({ name: 'text', employeeId: 'text', email: 'text' });

export default mongoose.model('Teacher', teacherSchema);
