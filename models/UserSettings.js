import mongoose from 'mongoose';

const userSettingsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  autoSettlement: {
    type: Boolean,
    default: true,
  },
  autoCashback: {
    type: Boolean,
    default: true,
  },
  settlementRate: {
    type: Number,
    default: 1.77,
  },
  cashbackRate: {
    type: Number,
    default: 4,
  },
}, {
  timestamps: true,
});

export default mongoose.models.UserSettings || mongoose.model('UserSettings', userSettingsSchema);