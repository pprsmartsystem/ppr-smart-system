import mongoose from 'mongoose';

const brandSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  logo: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['food', 'shopping', 'entertainment', 'travel', 'technology', 'health', 'other'],
  },
  denominations: [{
    value: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'USD',
    },
  }],
  terms: {
    type: String,
    required: true,
  },
  validityDays: {
    type: Number,
    default: 365,
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
  featured: {
    type: Boolean,
    default: false,
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
}, {
  timestamps: true,
});

brandSchema.index({ category: 1, status: 1 });
brandSchema.index({ featured: -1 });

export default mongoose.models.Brand || mongoose.model('Brand', brandSchema);