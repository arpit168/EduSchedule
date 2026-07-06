const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
  day: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    required: true,
  },
  periodNumber: {
    type: Number,
    required: true, // 1 to 8 (or 0 for break/lunch)
  },
  periodName: {
    type: String, // e.g. "Period 1", "Break", "Period 4", "Lunch"
  },
  timeSlot: {
    type: String, // e.g. "09:00-09:50"
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
  isLunch: {
    type: Boolean,
    default: false,
  },
});

const timetableSchema = new mongoose.Schema(
  {
    classRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
    },
    sessionYear: {
      type: String,
      default: '2026-2027',
      required: true,
    },
    status: {
      type: String,
      enum: ['Draft', 'Published'],
      default: 'Published',
    },
    slots: [slotSchema],
  },
  {
    timestamps: true,
  }
);

timetableSchema.index({ classRef: 1, sessionYear: 1 }, { unique: true });

module.exports = mongoose.model('Timetable', timetableSchema);
