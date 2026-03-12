import mongoose from 'mongoose';

const cashbackSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  spendAmount: {
    type: Number,
    required: true,
  },
  cashbackRate: {
    type: Number,
    default: 4, // 4%
  },
  cashbackAmount: {
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
}, {
  timestamps: true,
});

export default mongoose.models.Cashback || mongoose.model('Cashback', cashbackSchema);