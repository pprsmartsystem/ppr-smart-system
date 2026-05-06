'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { DocumentCheckIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline';

export default function KYCPage() {
  const [formData, setFormData] = useState({
    contactNumber: '',
    panNumber: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    otherDocumentRemark: '',
  });
  const [files, setFiles] = useState({});
  const [uploading, setUploading] = useState(false);
  const [kycStatus, setKycStatus] = useState(null);
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [timer, setTimer] = useState(0);
  const [otpEnabled, setOtpEnabled] = useState(true);

  useEffect(() => {
    fetchKYCStatus();
    fetchSettings();
  }, []);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer(t => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      if (res.ok) {
        const data = await res.json();
        setOtpEnabled(data.settings?.fast2smsEnabled ?? true);
      }
    } catch (error) {
      // Default to enabled if fetch fails
      setOtpEnabled(true);
    }
  };

  const fetchKYCStatus = async () => {
    const res = await fetch('/api/user/kyc/status');
    if (res.ok) {
      const data = await res.json();
      setKycStatus(data.kyc);
    }
  };

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    if (!data.url) throw new Error('Upload failed — no URL returned');
    return data.url;
  };

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5000000) {
        toast.error('File size must be less than 5MB');
        return;
      }
      if (!['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
        toast.error('Only PDF, JPG, JPEG, PNG allowed');
        return;
      }
      setFiles({ ...files, [field]: file });
    }
  };

  const sendOTP = async () => {
    if (!formData.contactNumber || formData.contactNumber.length !== 10) {
      toast.error('Enter valid 10-digit mobile number');
      return;
    }

    setSendingOtp(true);
    try {
      const res = await fetch('/api/user/kyc/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ mobile: formData.contactNumber }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('OTP sent to your mobile');
        setOtpSent(true);
        setTimer(60);
        // Show dev OTP in development mode
        if (data.devOtp) {
          console.log('DEV OTP:', data.devOtp);
          toast.success(`DEV MODE - OTP: ${data.devOtp}`, { duration: 10000 });
        }
      } else {
        // Show dev OTP even on error in development
        if (data.devOtp) {
          console.log('DEV OTP (Error):', data.devOtp);
          toast.error(`${data.error}\n\nDEV OTP: ${data.devOtp}`, { duration: 10000 });
          setOtpSent(true);
          setTimer(60);
        } else {
          toast.error(data.error || 'Failed to send OTP');
        }
      }
    } catch (error) {
      toast.error('Failed to send OTP');
    } finally {
      setSendingOtp(false);
    }
  };

  const verifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      toast.error('Enter valid 6-digit OTP');
      return;
    }

    setVerifyingOtp(true);
    try {
      const res = await fetch('/api/user/kyc/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ mobile: formData.contactNumber, otp }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Mobile number verified!');
        setOtpVerified(true);
      } else {
        toast.error(data.error || 'Invalid OTP');
      }
    } catch (error) {
      toast.error('Verification failed');
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Only check OTP verification if OTP is enabled
    if (otpEnabled && !otpVerified) {
      toast.error('Please verify your mobile number first');
      return;
    }

    setUploading(true);

    try {
      const uploadedUrls = {};

      for (const [key, file] of Object.entries(files)) {
        if (file) {
          const loadingToast = toast.loading(`Uploading ${key.replace(/([A-Z])/g, ' $1').toLowerCase()}...`);
          try {
            uploadedUrls[key] = await uploadToCloudinary(file);
            toast.dismiss(loadingToast);
          } catch (err) {
            toast.dismiss(loadingToast);
            toast.error(`Failed to upload ${key} — please try again`);
            setUploading(false);
            return;
          }
        }
      }

      const res = await fetch('/api/user/kyc/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...formData, ...uploadedUrls }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('KYC submitted successfully!');
        fetchKYCStatus();
      } else {
        toast.error(data.error || 'Submission failed');
      }
    } catch (error) {
      toast.error('Failed to submit KYC');
    } finally {
      setUploading(false);
    }
  };

  if (kycStatus) {
    // Allow resubmission form for rejected or rekyc
    if (kycStatus.status === 'rekyc' || kycStatus.status === 'rejected') {
      return (
        <div className="max-w-4xl mx-auto space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">KYC Verification</h1>
            <p className="text-gray-600">Please resubmit your KYC documents</p>
          </motion.div>

          <div className={`p-4 rounded-xl border ${
            kycStatus.status === 'rekyc' ? 'bg-orange-50 border-orange-200' : 'bg-red-50 border-red-200'
          }`}>
            <p className="font-semibold text-gray-900 mb-1">
              {kycStatus.status === 'rekyc' ? '🔄 Re-KYC Required' : '❌ KYC Rejected'}
            </p>
            <p className="text-sm text-gray-700">
              <strong>Reason:</strong> {kycStatus.rekycReason || kycStatus.rejectionReason || 'Please resubmit your documents'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="stats-card">
              <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number</label>
                  {otpEnabled ? (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input 
                          type="tel" 
                          value={formData.contactNumber} 
                          onChange={(e) => {
                            setFormData({ ...formData, contactNumber: e.target.value });
                            setOtpSent(false);
                            setOtpVerified(false);
                            setOtp('');
                          }} 
                          className="input-field flex-1" 
                          placeholder="10-digit mobile number" 
                          pattern="[0-9]{10}" 
                          maxLength="10"
                          disabled={otpVerified}
                          required 
                        />
                        <button
                          type="button"
                          onClick={sendOTP}
                          disabled={sendingOtp || otpVerified || timer > 0}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed whitespace-nowrap text-sm font-medium"
                        >
                          {sendingOtp ? 'Sending...' : timer > 0 ? `${timer}s` : otpVerified ? '✓ Verified' : 'Send OTP'}
                        </button>
                      </div>
                      {otpSent && !otpVerified && (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            className="input-field flex-1"
                            placeholder="Enter 6-digit OTP"
                            maxLength="6"
                          />
                          <button
                            type="button"
                            onClick={verifyOTP}
                            disabled={verifyingOtp}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed whitespace-nowrap text-sm font-medium"
                          >
                            {verifyingOtp ? 'Verifying...' : 'Verify'}
                          </button>
                        </div>
                      )}
                      {otpVerified && (
                        <p className="text-sm text-green-600 font-medium">✓ Mobile number verified</p>
                      )}
                    </div>
                  ) : (
                    <input 
                      type="tel" 
                      value={formData.contactNumber} 
                      onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })} 
                      className="input-field" 
                      placeholder="10-digit mobile number" 
                      pattern="[0-9]{10}" 
                      maxLength="10"
                      required 
                    />
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">PAN Card Number</label>
                  <input type="text" value={formData.panNumber} onChange={(e) => setFormData({ ...formData, panNumber: e.target.value.toUpperCase() })} className="input-field" placeholder="ABCDE1234F" pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}" maxLength="10" required />
                </div>
              </div>
            </div>
            <div className="stats-card">
              <h3 className="text-lg font-semibold mb-4">Bank Account Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name</label>
                  <input type="text" value={formData.bankName} onChange={(e) => setFormData({ ...formData, bankName: e.target.value })} className="input-field" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Account Number</label>
                  <input type="text" value={formData.accountNumber} onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })} className="input-field" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">IFSC Code</label>
                  <input type="text" value={formData.ifscCode} onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value })} className="input-field" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cancel Cheque/Bank Statement</label>
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileChange(e, 'bankDocument')} className="input-field" />
                </div>
              </div>
            </div>
            <div className="stats-card">
              <h3 className="text-lg font-semibold mb-4">Identity Documents</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Aadhaar Front</label>
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileChange(e, 'aadhaarFront')} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Aadhaar Back</label>
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileChange(e, 'aadhaarBack')} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">PAN Card</label>
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileChange(e, 'panCard')} className="input-field" />
                </div>
              </div>
            </div>
            <button type="submit" className="btn-primary w-full" disabled={uploading}>
              {uploading ? 'Uploading...' : 'Resubmit KYC'}
            </button>
          </form>
        </div>
      );
    }

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">KYC Verification</h1>
          <p className="text-gray-600">Your KYC status</p>
        </motion.div>

        <div className={`stats-card ${
          kycStatus.status === 'approved' ? 'bg-green-50 border-green-200' :
          'bg-yellow-50 border-yellow-200'
        }`}>
          <div className="text-center py-8">
            <DocumentCheckIcon className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <h3 className="text-xl font-semibold mb-2 capitalize">{kycStatus.status}</h3>
            <p className="text-gray-600">
              {kycStatus.status === 'pending' && 'Your KYC is under review. We will notify you once reviewed.'}
              {kycStatus.status === 'approved' && 'Your KYC has been approved. All features are unlocked.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">KYC Verification</h1>
        <p className="text-gray-600">Complete your KYC to unlock all features</p>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="stats-card">
          <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number</label>
              {otpEnabled ? (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input 
                      type="tel" 
                      value={formData.contactNumber} 
                      onChange={(e) => {
                        setFormData({ ...formData, contactNumber: e.target.value });
                        setOtpSent(false);
                        setOtpVerified(false);
                        setOtp('');
                      }} 
                      className="input-field flex-1" 
                      placeholder="10-digit mobile number" 
                      pattern="[0-9]{10}" 
                      maxLength="10"
                      disabled={otpVerified}
                      required 
                    />
                    <button
                      type="button"
                      onClick={sendOTP}
                      disabled={sendingOtp || otpVerified || timer > 0}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed whitespace-nowrap text-sm font-medium"
                    >
                      {sendingOtp ? 'Sending...' : timer > 0 ? `${timer}s` : otpVerified ? '✓ Verified' : 'Send OTP'}
                    </button>
                  </div>
                  {otpSent && !otpVerified && (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="input-field flex-1"
                        placeholder="Enter 6-digit OTP"
                        maxLength="6"
                      />
                      <button
                        type="button"
                        onClick={verifyOTP}
                        disabled={verifyingOtp}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed whitespace-nowrap text-sm font-medium"
                      >
                        {verifyingOtp ? 'Verifying...' : 'Verify'}
                      </button>
                    </div>
                  )}
                  {otpVerified && (
                    <p className="text-sm text-green-600 font-medium">✓ Mobile number verified</p>
                  )}
                </div>
              ) : (
                <input 
                  type="tel" 
                  value={formData.contactNumber} 
                  onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })} 
                  className="input-field" 
                  placeholder="10-digit mobile number" 
                  pattern="[0-9]{10}" 
                  maxLength="10"
                  required 
                />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">PAN Card Number</label>
              <input
                type="text"
                value={formData.panNumber}
                onChange={(e) => setFormData({ ...formData, panNumber: e.target.value.toUpperCase() })}
                className="input-field"
                placeholder="ABCDE1234F"
                pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}"
                maxLength="10"
                required
              />
            </div>
          </div>
        </div>

        <div className="stats-card">
          <h3 className="text-lg font-semibold mb-4">Bank Account Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name</label>
              <input
                type="text"
                value={formData.bankName}
                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Account Number</label>
              <input
                type="text"
                value={formData.accountNumber}
                onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">IFSC Code</label>
              <input
                type="text"
                value={formData.ifscCode}
                onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cancel Cheque/Bank Statement</label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleFileChange(e, 'bankDocument')}
                className="input-field"
                required
              />
            </div>
          </div>
        </div>

        <div className="stats-card">
          <h3 className="text-lg font-semibold mb-4">Identity Documents</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Aadhaar Front</label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleFileChange(e, 'aadhaarFront')}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Aadhaar Back</label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleFileChange(e, 'aadhaarBack')}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">PAN Card</label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleFileChange(e, 'panCard')}
                className="input-field"
                required
              />
            </div>
          </div>
        </div>

        <div className="stats-card">
          <h3 className="text-lg font-semibold mb-4">Business Documents (Optional)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">GST Certificate</label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleFileChange(e, 'gstCertificate')}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">MSME/Udyam Certificate</label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleFileChange(e, 'msmeCertificate')}
                className="input-field"
              />
            </div>
          </div>
        </div>

        <div className="stats-card">
          <h3 className="text-lg font-semibold mb-4">Other Document</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Document Name/Remark</label>
              <input
                type="text"
                value={formData.otherDocumentRemark}
                onChange={(e) => setFormData({ ...formData, otherDocumentRemark: e.target.value })}
                placeholder="e.g., Business License, Registration Certificate"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Upload Document</label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleFileChange(e, 'otherDocument')}
                className="input-field"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="btn-primary w-full"
          disabled={uploading}
        >
          {uploading ? 'Uploading...' : 'Submit KYC'}
        </button>
      </form>
    </div>
  );
}
