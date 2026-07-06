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
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Please provide department'],
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
    qualification: {
      type: String,
      default: 'M.Tech / Ph.D',
    },
    experience: {
      type: Number,
      default: 5, // in years
    },
    workingDays: {
      type: [String],
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    },
    availableTimeSlots: {
      type: [String],
      default: ['Period 1', 'Period 2', 'Period 3', 'Period 4', 'Period 5', 'Period 6', 'Period 7', 'Period 8'],
    },
    maxDailyPeriods: {
      type: Number,
      default: 4,
    },
    maxWeeklyPeriods: {
      type: Number,
      default: 20,
    },
    profilePhoto: {
      type: String,
      default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
    userAccount: {
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
