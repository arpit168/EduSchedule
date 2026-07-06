import mongoose from 'mongoose';

const classSchema = new mongoose.Schema(
  {
    className: {
      type: String,
      required: [true, 'Please provide class name (e.g. BCA, BTech CSE)'],
      trim: true,
    },
    section: {
      type: String,
      required: [true, 'Please provide section (e.g. 1A, 2B, A)'],
      trim: true,
    },
    semester: {
      type: Number,
      required: [true, 'Please provide semester'],
      min: 1,
      max: 10,
    },
    batchYear: {
      type: String,
      required: [true, 'Please provide batch year (e.g. 2025-2028)'],
      trim: true,
    },
    department: {
      type: String,
      required: true,
      trim: true,
    },
    classTeacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
      default: null,
    },
    studentCount: {
      type: Number,
      default: 60,
    },
    defaultRoom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      default: null,
    },
    status: {
      type: String,
      enum: ['Active', 'Archived'],
      default: 'Active',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate class-section in same batch
classSchema.index({ className: 1, section: 1, batchYear: 1 }, { unique: true });

export default mongoose.model('Class', classSchema);
