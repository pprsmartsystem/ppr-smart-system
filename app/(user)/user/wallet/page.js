'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  WalletIcon,
  ArrowDownLeftIcon,
  ArrowUpRightIcon,
  QrCodeIcon,
  LinkIcon,
  ClipboardDocumentIcon,
  CheckCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  BanknotesIcon,
  ClockIcon,
  SparklesIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.35, ease: 'easeOut' },
});

export default function WalletPage() {
  const [user, setUser] = useState(null);
  const [gateways, setGateways] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedGateway, setSelectedGateway] = useState(null);
  const [paymentData, setPaymentData] = useState({ utrNumber: '', name: '', amount: '' });
  const [hideBalance, setHideBalance] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    Promise.all([
      fetch('/api/auth/me').then(r => r.ok ? r.json() : null),
      fetch('/api/user/payment-gateway', { cache: 'no-store' }).then(r => r.ok ? r.json() : null),
      fetch('/api/user/transactions?limit=20').then(r => r.ok ? r.json() : null),
    ]).then(([userData, gwData, txData]) => {
      if (userData) setUser(userData);
      if (gwData) setGateways(gwData.gateways || []);
      if (txData) setTransactions(txData.transactions || []);
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/user/payment-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData),
      });
      if (res.ok) {
        toast.success('Payment request submitted! Admin will verify shortly.');
        setShowModal(false);
        setPaymentData({ utrNumber: '', name: '', amount: '' });
      } else {
        toast.error('Failed to submit request');
      }
    } catch {
      toast.error('Error submitting payment');
    } finally {
      setSubmitting(false);
    }
  };

  const copyText = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`);
  };

  const totalIn = transactions.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0);
  const totalOut = transactions.filter(t => t.type !== 'credit').reduce((s, t) => s + t.amount, 0);

  const filtered = transactions.filter(t => {
    if (activeTab === 'credit') return t.type === 'credit';
    if (activeTab === 'debit') return t.type !== 'credit';
    return true;
  });

  const mask = (v) => hideBalance ? '••••••' : v;

  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-10">

      {/* ── Wallet Balance Hero ───────────────────────────────── */}
      <motion.div {...fade(0)}>
        <div className="relative overflow-hidden rounded-3xl p-7 text-white"
          style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #1d4ed8 100%)' }}>
          <div className="absolute -top-14 -right-14 w-56 h-56 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #818cf8, transparent)' }} />
          <div className="absolute -bottom-10 -left-10 w-44 h-44 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #38bdf8, transparent)' }} />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                  <WalletIcon className="w-5 h-5 text-white" />
                </div>
                <span className="font-semibold text-white/80 text-sm">My Wallet</span>
              </div>
              <button onClick={() => setHideBalance(h => !h)}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                {hideBalance ? <EyeIcon className="w-4 h-4 text-white" /> : <EyeSlashIcon className="w-4 h-4 text-white" />}
              </button>
            </div>

            <p className="text-indigo-200 text-xs uppercase tracking-widest mb-1">Available Balance</p>
            <p className="text-5xl font-bold tracking-tight mb-1">
              {hideBalance ? '₹ ••••••' : `₹${user?.walletBalance?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}`}
            </p>
            <p className="text-indigo-300 text-sm mb-6">{user?.name}</p>

            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Money In', value: `₹${totalIn.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, icon: ArrowDownLeftIcon, color: 'text-green-300' },
                { label: 'Money Out', value: `₹${totalOut.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, icon: ArrowUpRightIcon, color: 'text-red-300' },
                { label: 'Transactions', value: transactions.length, icon: SparklesIcon, color: 'text-blue-300' },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/10">
                  <Icon className={`w-4 h-4 ${color} mb-2`} />
                  <p className="text-white font-bold text-sm">{mask(value)}</p>
                  <p className="text-indigo-300 text-xs mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Add Money Section ─────────────────────────────────── */}
      <motion.div {...fade(0.1)}>
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <BanknotesIcon className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-gray-900">Add Money</h3>
          </div>

          {gateways.length > 0 ? (
            <div className="space-y-3">
              {gateways.map((gw) => (
                <div key={gw._id} className="border border-gray-100 rounded-2xl overflow-hidden">
                  <div className="flex items-center justify-between p-4 bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${gw.type === 'qr_code' ? 'bg-purple-100' : 'bg-blue-100'}`}>
                        {gw.type === 'qr_code'
                          ? <QrCodeIcon className="w-5 h-5 text-purple-600" />
                          : <LinkIcon className="w-5 h-5 text-blue-600" />}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{gw.name}</p>
                        <p className="text-xs text-gray-400">{gw.type === 'qr_code' ? 'Scan QR to pay' : 'Click to pay online'}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedGateway(selectedGateway?._id === gw._id ? null : gw)}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg"
                    >
                      {selectedGateway?._id === gw._id ? 'Hide' : 'View'}
                    </button>
                  </div>

                  {selectedGateway?._id === gw._id && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="p-4 border-t border-gray-100">
                      {gw.type === 'qr_code' && gw.qrCodeUrl && (
                        <div className="text-center">
                          <div className="inline-block p-3 bg-white rounded-2xl shadow-sm border border-gray-100 mb-3">
                            <img src={gw.qrCodeUrl} alt="QR Code" className="w-44 h-44 object-contain" />
                          </div>
                          <p className="text-xs text-gray-500">Scan with any UPI app to pay</p>
                        </div>
                      )}
                      {gw.type === 'payment_link' && gw.paymentLink && (
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-50 rounded-xl px-3 py-2 text-xs text-gray-600 truncate font-mono border border-gray-100">
                            {gw.paymentLink}
                          </div>
                          <button onClick={() => copyText(gw.paymentLink, 'Link')}
                            className="p-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
                            <ClipboardDocumentIcon className="w-4 h-4 text-gray-600" />
                          </button>
                          <a href={gw.paymentLink.startsWith('http') ? gw.paymentLink : `https://${gw.paymentLink}`}
                            target="_blank" rel="noopener noreferrer"
                            className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-700 transition-colors">
                            Pay Now
                          </a>
                        </div>
                      )}
                      {gw.instructions && (
                        <p className="text-xs text-gray-500 mt-3 bg-amber-50 border border-amber-100 rounded-xl p-3">{gw.instructions}</p>
                      )}
                    </motion.div>
                  )}
                </div>
              ))}

              <button onClick={() => setShowModal(true)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-sm hover:from-indigo-700 hover:to-purple-700 transition-all shadow-sm">
                <CheckCircleIcon className="w-4 h-4" />
                Submit Payment Proof (UTR)
              </button>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-3">
                <BanknotesIcon className="w-7 h-7 text-gray-300" />
              </div>
              <p className="text-sm text-gray-500 mb-1">No payment methods available</p>
              <p className="text-xs text-gray-400">Contact admin to add balance</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* ── Transaction History ───────────────────────────────── */}
      <motion.div {...fade(0.2)}>
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ClockIcon className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-gray-900">Transaction History</h3>
            </div>
            <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-full">{transactions.length} total</span>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-gray-50 rounded-xl p-1 mb-4">
            {[['all', 'All'], ['credit', 'Money In'], ['debit', 'Money Out']].map(([val, label]) => (
              <button key={val} onClick={() => setActiveTab(val)}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${activeTab === val ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                {label}
              </button>
            ))}
          </div>

          {filtered.length > 0 ? (
            <div className="space-y-1">
              {filtered.map((tx) => (
                <div key={tx._id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${tx.type === 'credit' ? 'bg-green-50' : 'bg-red-50'}`}>
                    {tx.type === 'credit'
                      ? <ArrowDownLeftIcon className="w-4 h-4 text-green-600" />
                      : <ArrowUpRightIcon className="w-4 h-4 text-red-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{tx.description}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs text-gray-400">
                        {new Date(tx.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                        tx.status === 'completed' ? 'bg-green-50 text-green-600' :
                        tx.status === 'pending' ? 'bg-amber-50 text-amber-600' :
                        'bg-red-50 text-red-500'
                      }`}>{tx.status}</span>
                    </div>
                  </div>
                  <span className={`text-sm font-bold flex-shrink-0 ${tx.type === 'credit' ? 'text-green-600' : 'text-red-500'}`}>
                    {tx.type === 'credit' ? '+' : '-'}₹{tx.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-3">
                <ClockIcon className="w-7 h-7 text-gray-300" />
              </div>
              <p className="text-sm text-gray-400">No transactions found</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* ── Submit UTR Modal ──────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Submit Payment Proof</h2>
                <p className="text-xs text-gray-400 mt-0.5">Enter your UTR / transaction reference</p>
              </div>
              <button onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                <XMarkIcon className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {[
                { key: 'utrNumber', label: 'UTR / Reference Number', placeholder: 'e.g. 123456789012', type: 'text' },
                { key: 'name', label: 'Sender Name', placeholder: 'Name on payment', type: 'text' },
                { key: 'amount', label: 'Amount (₹)', placeholder: '0.00', type: 'number' },
              ].map(({ key, label, placeholder, type }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
                  <input
                    type={type}
                    value={paymentData[key]}
                    onChange={(e) => setPaymentData({ ...paymentData, [key]: e.target.value })}
                    placeholder={placeholder}
                    className="input-field"
                    required
                    min={type === 'number' ? '1' : undefined}
                    step={type === 'number' ? '0.01' : undefined}
                  />
                </div>
              ))}

              <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
                <p className="text-xs text-amber-700">Admin will verify your payment and credit your wallet within 24 hours.</p>
              </div>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 btn-secondary">Cancel</button>
                <button type="submit" disabled={submitting}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-sm hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 transition-all">
                  {submitting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
