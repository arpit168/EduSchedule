import mongoose from 'mongoose';

const calendarSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide event/holiday title'],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, 'Please provide date'],
    },
    endDate: {
      type: Date,
      default: null,
    },
    type: {
      type: String,
      enum: ['Holiday', 'Exam', 'Event', 'Meeting', 'Other'],
      default: 'Holiday',
    },
    description: {
      type: String,
      default: '',
    },
    isWorkingDay: {
      type: Boolean,
      default: false, // Holidays are not working days
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

calendarSchema.index({ date: 1, sessionYear: 1 });

export default mongoose.model('AcademicCalendar', calendarSchema);
