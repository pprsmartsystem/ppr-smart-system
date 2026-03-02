import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  cardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Card',
  },
  type: {
    type: String,
    enum: ['credit', 'debit', 'voucher', 'transfer', 'refund'],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'pending',
  },
  description: {
    type: String,
    required: true,
  },
  reference: {
    type: String,
    unique: true,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  fromWallet: {
    type: Boolean,
    default: false,
  },
  toWallet: {
    type: Boolean,
    default: false,
  },
  balanceBefore: {
    type: Number,
    default: 0,
  },
  balanceAfter: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

transactionSchema.index({ userId: 1, createdAt: -1 });
transactionSchema.index({ cardId: 1 });
transactionSchema.index({ type: 1, status: 1 });
transactionSchema.index({ reference: 1 });

export default mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);
