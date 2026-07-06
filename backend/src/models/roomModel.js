import mongoose from 'mongoose';

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
      enum: ['Lecture Hall', 'Computer Lab', 'Physics Lab', 'Chemistry Lab', 'Workshop', 'Seminar Hall', 'Faculty Room'],
      default: 'Lecture Hall',
    },
    building: {
      type: String,
      required: [true, 'Please provide building name/block'],
      trim: true,
      default: 'Main Block',
    },
    floor: {
      type: Number,
      default: 1,
    },
    hasProjector: {
      type: Boolean,
      default: true,
    },
    hasAC: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['Available', 'Under Maintenance', 'Reserved'],
      default: 'Available',
    },
  },
  {
    timestamps: true,
  }
);

roomSchema.index({ roomNumber: 'text', building: 'text' });

export default mongoose.model('Room', roomSchema);
