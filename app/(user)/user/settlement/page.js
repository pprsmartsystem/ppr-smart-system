'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  BanknotesIcon,
  CalendarDaysIcon,
  BuildingLibraryIcon,
  CheckBadgeIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';

const MIN_SETTLEMENT = 10000;

export default function SettlementPage() {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [kyc, setKyc] = useState(null);
  const [pendingSettlement, setPendingSettlement] = useState(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/auth/me').then(r => r.ok ? r.json() : null),
      fetch('/api/user/kyc/status').then(r => r.ok ? r.json() : null),
      fetch('/api/user/settlement').then(r => r.ok ? r.json() : null),
    ]).then(([userData, kycData, settlementData]) => {
      if (userData) setUser(userData);
      if (kycData) setKyc(kycData.kyc);
      if (settlementData) setPendingSettlement(settlementData.settlements?.[0] || null);
    });
  }, []);

  const getNextWorkingDay = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    if (d.getDay() === 0) d.setDate(d.getDate() + 1);
    if (d.getDay() === 6) d.setDate(d.getDate() + 2);
    return d.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const parsedAmount = parseFloat(amount) || 0;
  const progress = Math.min((parsedAmount / MIN_SETTLEMENT) * 100, 100);
  const kycApproved = kyc?.status === 'approved';
  const canSettle = kycApproved && !pendingSettlement && parsedAmount >= MIN_SETTLEMENT && parsedAmount <= (user?.walletBalance || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!parsedAmount || parsedAmount <= 0) return toast.error('Enter a valid amount');
    if (parsedAmount < MIN_SETTLEMENT) return toast.error(`Minimum settlement amount is ₹${MIN_SETTLEMENT.toLocaleString('en-IN')}`);
    if (parsedAmount > (user?.walletBalance || 0)) return toast.error('Insufficient wallet balance');
    if (!kycApproved) return toast.error('KYC must be approved to settle');
    if (pendingSettlement) return toast.error('You already have a pending settlement request');

    setLoading(true);
    try {
      const res = await fetch('/api/user/settlement/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ amount: parsedAmount }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || 'Settlement initiated!');
        setAmount('');
        Promise.all([
          fetch('/api/auth/me').then(r => r.ok ? r.json() : null),
          fetch('/api/user/settlement').then(r => r.ok ? r.json() : null),
        ]).then(([userData, settlementData]) => {
          if (userData) setUser(userData);
          if (settlementData) setPendingSettlement(settlementData.settlements?.[0] || null);
        });
      } else {
        toast.error(data.error || 'Settlement failed');
      }
    } catch {
      toast.error('Failed to initiate settlement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow">
            <BanknotesIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Settlement</h1>
            <p className="text-sm text-gray-500">T+1 · Next Working Day</p>
          </div>
        </div>
      </motion.div>

      {/* KYC Bank Details Card */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <div className={`rounded-2xl border p-5 ${kycApproved ? 'bg-white border-gray-200' : 'bg-amber-50 border-amber-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BuildingLibraryIcon className="w-5 h-5 text-gray-600" />
              <span className="font-semibold text-gray-800 text-sm">Linked Bank Account</span>
            </div>
            {kycApproved ? (
              <span className="flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                <CheckBadgeIcon className="w-3.5 h-3.5" /> KYC Verified
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full">
                <ExclamationTriangleIcon className="w-3.5 h-3.5" /> KYC {kyc?.status || 'Pending'}
              </span>
            )}
          </div>

          {kycApproved && kyc ? (
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              {[
                { label: 'Account Holder', value: user?.name },
                { label: 'Bank Name', value: kyc.bankName },
                { label: 'Account Number', value: kyc.accountNumber ? `••••${kyc.accountNumber.slice(-4)}` : '—' },
                { label: 'IFSC Code', value: kyc.ifscCode },
                { label: 'PAN Number', value: kyc.panNumber ? `${kyc.panNumber.slice(0, 2)}•••••${kyc.panNumber.slice(-2)}` : '—' },
                { label: 'Contact', value: kyc.contactNumber || '—' },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                  <p className="text-sm font-medium text-gray-800">{value || '—'}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-amber-700">
              {kyc ? `Your KYC is ${kyc.status}. Settlement is available only after KYC approval.` : 'Complete your KYC to enable bank settlements.'}
            </p>
          )}
        </div>
      </motion.div>

      {/* Settlement Form */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-5">
          {/* Settlement Date */}
          <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl p-4">
            <CalendarDaysIcon className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-0.5">Settlement Date</p>
              <p className="text-sm font-semibold text-blue-900">{getNextWorkingDay()}</p>
              <p className="text-xs text-blue-500 mt-0.5">Amount credited on the next working day</p>
            </div>
          </div>

          {/* Balance + Min Limit Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-400 mb-1">Available Balance</p>
              <p className="text-xl font-bold text-gray-900">₹{user?.walletBalance?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-400 mb-1">Min Settlement</p>
              <p className="text-xl font-bold text-emerald-600">₹{MIN_SETTLEMENT.toLocaleString('en-IN')}</p>
            </div>
          </div>

          {/* Amount Input */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Settlement Amount</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">₹</span>
                <input
                  type="number"
                  step="0.01"
                  min={MIN_SETTLEMENT}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="input-field pl-8"
                  required
                />
                <button
                  type="button"
                  onClick={() => setAmount(String(user?.walletBalance || MIN_SETTLEMENT))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md"
                >
                  MAX
                </button>
              </div>
              {parsedAmount > 0 && (
                <div className="mt-2">
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${parsedAmount >= MIN_SETTLEMENT ? 'bg-emerald-400' : 'bg-amber-400'}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {parsedAmount < MIN_SETTLEMENT
                      ? `₹${(MIN_SETTLEMENT - parsedAmount).toLocaleString('en-IN')} more needed to reach minimum`
                      : 'Meets minimum requirement ✓'}
                  </p>
                </div>
              )}
            </div>

            {pendingSettlement && (
              <div className="flex items-start gap-3 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-yellow-800">Pending Settlement Request</p>
                  <p className="text-xs text-yellow-700 mt-0.5">
                    ₹{pendingSettlement.settlementAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })} is pending admin approval.
                    You cannot initiate a new request until this is processed.
                  </p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !canSettle}
              className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold text-white bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              {loading ? 'Processing...' : (<>Initiate Settlement <ArrowRightIcon className="w-4 h-4" /></>)}
            </button>
          </form>
        </div>
      </motion.div>

      {/* Info */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <InformationCircleIcon className="w-4 h-4 text-amber-600" />
            <p className="text-sm font-semibold text-amber-800">Important Information</p>
          </div>
          <ul className="space-y-1.5">
            {[
              'Minimum settlement per request is ₹10,000.00',
              'Settlement follows T+1 model (Next working day)',
              'Weekends and public holidays are excluded',
              'Amount is deducted from wallet immediately',
              'Bank transfer is processed on the settlement date',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 text-xs text-amber-700">
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </motion.div>
    </div>
  );
}
