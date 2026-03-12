import mongoose from 'mongoose';

const BroadcastSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.models.Broadcast || mongoose.model('Broadcast', BroadcastSchema);
