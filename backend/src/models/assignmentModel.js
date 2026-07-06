import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema(
  {
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
      required: [true, 'Please provide teacher'],
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, 'Please provide subject'],
    },
    classRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: [true, 'Please provide class'],
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      default: null, // preferred room
    },
    weeklyPeriods: {
      type: Number,
      default: 4,
    },
    sessionYear: {
      type: String,
      default: '2026-2027',
    },
  },
  {
    timestamps: true,
  }
);

assignmentSchema.index({ teacher: 1, subject: 1, classRef: 1, sessionYear: 1 }, { unique: true });

export default mongoose.model('Assignment', assignmentSchema);
