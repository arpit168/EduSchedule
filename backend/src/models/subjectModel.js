import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide subject name'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Please provide subject code'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['Theory', 'Lab', 'Seminar', 'Project'],
      default: 'Theory',
    },
    department: {
      type: String,
      required: [true, 'Please provide department'],
      trim: true,
    },
    credits: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
    weeklyPeriods: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    isLab: {
      type: Boolean,
      default: false,
    },
    consecutivePeriods: {
      type: Number,
      default: 1, // 2 or 3 for Lab sessions
    },
    requiresSpecialRoom: {
      type: Boolean,
      default: false,
    },
    specialRoomType: {
      type: String,
      enum: ['Computer Lab', 'Physics Lab', 'Chemistry Lab', 'Workshop', 'Seminar Hall', 'None'],
      default: 'None',
    },
  },
  {
    timestamps: true,
  }
);

subjectSchema.index({ name: 'text', code: 'text' });

export default mongoose.model('Subject', subjectSchema);
