'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { CheckCircleIcon, XCircleIcon, EyeIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { PageHeader, StatusBadge, ActionBtn } from '@/components/ui/AdminComponents';

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
    <div className="space-y-5">
      <PageHeader icon={ShieldCheckIcon} title="KYC Management" subtitle="Review and approve user KYC submissions" color="from-emerald-500 to-green-600" />

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b border-gray-100 bg-gray-50/50">{['User','Bank','Status','Submitted','Actions'].map((h,i) => <th key={h} className={`py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide ${i===4?'text-right':'text-left'}`}>{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-gray-50">
            {kycs.map((kyc) => (
              <tr key={kyc._id} className="hover:bg-gray-50/50 transition-colors">
                <td className="py-3 px-4"><p className="text-sm font-semibold text-gray-900">{kyc.userId?.name}</p><p className="text-xs text-gray-400">{kyc.userId?.email}</p></td>
                <td className="py-3 px-4"><p className="text-sm text-gray-700">{kyc.bankName}</p><p className="text-xs text-gray-400">{kyc.accountNumber}</p></td>
                <td className="py-3 px-4"><StatusBadge status={kyc.status} /></td>
                <td className="py-3 px-4 text-xs text-gray-400">{new Date(kyc.submittedAt).toLocaleDateString('en-IN')}</td>
                <td className="py-3 px-4 text-right"><ActionBtn icon={EyeIcon} onClick={() => setSelectedKYC(kyc)} color="text-blue-600 hover:bg-blue-50" title="Review" /></td>
              </tr>
            ))}
          </tbody>
        </table>
        {kycs.length === 0 && <div className="text-center py-12 text-sm text-gray-400">No KYC submissions</div>}
      </div>

      {selectedKYC && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-3xl w-full my-8">
            <div className="flex items-center justify-between mb-5">
              <div><h2 className="text-lg font-bold text-gray-900">KYC Review — {selectedKYC.userId?.name}</h2><p className="text-xs text-gray-400">{selectedKYC.userId?.email}</p></div>
              <button onClick={() => setSelectedKYC(null)} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"><svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-5">
              {[['Contact', selectedKYC.contactNumber],['PAN', selectedKYC.panNumber],['Bank', selectedKYC.bankName],['Account', selectedKYC.accountNumber],['IFSC', selectedKYC.ifscCode]].map(([k,v]) => (
                <div key={k} className="bg-gray-50 rounded-xl p-3"><p className="text-xs text-gray-400">{k}</p><p className="text-sm font-semibold text-gray-900">{v || 'N/A'}</p></div>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 mb-5">
              {[['Bank Document', selectedKYC.bankDocument],['Aadhaar Front', selectedKYC.aadhaarFront],['Aadhaar Back', selectedKYC.aadhaarBack],['PAN Card', selectedKYC.panCard],['GST Certificate', selectedKYC.gstCertificate],['MSME Certificate', selectedKYC.msmeCertificate],selectedKYC.otherDocument && [`Other (${selectedKYC.otherDocumentRemark})`, selectedKYC.otherDocument]].filter(Boolean).map(([label, url]) => url && (
                <a key={label} href={url} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors">{label} ↗</a>
              ))}
            </div>
            {(selectedKYC.status === 'pending') && (
              <div className="space-y-3">
                <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Rejection Reason</label><textarea value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} className="input-field" rows="2" placeholder="Enter reason for rejection" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Re-KYC Reason</label><textarea value={rekycReason} onChange={(e) => setRekycReason(e.target.value)} className="input-field" rows="2" placeholder="e.g. Document unclear" /></div>
                <div className="flex gap-2">
                  <button onClick={() => setSelectedKYC(null)} className="flex-1 btn-secondary">Close</button>
                  <button onClick={() => handleReject(selectedKYC._id)} className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700">Reject</button>
                  <button onClick={() => handleReKYC(selectedKYC._id)} className="flex-1 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600">Re-KYC</button>
                  <button onClick={() => handleApprove(selectedKYC._id)} className="flex-1 py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700">Approve</button>
                </div>
              </div>
            )}
            {selectedKYC.status === 'approved' && (
              <div className="space-y-3">
                <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Re-KYC Reason</label><textarea value={rekycReason} onChange={(e) => setRekycReason(e.target.value)} className="input-field" rows="2" placeholder="e.g. Annual re-verification" /></div>
                <div className="flex gap-2"><button onClick={() => setSelectedKYC(null)} className="flex-1 btn-secondary">Close</button><button onClick={() => handleReKYC(selectedKYC._id)} className="flex-1 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600">Request Re-KYC</button></div>
              </div>
            )}
            {(selectedKYC.status === 'rejected' || selectedKYC.status === 'rekyc') && (
              <div className="space-y-3">
                {selectedKYC.status === 'rekyc' && <div className="p-3 bg-orange-50 border border-orange-100 rounded-xl text-sm text-orange-800"><strong>Re-KYC Remark:</strong> {selectedKYC.rekycReason}</div>}
                {selectedKYC.status === 'rejected' && <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-800"><strong>Rejection Reason:</strong> {selectedKYC.rejectionReason}</div>}
                <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Re-KYC Remark</label><textarea value={rekycReason} onChange={(e) => setRekycReason(e.target.value)} className="input-field" rows="2" placeholder="e.g. Document still unclear" /></div>
                <div className="flex gap-2"><button onClick={() => setSelectedKYC(null)} className="flex-1 btn-secondary">Close</button><button onClick={() => handleReKYC(selectedKYC._id)} className="flex-1 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600">Re-KYC Again</button><button onClick={() => handleApprove(selectedKYC._id)} className="flex-1 py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700">Approve</button></div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
