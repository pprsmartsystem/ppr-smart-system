import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['open', 'replied', 'closed'],
    default: 'open',
  },
  replies: [{
    message: String,
    isAdmin: Boolean,
    createdAt: { type: Date, default: Date.now },
  }],
}, {
  timestamps: true,
});

export default mongoose.models.Ticket || mongoose.model('Ticket', ticketSchema);
