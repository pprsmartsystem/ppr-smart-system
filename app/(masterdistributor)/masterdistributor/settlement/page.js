'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { BanknotesIcon, ClockIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { PageHeader } from '@/components/ui/AdminComponents';

const STATUS_STYLES = {
  pending:   'bg-yellow-100 text-yellow-700',
  processed: 'bg-green-100 text-green-700',
  rejected:  'bg-red-100 text-red-700',
  paused:    'bg-gray-100 text-gray-600',
};

export default function MasterDistributorSettlementPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [amount, setAmount] = useState('');
  const [bank, setBank] = useState({ accountHolder: '', accountNumber: '', ifscCode: '', bankName: '' });

  const fetchData = async () => {
    try {
      const res = await fetch('/api/masterdistributor/settlement');
      if (res.ok) setData(await res.json());
    } catch { toast.error('Failed to load settlements'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const hasPending = data?.settlements?.some(s => s.status === 'pending');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/masterdistributor/settlement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: parseFloat(amount), bankDetails: bank }),
      });
      const result = await res.json();
      if (res.ok) {
        toast.success(result.message);
        setShowForm(false);
        setAmount('');
        setBank({ accountHolder: '', accountNumber: '', ifscCode: '', bankName: '' });
        fetchData();
      } else {
        toast.error(result.error || 'Failed to submit');
      }
    } catch { toast.error('Something went wrong'); }
    finally { setSubmitting(false); }
  };

  const rate = (data?.settlementRate !== null && data?.settlementRate !== undefined) ? data.settlementRate : 1.77;
  const parsedAmount = parseFloat(amount) || 0;
  // Flat deduction: ₹300 per ₹100,000
  const deduction = parseFloat(((parsedAmount / 100000) * 300).toFixed(2));
  const willReceive = parseFloat((parsedAmount - deduction).toFixed(2));

  if (loading) return (
    <div className="space-y-4 animate-pulse max-w-3xl mx-auto">
      <div className="h-32 bg-gray-200 rounded-2xl" />
      <div className="h-64 bg-gray-200 rounded-2xl" />
    </div>
  );

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      <PageHeader icon={BanknotesIcon} title="On Demand Settlement" subtitle="Request bank settlement — admin will approve" color="from-emerald-500 to-green-600" />

      {/* Balance + Initiate */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="relative overflow-hidden rounded-3xl p-6 text-white"
          style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 45%, #4c1d95 100%)' }}>
          <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #a78bfa, transparent)' }} />
          <div className="relative z-10">
            <p className="text-purple-200 text-xs uppercase tracking-widest mb-1">Available Wallet Balance</p>
            <p className="text-4xl font-bold mb-1">₹{(data?.walletBalance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
            <p className="text-purple-300 text-xs mb-4">Settlement Fee: ₹300 per ₹1,00,000 · Min. ₹10,000 · 1 request/day</p>
            {hasPending ? (
              <div className="flex items-center gap-2 bg-yellow-500/20 border border-yellow-400/30 rounded-xl px-4 py-2.5 text-yellow-200 text-sm font-medium">
                <ClockIcon className="w-4 h-4 flex-shrink-0" />
                You have a pending settlement awaiting admin approval
              </div>
            ) : (
              <button onClick={() => setShowForm(s => !s)}
                className="px-6 py-2.5 bg-white text-purple-700 font-semibold rounded-xl hover:bg-purple-50 transition-colors text-sm">
                {showForm ? 'Cancel' : '+ Request Settlement'}
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Settlement Form */}
      {showForm && !hasPending && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="font-bold text-gray-900 mb-4">New Settlement Request</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Amount (₹)</label>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
                placeholder="Enter amount (min ₹10,000)" min="10000" step="0.01" required className="input-field" />
              {parsedAmount >= 10000 && (
                <div className="mt-2 p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-xs space-y-1">
                  <div className="flex justify-between"><span className="text-gray-500">Requested</span><span className="font-semibold">₹{parsedAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Settlement Fee (₹300/₹1L)</span><span className="text-red-600 font-semibold">- ₹{deduction.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>
                  <div className="flex justify-between border-t border-emerald-200 pt-1 mt-1"><span className="font-bold text-gray-700">You will receive</span><span className="font-bold text-emerald-700 text-sm">₹{willReceive.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>
                </div>
              )}
            </div>

            {/* Bank Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Account Holder Name</label>
                <input type="text" value={bank.accountHolder} onChange={e => setBank(b => ({ ...b, accountHolder: e.target.value }))}
                  placeholder="Full name" className="input-field" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Bank Name</label>
                <input type="text" value={bank.bankName} onChange={e => setBank(b => ({ ...b, bankName: e.target.value }))}
                  placeholder="e.g. HDFC Bank" className="input-field" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Account Number</label>
                <input type="text" value={bank.accountNumber} onChange={e => setBank(b => ({ ...b, accountNumber: e.target.value }))}
                  placeholder="Account number" className="input-field" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">IFSC Code</label>
                <input type="text" value={bank.ifscCode} onChange={e => setBank(b => ({ ...b, ifscCode: e.target.value.toUpperCase() }))}
                  placeholder="e.g. HDFC0001234" className="input-field" required />
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 text-xs text-amber-800">
              ₹{parsedAmount > 0 ? parsedAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'} will be deducted from your wallet immediately. Admin will process the bank transfer after approval.
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 btn-secondary">Cancel</button>
              <button type="submit" disabled={submitting}
                className="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-colors">
                {submitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Settlement History */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-gray-900">Settlement History</h3>
            <p className="text-xs text-gray-400 mt-0.5">{data?.settlements?.length || 0} total requests</p>
          </div>
          {(data?.settlements || []).length > 0 && (
            <button
              onClick={() => {
                const csv = [
                  ['Date', 'Amount Requested', 'Fee', 'Net Amount', 'Status', 'Bank', 'Account Number'].join(','),
                  ...(data.settlements || []).map(s => [
                    new Date(s.createdAt).toLocaleDateString('en-IN'),
                    s.spendAmount?.toFixed(2) || '0',
                    (s.spendAmount - s.settlementAmount)?.toFixed(2) || '0',
                    s.settlementAmount?.toFixed(2) || '0',
                    s.status,
                    s.bankDetails?.bankName || '',
                    s.bankDetails?.accountNumber || ''
                  ].join(','))
                ].join('\n');
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `settlements-${Date.now()}.csv`;
                a.click();
              }}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 px-3 py-1.5 rounded-lg border border-emerald-200 hover:bg-emerald-50 transition-colors"
            >
              Export CSV
            </button>
          )}
        </div>
        <div className="divide-y divide-gray-50">
          {(data?.settlements || []).length === 0 ? (
            <div className="text-center py-12 text-sm text-gray-400">No settlement requests yet</div>
          ) : (
            (data?.settlements || []).map((s) => (
              <div key={s._id} className="p-4 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${s.status === 'processed' ? 'bg-green-50' : s.status === 'rejected' ? 'bg-red-50' : 'bg-yellow-50'}`}>
                      {s.status === 'processed'
                        ? <CheckCircleIcon className="w-5 h-5 text-green-600" />
                        : s.status === 'rejected'
                        ? <XCircleIcon className="w-5 h-5 text-red-600" />
                        : <ClockIcon className="w-5 h-5 text-yellow-600" />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-gray-900">₹{s.settlementAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                        <span className="text-xs text-gray-400">(₹300/₹1L fee)</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">Requested: ₹{s.spendAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                      {s.bankDetails?.bankName && (
                        <p className="text-xs text-gray-400 mt-0.5">{s.bankDetails.bankName} · ••••{s.bankDetails.accountNumber?.slice(-4)}</p>
                      )}
                      {s.status === 'rejected' && s.rejectionReason && (
                        <p className="text-xs text-red-600 mt-1">Reason: {s.rejectionReason}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">{new Date(s.createdAt).toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0 capitalize ${STATUS_STYLES[s.status] || 'bg-gray-100 text-gray-600'}`}>
                    {s.status === 'processed' ? 'Approved' : s.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
