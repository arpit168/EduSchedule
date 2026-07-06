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
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Please provide department'],
    },
    credits: {
      type: Number,
      required: true,
      default: 3,
    },
    weeklyRequiredPeriods: {
      type: Number,
      required: true,
      default: 4,
    },
    assignedTeachers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher',
      },
    ],
    type: {
      type: String,
      enum: ['Theory', 'Lab', 'Seminar', 'Project'],
      default: 'Theory',
    },
    color: {
      type: String,
      default: 'indigo', // indigo, emerald, violet, amber, rose, cyan, blue, purple
    },
  },
  {
    timestamps: true,
  }
);

subjectSchema.index({ name: 'text', code: 'text' });

export default mongoose.model('Subject', subjectSchema);
