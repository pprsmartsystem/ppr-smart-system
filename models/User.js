import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  role: {
    type: String,
    enum: ['admin', 'corporate', 'employee', 'user', 'distributor', 'masterdistributor'],
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'blocked'],
    default: 'pending',
  },
  walletBalance: {
    type: Number,
    default: 0,
  },
  corporateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Corporate',
    required: function() {
      return this.role === 'employee';
    },
  },
  distributorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  masterDistributorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  avatar: {
    type: String,
    default: '',
  },
  phone: {
    type: String,
    default: '',
  },
  lastLogin: {
    type: Date,
  },
  isOnHold: {
    type: Boolean,
    default: false,
  },
  holdReason: {
    type: String,
    default: null,
  },
  heldAt: {
    type: Date,
    default: null,
  },
  settlementBlocked: {
    type: Boolean,
    default: false,
  },
  settlementBlockReason: {
    type: String,
    default: null,
  },
  settlementRate: {
    type: Number,
    default: null, // null = use global rate (1.77%)
  },
}, {
  timestamps: true,
});

userSchema.index({ role: 1, status: 1 });

delete mongoose.models.User;
export default mongoose.model('User', userSchema);