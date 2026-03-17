import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  action: {
    type: String,
    required: true,
  },
  module: {
    type: String,
    enum: ['service', 'order', 'invoice', 'user', 'payment', 'delivery', 'settings'],
    required: true,
  },
  details: String,
  ipAddress: String,
  userAgent: String,
}, {
  timestamps: true,
});

export default mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema);
