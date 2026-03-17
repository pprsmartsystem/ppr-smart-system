import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: String,
  price: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    enum: ['software', 'api', 'hosting', 'license', 'subscription', 'other'],
    default: 'software',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  features: [String],
  deliveryType: {
    type: String,
    enum: ['instant', 'manual', 'email'],
    default: 'manual',
  },
  stock: {
    type: Number,
    default: -1, // -1 means unlimited
  },
}, {
  timestamps: true,
});

export default mongoose.models.Service || mongoose.model('Service', serviceSchema);
