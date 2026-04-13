'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  EyeIcon, ShieldCheckIcon, DocumentIcon, PhotoIcon,
  ArrowTopRightOnSquareIcon, XMarkIcon,
} from '@heroicons/react/24/outline';
import { PageHeader, StatusBadge, ActionBtn } from '@/components/ui/AdminComponents';

function DocViewer({ url, label, onClose }) {
  const isPDF = url?.toLowerCase().includes('.pdf') || url?.toLowerCase().includes('pdf');
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 bg-gray-900 border-b border-gray-700">
        <div className="flex items-center gap-2">
          {isPDF ? <DocumentIcon className="w-4 h-4 text-red-400" /> : <PhotoIcon className="w-4 h-4 text-blue-400" />}
          <span className="text-white text-sm font-semibold">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <a href={url} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-indigo-300 hover:text-indigo-200 bg-indigo-500/20 px-3 py-1.5 rounded-lg transition-colors">
            <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" /> Open in new tab
          </a>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition-colors">
            <XMarkIcon className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-auto flex items-center justify-center p-4 bg-gray-950">
        {isPDF ? (
          <iframe src={`${url}#toolbar=1`} className="w-full max-w-4xl h-full min-h-[70vh] rounded-xl border border-gray-700" title={label} />
        ) : (
          <img src={url} alt={label} className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl border border-gray-700"
            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
        )}
        <div className="hidden flex-col items-center justify-center text-gray-400 gap-3">
          <DocumentIcon className="w-16 h-16" />
          <p className="text-sm">Cannot preview this file</p>
          <a href={url} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 text-sm font-semibold underline">Open directly</a>
        </div>
      </div>
    </div>
  );
}

