import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: true,
    unique: true,
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  tax: {
    type: Number,
    default: 0,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['draft', 'sent', 'paid', 'cancelled'],
    default: 'draft',
  },
  dueDate: Date,
  paidAt: Date,
  items: [{
    description: String,
    quantity: Number,
    price: Number,
    amount: Number,
  }],
  notes: String,
}, {
  timestamps: true,
});

export default mongoose.models.Invoice || mongoose.model('Invoice', invoiceSchema);
