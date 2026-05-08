import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  ticketNumber: {
    type: String,
    unique: true,
  },
  subject: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['account', 'payment', 'card', 'kyc', 'settlement', 'technical', 'other'],
    default: 'other',
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  },
  status: {
    type: String,
    enum: ['open', 'replied', 'in_progress', 'resolved', 'closed'],
    default: 'open',
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  attachments: [{
    url: String,
    filename: String,
    uploadedAt: { type: Date, default: Date.now },
  }],
  replies: [{
    message: String,
    isAdmin: Boolean,
    adminName: String,
    adminId: mongoose.Schema.Types.ObjectId,
    attachments: [{
      url: String,
      filename: String,
    }],
    createdAt: { type: Date, default: Date.now },
  }],
  rating: {
    score: { type: Number, min: 1, max: 5 },
    feedback: String,
    ratedAt: Date,
  },
  lastActivityAt: {
    type: Date,
    default: Date.now,
  },
  closedAt: Date,
  resolvedAt: Date,
  unreadByUser: {
    type: Boolean,
    default: false,
  },
  unreadByAdmin: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Generate unique ticket number
ticketSchema.pre('save', async function(next) {
  if (!this.ticketNumber) {
    const count = await mongoose.model('Ticket').countDocuments();
    this.ticketNumber = `TKT${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

export default mongoose.models.Ticket || mongoose.model('Ticket', ticketSchema);
