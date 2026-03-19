import mongoose from 'mongoose';

const kycSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  bankName: String,
  accountNumber: String,
  ifscCode: String,
  bankDocument: String,
  aadhaarFront: String,
  aadhaarBack: String,
  panCard: String,
  gstCertificate: String,
  msmeCertificate: String,
  otherDocument: String,
  otherDocumentRemark: String,
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'rekyc'],
    default: 'pending',
  },
  rejectionReason: String,
  rekycReason: String,
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  reviewedAt: Date,
}, {
  timestamps: true,
});

export default mongoose.models.KYC || mongoose.model('KYC', kycSchema);
