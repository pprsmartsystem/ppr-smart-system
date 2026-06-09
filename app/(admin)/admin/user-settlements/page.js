'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckIcon, XMarkIcon, NoSymbolIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function UserSettlementsPage() {
  const [settlements, setSettlements] = useState([]);
  const [heldUsers, setHeldUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [showHoldModal, setShowHoldModal] = useState(false);
  const [holdForm, setHoldForm] = useState({ userId: '', reason: 'Due to bank internal server issues' });
  const [rejectModal, setRejectModal] = useState(null);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSettlements();
    fetch('/api/admin/users').then(r => r.json()).then(d => setAllUsers(d.users || []));
  }, []);

  const fetchSettlements = async () => {
    const res = await fetch('/api/admin/user-settlements');
    if (res.ok) {
      const data = await res.json();
      setSettlements(data.settlements || []);
      setHeldUsers(data.heldUsers || []);
    }
  };

  const handleAction = async (action, settlementId, rejectionReason) => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/user-settlements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, settlementId, reason: rejectionReason }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        setRejectModal(null);
        setReason('');
        fetchSettlements();
      } else {
        toast.error(data.error || 'Action failed');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleHold = async (e) => {
    e.preventDefault();
    if (!holdForm.userId) { toast.error('Please select a user'); return; }
    try {
      const res = await fetch('/api/admin/user-settlements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'hold_settlement', userId: holdForm.userId, reason: holdForm.reason }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        setShowHoldModal(false);
        setHoldForm({ userId: '', reason: 'Due to bank internal server issues' });
        fetchSettlements();
      } else toast.error(data.error || 'Failed');
    } catch { toast.error('Something went wrong'); }
  };

  const handleUnhold = async (userId) => {
    try {
      const res = await fetch('/api/admin/user-settlements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'unhold_settlement', userId }),
      });
      const data = await res.json();
      if (res.ok) { toast.success(data.message); fetchSettlements(); }
      else toast.error(data.error || 'Failed');
    } catch { toast.error('Something went wrong'); }
  };

  const pending = settlements.filter(s => s.status === 'pending');
  const history = settlements.filter(s => s.status !== 'pending');

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Initiate / T+1 Settlement</h1>
            <p className="text-gray-500 mt-1">Settlement requests initiated by users. Approve to credit bank, reject to refund wallet.</p>
          </div>
          <button onClick={() => setShowHoldModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white text-sm font-semibold rounded-xl hover:bg-orange-700 transition-colors">
            <NoSymbolIcon className="w-4 h-4" /> Hold Settlement
          </button>
        </div>
      </motion.div>

      {/* Held Users */}
      {heldUsers.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5">
          <h2 className="text-base font-bold text-orange-800 mb-3">Settlement On Hold ({heldUsers.length})</h2>
          <div className="space-y-2">
            {heldUsers.map(u => (
              <div key={u._id} className="flex items-center gap-3 p-3 bg-white border border-orange-100 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                  <NoSymbolIcon className="w-4 h-4 text-orange-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{u.name}</p>
                  <p className="text-xs text-gray-500">{u.email}</p>
                  <p className="text-xs text-orange-700 mt-0.5">Reason: {u.settlementBlockReason}</p>
                </div>
                <button onClick={() => handleUnhold(u._id)}
                  className="px-3 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 flex-shrink-0">
                  Resume
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending */}
      <div className="stats-card">
        <h2 className="text-xl font-semibold mb-4">Pending Requests ({pending.length})</h2>
        {pending.length === 0 ? (
          <p className="text-center text-gray-400 py-8">No pending settlement requests</p>
        ) : (
          <div className="space-y-3">
            {pending.map((s) => (
              <div key={s._id} className="flex items-center gap-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900">
                    {s.userId?.name}
                    {s.userId?.role === 'masterdistributor' && <span className="ml-1 text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full">Master Distributor</span>}
                  </p>
                  <p className="text-sm text-gray-500">{s.userId?.email}</p>
                  <p className="text-sm text-gray-700 mt-1">
                    Spend: <span className="font-bold text-gray-900">₹{s.spendAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    {s.userId?.role === 'masterdistributor' ? (
                      <> · Fee (₹300/₹1L): <span className="text-red-600 font-semibold">₹{(s.spendAmount - s.settlementAmount)?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></>
                    ) : s.settlementRate > 0 ? (
                      <> · Deduction ({s.settlementRate}%): <span className="text-red-600 font-semibold">₹{(s.spendAmount - s.settlementAmount)?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></>
                    ) : null}
                    {' '}· To Credit: <span className="font-bold text-green-700">₹{s.settlementAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </p>
                  {s.scheduledFor && (
                    <p className="text-xs text-blue-600 mt-0.5">
                      Settlement Date: {new Date(s.scheduledFor).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-0.5">Requested: {new Date(s.createdAt).toLocaleString('en-IN')}</p>
                  {s.bankDetails?.bankName && (
                    <p className="text-xs text-blue-600 mt-0.5">Bank: {s.bankDetails.bankName} · A/C ••••{s.bankDetails.accountNumber?.slice(-4)} · IFSC: {s.bankDetails.ifscCode}</p>
                  )}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => handleAction('approve', s._id)} disabled={loading}
                    className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50">
                    <CheckIcon className="w-4 h-4" /> Approve
                  </button>
                  <button onClick={() => { setRejectModal({ id: s._id, name: s.userId?.name }); setReason(''); }} disabled={loading}
                    className="flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50">
                    <XMarkIcon className="w-4 h-4" /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="stats-card">
          <h2 className="text-xl font-semibold mb-4">History ({history.length})</h2>
          <div className="space-y-3">
            {history.map((s) => (
              <div key={s._id} className={`p-4 rounded-xl border ${s.status === 'processed' ? 'bg-green-50 border-green-200' : s.status === 'paused' ? 'bg-orange-50 border-orange-200' : 'bg-red-50 border-red-200'}`}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-gray-900">{s.userId?.name}</p>
                    <p className="text-sm text-gray-500">{s.userId?.email}</p>
                    <p className="text-sm text-gray-700 mt-1">Amount: <span className="font-bold">₹{s.settlementAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></p>
                    {s.status === 'rejected' && s.rejectionReason && (
                      <p className="text-sm text-red-600 mt-1">Reason: {s.rejectionReason}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-0.5">
                      {s.status === 'processed' ? 'Approved' : s.status === 'paused' ? 'On Hold' : 'Rejected'}: {s.processedAt ? new Date(s.processedAt).toLocaleString('en-IN') : new Date(s.createdAt).toLocaleString('en-IN')}
                    </p>
                  </div>
                  {s.status === 'processed'
                    ? <span className="px-2.5 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full whitespace-nowrap">Approved</span>
                    : s.status === 'paused'
                    ? <span className="px-2.5 py-1 text-xs font-medium bg-orange-100 text-orange-700 rounded-full whitespace-nowrap">On Hold</span>
                    : <span className="px-2.5 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full whitespace-nowrap">Rejected</span>
                  }
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hold Modal */}
      {showHoldModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Hold T+1 Settlement</h2>
            <p className="text-sm text-gray-400 mb-5">User's pending T+1 settlements will be paused.</p>
            <form onSubmit={handleHold} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Select User <span className="text-red-500">*</span></label>
                <select value={holdForm.userId} onChange={e => setHoldForm(f => ({ ...f, userId: e.target.value }))}
                  className="input-field" required>
                  <option value="">-- Select a user --</option>
                  {allUsers.filter(u => !u.settlementBlocked).map(u => (
                    <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Reason <span className="text-red-500">*</span></label>
                <textarea value={holdForm.reason} onChange={e => setHoldForm(f => ({ ...f, reason: e.target.value }))}
                  className="input-field resize-none" rows={3} required />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => { setShowHoldModal(false); setHoldForm({ userId: '', reason: 'Due to bank internal server issues' }); }}
                  className="flex-1 btn-secondary">Cancel</button>
                <button type="submit"
                  className="flex-1 py-3 rounded-xl bg-orange-600 text-white font-semibold hover:bg-orange-700">Hold Settlement</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Reject Settlement</h2>
            <p className="text-sm text-gray-500 mb-4">
              Rejecting <span className="font-medium text-gray-700">{rejectModal.name}</span>'s request. Amount will be refunded to their wallet.
            </p>
            <label className="block text-sm font-medium text-gray-700 mb-2">Reason <span className="text-red-500">*</span></label>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} placeholder="Enter reason for rejection..." className="input-field resize-none" />
            <div className="flex gap-3 mt-4">
              <button onClick={() => { setRejectModal(null); setReason(''); }} className="flex-1 btn-secondary">Cancel</button>
              <button onClick={() => handleAction('reject', rejectModal.id, reason)} disabled={loading || !reason.trim()}
                className="flex-1 py-2 px-4 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 disabled:opacity-50">
                {loading ? 'Rejecting...' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
