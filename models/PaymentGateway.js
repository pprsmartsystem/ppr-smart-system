import mongoose from 'mongoose';

const paymentGatewaySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['qr_code', 'payment_link', 'payment_form'],
    required: true,
  },
  qrCodeUrl: String,
  paymentLink: String,
  formHtml: String,
  isActive: {
    type: Boolean,
    default: true,
  },
  instructions: String,
}, {
  timestamps: true,
});

export default mongoose.models.PaymentGateway || mongoose.model('PaymentGateway', paymentGatewaySchema);
