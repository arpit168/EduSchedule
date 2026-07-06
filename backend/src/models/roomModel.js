const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    roomNumber: {
      type: String,
      required: [true, 'Please provide room number'],
      unique: true,
      trim: true,
    },
    capacity: {
      type: Number,
      required: true,
      default: 60,
    },
    type: {
      type: String,
      enum: ['Classroom', 'Lab', 'Auditorium', 'Seminar Hall'],
      default: 'Classroom',
    },
    building: {
      type: String,
      required: [true, 'Please provide building name/block'],
      default: 'Main Block',
    },
    floor: {
      type: String,
      default: '1st Floor',
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

roomSchema.index({ roomNumber: 'text', building: 'text' });

module.exports = mongoose.model('Room', roomSchema);
