import mongoose from 'mongoose';

const settlementSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  spendAmount: {
    type: Number,
    required: true,
  },
  settlementRate: {
    type: Number,
    default: 1.77, // 1.77%
  },
  settlementAmount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'processed', 'paused'],
    default: 'pending',
  },
  type: {
    type: String,
    enum: ['auto', 'manual'],
    default: 'auto',
  },
  processedAt: Date,
  scheduledFor: Date,
}, {
  timestamps: true,
});

export default mongoose.models.Settlement || mongoose.model('Settlement', settlementSchema);