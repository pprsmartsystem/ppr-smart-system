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
    enum: ['admin', 'corporate', 'employee', 'user'],
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
    min: 0,
  },
  corporateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Corporate',
    required: function() {
      return this.role === 'employee';
    },
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
}, {
  timestamps: true,
});

userSchema.index({ email: 1 });
userSchema.index({ role: 1, status: 1 });

export default mongoose.models.User || mongoose.model('User', userSchema);