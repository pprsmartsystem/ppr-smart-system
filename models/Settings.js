import mongoose from 'mongoose';

const SettingsSchema = new mongoose.Schema({
  currency: {
    type: String,
    default: 'INR'
  },
  currencySymbol: {
    type: String,
    default: '₹'
  },
  cardExpiryYears: {
    type: Number,
    default: 3
  },
  maxSpendingLimit: {
    type: Number,
    default: 100000
  },
  minSpendingLimit: {
    type: Number,
    default: 100
  },
  allowUserRegistration: {
    type: Boolean,
    default: true
  },
  requireApproval: {
    type: Boolean,
    default: true
  },
  fast2smsApiKey: {
    type: String,
    default: ''
  },
  fast2smsEnabled: {
    type: Boolean,
    default: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);
