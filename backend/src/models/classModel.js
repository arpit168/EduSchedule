const mongoose = require('mongoose');

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
      default: 1,
    },
    batch: {
      type: String,
      required: [true, 'Please provide batch year (e.g. 2025-2028)'],
      default: '2025-2028',
    },
    strength: {
      type: Number,
      required: true,
      default: 60,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Please provide department'],
    },
  },
  {
    timestamps: true,
  }
);

// Virtual field for full name like "BCA 2A"
classSchema.virtual('fullName').get(function () {
  return `${this.className} ${this.section}`;
});

classSchema.set('toJSON', { virtuals: true });
classSchema.set('toObject', { virtuals: true });

classSchema.index({ className: 1, section: 1 }, { unique: true });

module.exports = mongoose.model('Class', classSchema);
