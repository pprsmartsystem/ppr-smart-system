import mongoose from 'mongoose';

const cardSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  cardNumber: {
    type: String,
    required: true,
    unique: true,
    length: 16,
  },
  expiryDate: {
    type: String,
    required: true,
  },
  cvv: {
    type: String,
    required: true,
    length: 3,
  },
  pin: {
    type: String,
    length: 4,
  },
  spendingLimit: {
    type: Number,
    required: true,
    min: 0,
  },
  balance: {
    type: Number,
    default: 0,
    min: 0,
  },
  status: {
    type: String,
    enum: ['active', 'frozen', 'expired'],
    default: 'active',
  },
  cardType: {
    type: String,
    enum: ['virtual', 'physical'],
    default: 'virtual',
  },
  cardName: {
    type: String,
    default: 'PPR Smart Card',
  },
  lastUsed: {
    type: Date,
  },
}, {
  timestamps: true,
});

cardSchema.index({ userId: 1 });
cardSchema.index({ cardNumber: 1 });
cardSchema.index({ status: 1 });

export default mongoose.models.Card || mongoose.model('Card', cardSchema);