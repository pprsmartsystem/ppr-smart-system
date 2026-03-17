import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: false,
  },
  serviceName: {
    type: String,
  },
  amount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'cancelled', 'refunded'],
    default: 'pending',
  },
  paymentMethod: {
    type: String,
    enum: ['razorpay', 'wallet', 'bank_transfer'],
    default: 'razorpay',
  },
  paymentId: String,
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending',
  },
  deliveryStatus: {
    type: String,
    enum: ['pending', 'delivered', 'failed'],
    default: 'pending',
  },
  deliveryProof: {
    type: String,
  },
  deliveryNotes: String,
  deliveredAt: Date,
  invoiceId: String,
}, {
  timestamps: true,
});

export default mongoose.models.Order || mongoose.model('Order', orderSchema);
