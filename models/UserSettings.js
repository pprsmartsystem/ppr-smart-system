import mongoose from 'mongoose';

const userSettingsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  autoSettlement: { type: Boolean, default: true },
  autoCashback: { type: Boolean, default: true },
  settlementRate: { type: Number, default: 1.77 },
  cashbackRate: { type: Number, default: 4 },
  maintenanceMode: { type: Boolean, default: false },
  maintenanceMessage: {
    type: String,
    default: 'We would like to inform you that due to an internal system update, our platform is currently under maintenance.\n\nDuring this period, certain services may be temporarily unavailable. We request you to kindly hold your transactions until the maintenance is completed.\n\nOur team is actively working to restore all services at the earliest.',
  },
}, { timestamps: true });

// Clear cached model to pick up schema changes
delete mongoose.models.UserSettings;
export default mongoose.model('UserSettings', userSettingsSchema);
