import mongoose from 'mongoose';

const corporateSchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true,
    trim: true,
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  walletBalance: {
    type: Number,
    default: 0,
    min: 0,
  },
  employees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  industry: {
    type: String,
    default: '',
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
  },
  contactInfo: {
    phone: String,
    email: String,
    website: String,
  },
  settings: {
    allowanceLimit: {
      type: Number,
      default: 1000,
    },
    autoApproveEmployees: {
      type: Boolean,
      default: false,
    },
    cardExpiryYears: {
      type: Number,
      default: 3,
    },
  },
  status: {
    type: String,
    enum: ['active', 'suspended', 'inactive'],
    default: 'active',
  },
}, {
  timestamps: true,
});

corporateSchema.index({ adminId: 1 });
corporateSchema.index({ companyName: 1 });

export default mongoose.models.Corporate || mongoose.model('Corporate', corporateSchema);