export default function AdminKYCPage() {
  const [kycs, setKycs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedKYC, setSelectedKYC] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rekycReason, setRekycReason] = useState('');
  const [viewingDoc, setViewingDoc] = useState(null);

  useEffect(() => { fetchKYCs(); }, []);

  const fetchKYCs = async () => {
    try {
      const res = await fetch('/api/admin/kyc');
      if (res.ok) setKycs((await res.json()).kycs || []);
    } catch { toast.error('Failed to fetch KYCs'); }
    finally { setLoading(false); }
  };

  const handleApprove = async (kycId) => {
    try {
      const res = await fetch('/api/admin/kyc/approve', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ kycId }) });
      if (res.ok) { toast.success('KYC approved ✓'); fetchKYCs(); setSelectedKYC(null); }
    } catch { toast.error('Failed to approve'); }
  };

  const handleReject = async (kycId) => {
    if (!rejectionReason) { toast.error('Please enter rejection reason'); return; }
    try {
      const res = await fetch('/api/admin/kyc/reject', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ kycId, reason: rejectionReason }) });
      if (res.ok) { toast.success('KYC rejected'); fetchKYCs(); setSelectedKYC(null); setRejectionReason(''); }
    } catch { toast.error('Failed to reject'); }
  };

  const handleReKYC = async (kycId) => {
    if (!rekycReason) { toast.error('Please enter Re-KYC reason'); return; }
    try {
      const res = await fetch('/api/admin/kyc/rekyc', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ kycId, reason: rekycReason }) });
      if (res.ok) { toast.success('Re-KYC requested'); fetchKYCs(); setSelectedKYC(null); setRekycReason(''); }
    } catch { toast.error('Failed to request Re-KYC'); }
  };

  const getDocs = (kyc) => [
    { label: 'Aadhaar Front',    url: kyc.aadhaarFront },
    { label: 'Aadhaar Back',     url: kyc.aadhaarBack },
    { label: 'PAN Card',         url: kyc.panCard },
    { label: 'Bank Document',    url: kyc.bankDocument },
    { label: 'GST Certificate',  url: kyc.gstCertificate },
    { label: 'MSME Certificate', url: kyc.msmeCertificate },
    kyc.otherDocument ? { label: `Other — ${kyc.otherDocumentRemark || 'Document'}`, url: kyc.otherDocument } : null,
  ].filter(d => d?.url);

  if (loading) return (
    <div className="space-y-3 animate-pulse">
      {[...Array(5)].map((_, i) => <div key={i} className="h-14 bg-gray-100 rounded-xl" />)}
    </div>
  );

  return (
    <div className="space-y-5">
      <PageHeader icon={ShieldCheckIcon} title="KYC Management" subtitle="Review and approve user KYC submissions" color="from-emerald-500 to-green-600"
        action={
          <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-3 py-1.5 rounded-xl">
            <span className="font-semibold text-gray-900">{kycs.filter(k => k.status === 'pending').length}</span> pending
          </div>
        }
      />

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                {['User', 'Bank Details', 'PAN', 'Status', 'Submitted', 'Actions'].map((h, i) => (
                  <th key={h} className={`py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide ${i === 5 ? 'text-right' : 'text-left'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {kycs.map((kyc) => (
                <tr key={kyc._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 px-4">
                    <p className="text-sm font-semibold text-gray-900">{kyc.userId?.name}</p>
                    <p className="text-xs text-gray-400">{kyc.userId?.email}</p>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-sm text-gray-700 font-medium">{kyc.bankName || '—'}</p>
                    <p className="text-xs text-gray-400 font-mono">{kyc.accountNumber ? `••••${kyc.accountNumber.slice(-4)}` : '—'}</p>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-xs font-mono text-gray-600">{kyc.panNumber || '—'}</p>
                  </td>
                  <td className="py-3 px-4"><StatusBadge status={kyc.status} /></td>
                  <td className="py-3 px-4 text-xs text-gray-400">{new Date(kyc.submittedAt).toLocaleDateString('en-IN')}</td>
                  <td className="py-3 px-4 text-right">
                    <ActionBtn icon={EyeIcon} onClick={() => { setSelectedKYC(kyc); setRejectionReason(''); setRekycReason(''); }} color="text-blue-600 hover:bg-blue-50" title="Review KYC" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {kycs.length === 0 && <div className="text-center py-12 text-sm text-gray-400">No KYC submissions</div>}
      </div>

      {/* Review Modal */}
      {selectedKYC && (() => {
        const docs = getDocs(selectedKYC);
        return (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-8">
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">KYC Review — {selectedKYC.userId?.name}</h2>
                  <p className="text-xs text-gray-400 mt-0.5">{selectedKYC.userId?.email} · Submitted {new Date(selectedKYC.submittedAt).toLocaleDateString('en-IN')}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={selectedKYC.status} />
                  <button onClick={() => setSelectedKYC(null)} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                    <XMarkIcon className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>

              <div className="p-5 space-y-5">
                {/* Details */}
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Personal & Bank Details</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                      ['Contact', selectedKYC.contactNumber],
                      ['PAN Number', selectedKYC.panNumber],
                      ['Bank Name', selectedKYC.bankName],
                      ['Account Number', selectedKYC.accountNumber],
                      ['IFSC Code', selectedKYC.ifscCode],
                    ].map(([k, v]) => (
                      <div key={k} className="bg-gray-50 rounded-xl p-3">
                        <p className="text-xs text-gray-400 mb-0.5">{k}</p>
                        <p className="text-sm font-semibold text-gray-900 break-all">{v || 'N/A'}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Documents */}
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                    Documents ({docs.length} uploaded)
                  </p>
                  {docs.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {docs.map((doc, idx) => {
                        const isPDF = doc.url?.toLowerCase().includes('.pdf') || doc.url?.toLowerCase().includes('pdf');
                        return (
                          <div key={doc.label}
                            className="group relative rounded-xl border border-gray-200 overflow-hidden bg-gray-50 hover:border-indigo-300 transition-all cursor-pointer"
                            onClick={() => setViewingDoc(doc)}>
                            <div className="h-28 flex items-center justify-center bg-gray-100 overflow-hidden">
                              {isPDF ? (
                                <div className="flex flex-col items-center gap-1">
                                  <DocumentIcon className="w-10 h-10 text-red-400" />
                                  <span className="text-xs text-red-500 font-semibold">PDF</span>
                                </div>
                              ) : (
                                <>
                                  <img src={doc.url} alt={doc.label} className="w-full h-full object-cover"
                                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                                  <div className="hidden w-full h-full items-center justify-center">
                                    <PhotoIcon className="w-10 h-10 text-gray-300" />
                                  </div>
                                </>
                              )}
                            </div>
                            <div className="p-2 flex items-center justify-between">
                              <p className="text-xs font-semibold text-gray-700 truncate">{doc.label}</p>
                              <EyeIcon className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                            </div>
                            <div className="absolute inset-0 bg-indigo-600/0 group-hover:bg-indigo-600/10 transition-all flex items-center justify-center">
                              <span className="opacity-0 group-hover:opacity-100 bg-indigo-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all shadow-lg">
                                View Document
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-center">
                      <p className="text-sm text-amber-700">No documents uploaded yet</p>
                    </div>
                  )}
                </div>

                {/* Status remarks */}
                {selectedKYC.status === 'rekyc' && (
                  <div className="p-3 bg-orange-50 border border-orange-100 rounded-xl text-sm text-orange-800">
                    <strong>Re-KYC Remark:</strong> {selectedKYC.rekycReason}
                  </div>
                )}
                {selectedKYC.status === 'rejected' && (
                  <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-800">
                    <strong>Rejection Reason:</strong> {selectedKYC.rejectionReason}
                  </div>
                )}

                {/* Actions */}
                {(selectedKYC.status === 'pending' || selectedKYC.status === 'rejected' || selectedKYC.status === 'rekyc') && (
                  <div className="space-y-3 pt-2 border-t border-gray-100">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Rejection Reason</label>
                      <textarea value={rejectionReason} onChange={e => setRejectionReason(e.target.value)}
                        className="input-field text-sm resize-none" rows="2" placeholder="Enter reason if rejecting..." />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Re-KYC Reason</label>
                      <textarea value={rekycReason} onChange={e => setRekycReason(e.target.value)}
                        className="input-field text-sm resize-none" rows="2" placeholder="e.g. Document unclear, please reupload Aadhaar" />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setSelectedKYC(null)} className="flex-1 btn-secondary text-sm">Close</button>
                      <button onClick={() => handleReject(selectedKYC._id)} className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700">Reject</button>
                      <button onClick={() => handleReKYC(selectedKYC._id)} className="flex-1 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600">Re-KYC</button>
                      <button onClick={() => handleApprove(selectedKYC._id)} className="flex-1 py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700">✓ Approve</button>
                    </div>
                  </div>
                )}

                {selectedKYC.status === 'approved' && (
                  <div className="space-y-3 pt-2 border-t border-gray-100">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Re-KYC Reason</label>
                      <textarea value={rekycReason} onChange={e => setRekycReason(e.target.value)}
                        className="input-field text-sm resize-none" rows="2" placeholder="e.g. Annual re-verification required" />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setSelectedKYC(null)} className="flex-1 btn-secondary text-sm">Close</button>
                      <button onClick={() => handleReKYC(selectedKYC._id)} className="flex-1 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600">Request Re-KYC</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Full-screen Document Viewer */}
      {viewingDoc && (
        <DocViewer url={viewingDoc.url} label={viewingDoc.label} onClose={() => setViewingDoc(null)} />
      )}
    </div>
  );
}
