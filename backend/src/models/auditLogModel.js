import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    user: {
      type: String, // User Name or ID or 'System'
      default: 'System',
    },
    role: {
      type: String,
      default: 'Admin',
    },
    action: {
      type: String,
      required: true, // e.g. 'CREATE', 'UPDATE', 'DELETE', 'GENERATE_TIMETABLE'
    },
    module: {
      type: String,
      required: true, // e.g. 'Timetable', 'Teacher', 'Subject', 'Class', 'Room', 'Auth'
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    ipAddress: {
      type: String,
      default: '127.0.0.1',
    },
  },
  {
    timestamps: true,
  }
);

auditLogSchema.index({ createdAt: -1, module: 1 });

export default mongoose.model('AuditLog', auditLogSchema);
