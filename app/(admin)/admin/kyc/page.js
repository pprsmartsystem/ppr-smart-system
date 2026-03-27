'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { CheckCircleIcon, XCircleIcon, EyeIcon } from '@heroicons/react/24/outline';

export default function AdminKYCPage() {
  const [kycs, setKycs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedKYC, setSelectedKYC] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rekycReason, setRekycReason] = useState('');

  useEffect(() => {
    fetchKYCs();
  }, []);

  const fetchKYCs = async () => {
    try {
      const res = await fetch('/api/admin/kyc');
      if (res.ok) {
        const data = await res.json();
        setKycs(data.kycs || []);
      }
    } catch (error) {
      toast.error('Failed to fetch KYCs');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (kycId) => {
    try {
      const res = await fetch('/api/admin/kyc/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kycId }),
      });
      if (res.ok) {
        toast.success('KYC approved');
        fetchKYCs();
        setSelectedKYC(null);
      }
    } catch (error) {
      toast.error('Failed to approve');
    }
  };

  const handleReject = async (kycId) => {
    if (!rejectionReason) {
      toast.error('Please enter rejection reason');
      return;
    }
    try {
      const res = await fetch('/api/admin/kyc/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kycId, reason: rejectionReason }),
      });
      if (res.ok) {
        toast.success('KYC rejected');
        fetchKYCs();
        setSelectedKYC(null);
        setRejectionReason('');
      }
    } catch (error) {
      toast.error('Failed to reject');
    }
  };

  const handleReKYC = async (kycId) => {
    if (!rekycReason) { toast.error('Please enter Re-KYC reason'); return; }
    try {
      const res = await fetch('/api/admin/kyc/rekyc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kycId, reason: rekycReason }),
      });
      if (res.ok) {
        toast.success('Re-KYC requested');
        fetchKYCs();
        setSelectedKYC(null);
        setRekycReason('');
      }
    } catch { toast.error('Failed to request Re-KYC'); }
  };

  if (loading) {
    return <div className="animate-pulse space-y-4">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-gray-900">KYC Management</h1>
        <p className="text-gray-600 mt-2">Review and approve user KYC submissions</p>
      </motion.div>

      <div className="stats-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-4 px-4 font-semibold text-gray-900">User</th>
              <th className="text-left py-4 px-4 font-semibold text-gray-900">Bank</th>
              <th className="text-left py-4 px-4 font-semibold text-gray-900">Status</th>
              <th className="text-left py-4 px-4 font-semibold text-gray-900">Submitted</th>
              <th className="text-right py-4 px-4 font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody>
            {kycs.map((kyc) => (
              <tr key={kyc._id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-4 px-4">
                  <p className="font-medium">{kyc.userId?.name}</p>
                  <p className="text-sm text-gray-500">{kyc.userId?.email}</p>
                </td>
                <td className="py-4 px-4">
                  <p className="text-sm">{kyc.bankName}</p>
                  <p className="text-xs text-gray-500">{kyc.accountNumber}</p>
                </td>
                <td className="py-4 px-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    kyc.status === 'approved' ? 'bg-green-100 text-green-800' :
                    kyc.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    kyc.status === 'rekyc' ? 'bg-orange-100 text-orange-800' :
                    'bg-yellow-100 text-yellow-800'
                  } capitalize`}>
                    {kyc.status}
                  </span>
                </td>
                <td className="py-4 px-4 text-sm text-gray-600">
                  {new Date(kyc.submittedAt).toLocaleDateString()}
                </td>
                <td className="py-4 px-4 text-right">
                  <button
                    onClick={() => setSelectedKYC(kyc)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <EyeIcon className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedKYC && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-2xl p-8 max-w-4xl w-full my-8">
            <h2 className="text-2xl font-bold mb-6">KYC Details - {selectedKYC.userId?.name}</h2>
            
            <div className="space-y-6 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Contact Number</p>
                  <p className="font-medium">{selectedKYC.contactNumber || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">PAN Card Number</p>
                  <p className="font-medium">{selectedKYC.panNumber || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Bank Name</p>
                  <p className="font-medium">{selectedKYC.bankName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Account Number</p>
                  <p className="font-medium">{selectedKYC.accountNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">IFSC Code</p>
                  <p className="font-medium">{selectedKYC.ifscCode}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {selectedKYC.bankDocument && (
                  <a href={selectedKYC.bankDocument} target="_blank" className="text-blue-600 hover:underline text-sm">View Bank Document</a>
                )}
                {selectedKYC.aadhaarFront && (
                  <a href={selectedKYC.aadhaarFront} target="_blank" className="text-blue-600 hover:underline text-sm">View Aadhaar Front</a>
                )}
                {selectedKYC.aadhaarBack && (
                  <a href={selectedKYC.aadhaarBack} target="_blank" className="text-blue-600 hover:underline text-sm">View Aadhaar Back</a>
                )}
                {selectedKYC.panCard && (
                  <a href={selectedKYC.panCard} target="_blank" className="text-blue-600 hover:underline text-sm">View PAN Card</a>
                )}
                {selectedKYC.gstCertificate && (
                  <a href={selectedKYC.gstCertificate} target="_blank" className="text-blue-600 hover:underline text-sm">View GST Certificate</a>
                )}
                {selectedKYC.msmeCertificate && (
                  <a href={selectedKYC.msmeCertificate} target="_blank" className="text-blue-600 hover:underline text-sm">View MSME Certificate</a>
                )}
                {selectedKYC.otherDocument && (
                  <a href={selectedKYC.otherDocument} target="_blank" className="text-blue-600 hover:underline text-sm">View Other Document ({selectedKYC.otherDocumentRemark})</a>
                )}
              </div>
            </div>

            {selectedKYC.status === 'pending' && (
              <div className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rejection Reason (if rejecting)</label>
                  <textarea value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} className="input-field" rows="2" placeholder="Enter reason for rejection" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Re-KYC Reason (if requesting resubmission)</label>
                  <textarea value={rekycReason} onChange={(e) => setRekycReason(e.target.value)} className="input-field" rows="2" placeholder="e.g. Document unclear, please reupload Aadhaar" />
                </div>
                <div className="flex space-x-3">
                  <button onClick={() => setSelectedKYC(null)} className="flex-1 btn-secondary">Close</button>
                  <button onClick={() => handleReject(selectedKYC._id)} className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">Reject</button>
                  <button onClick={() => handleReKYC(selectedKYC._id)} className="flex-1 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600">Re-KYC</button>
                  <button onClick={() => handleApprove(selectedKYC._id)} className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">Approve</button>
                </div>
              </div>
            )}

            {selectedKYC.status === 'approved' && (
              <div className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Re-KYC Reason</label>
                  <textarea value={rekycReason} onChange={(e) => setRekycReason(e.target.value)} className="input-field" rows="2" placeholder="e.g. Annual re-verification required" />
                </div>
                <div className="flex space-x-3">
                  <button onClick={() => setSelectedKYC(null)} className="flex-1 btn-secondary">Close</button>
                  <button onClick={() => handleReKYC(selectedKYC._id)} className="flex-1 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600">Request Re-KYC</button>
                </div>
              </div>
            )}

            {(selectedKYC.status === 'rejected' || selectedKYC.status === 'rekyc') && (
              <div className="mt-6 space-y-4">
                {selectedKYC.status === 'rekyc' && (
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-sm text-orange-800"><strong>Re-KYC Remark:</strong> {selectedKYC.rekycReason}</p>
                  </div>
                )}
                {selectedKYC.status === 'rejected' && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800"><strong>Rejection Reason:</strong> {selectedKYC.rejectionReason}</p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Re-KYC Remark (to request resubmission again)</label>
                  <textarea value={rekycReason} onChange={(e) => setRekycReason(e.target.value)} className="input-field" rows="2" placeholder="e.g. Document still unclear, please reupload" />
                </div>
                <div className="flex space-x-3">
                  <button onClick={() => setSelectedKYC(null)} className="flex-1 btn-secondary">Close</button>
                  <button onClick={() => handleReKYC(selectedKYC._id)} className="flex-1 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600">Re-KYC Again</button>
                  <button onClick={() => handleApprove(selectedKYC._id)} className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">Approve</button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
