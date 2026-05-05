'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  WalletIcon,
  CreditCardIcon,
  GiftIcon,
  DocumentChartBarIcon,
  ClockIcon,
  ArrowUpRightIcon,
  ArrowDownLeftIcon,
  ShieldCheckIcon,
  BanknotesIcon,
  SparklesIcon,
  ChevronRightIcon,
  EyeIcon,
  EyeSlashIcon,
  ExclamationTriangleIcon,
  DocumentCheckIcon,
} from '@heroicons/react/24/outline';
import { formatCurrency } from '@/utils/cardUtils';

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.4, ease: 'easeOut' },
});

export default function UserDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [cards, setCards] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [pendingSettlement, setPendingSettlement] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hideBalance, setHideBalance] = useState(false);
  const [kycStatus, setKycStatus] = useState(null);

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchDashboardData = async () => {
    try {
      const [userRes, cardsRes, txRes, settlementRes, kycRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/user/cards'),
        fetch('/api/user/transactions?limit=6'),
        fetch('/api/user/settlement'),
        fetch('/api/user/kyc/status'),
      ]);

      if (!userRes.ok) return;
      const userData = await userRes.json();
      setUser(userData);
      if (cardsRes.ok) setCards((await cardsRes.json()).cards || []);
      if (txRes.ok) setTransactions((await txRes.json()).transactions || []);
      if (settlementRes.ok) setPendingSettlement((await settlementRes.json()).totalPending || 0);
      if (kycRes.ok) {
        const kycData = await kycRes.json();
        setKycStatus(kycData.kyc);
      }
    } catch {
      // silently fail — layout already handles auth
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="space-y-6 animate-pulse">
      <div className="h-48 bg-gray-200 rounded-3xl" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-gray-200 rounded-2xl" />)}
      </div>
    </div>
  );

  // Block dashboard if KYC not approved
  if (!kycStatus || kycStatus.status !== 'approved') {
    return (
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl border border-gray-100 p-8 text-center"
        >
          <div className="w-20 h-20 rounded-full bg-orange-50 flex items-center justify-center mx-auto mb-6">
            {!kycStatus ? (
              <DocumentCheckIcon className="w-10 h-10 text-orange-500" />
            ) : kycStatus.status === 'pending' ? (
              <ClockIcon className="w-10 h-10 text-blue-500" />
            ) : kycStatus.status === 'rejected' ? (
              <ExclamationTriangleIcon className="w-10 h-10 text-red-500" />
            ) : (
              <DocumentCheckIcon className="w-10 h-10 text-orange-500" />
            )}
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            {!kycStatus ? 'KYC Verification Required' : 
             kycStatus.status === 'pending' ? 'KYC Under Review' :
             kycStatus.status === 'rejected' ? 'KYC Rejected' :
             'Complete Your KYC'}
          </h2>

          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            {!kycStatus ? 'Please complete your KYC verification to access your dashboard and all features.' :
             kycStatus.status === 'pending' ? 'Your KYC documents are under review. You will be notified once approved.' :
             kycStatus.status === 'rejected' ? `Your KYC was rejected. Reason: ${kycStatus.rejectionReason || 'Please contact support'}` :
             'Your KYC verification is required to access the dashboard.'}
          </p>

          {kycStatus?.status === 'pending' ? (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
              <p className="text-sm text-blue-700">
                <strong>Status:</strong> Pending Review<br />
                <strong>Submitted:</strong> {new Date(kycStatus.submittedAt).toLocaleDateString('en-IN')}
              </p>
            </div>
          ) : null}

          {kycStatus?.status === 'rejected' && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-6">
              <p className="text-sm text-red-700">
                <strong>Rejection Reason:</strong><br />
                {kycStatus.rejectionReason || 'Please contact support for details'}
              </p>
            </div>
          )}

          <Link
            href="/user/kyc"
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
          >
            <DocumentCheckIcon className="w-5 h-5" />
            {!kycStatus ? 'Complete KYC Now' :
             kycStatus.status === 'pending' ? 'View KYC Status' :
             kycStatus.status === 'rejected' ? 'Resubmit KYC' :
             'Submit KYC'}
          </Link>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Need help? Contact support at <a href="mailto:support@pprsmartsystem.com" className="text-indigo-600 hover:underline">support@pprsmartsystem.com</a>
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  const totalCardBalance = cards.reduce((s, c) => s + c.balance, 0);
  const activeCards = cards.filter(c => c.status === 'active').length;
  const totalIn = transactions.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0);
  const totalOut = transactions.filter(t => t.type !== 'credit').reduce((s, t) => s + t.amount, 0);

  const mask = (val) => hideBalance ? '₹ ••••••' : val;

  return (
    <div className="space-y-6 pb-8">

      {/* ── Hero Balance Card ─────────────────────────────────── */}
      <motion.div {...fade(0)}>
        <div className="relative overflow-hidden rounded-3xl p-7 text-white"
          style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #1d4ed8 100%)' }}>
          {/* Decorative blobs */}
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #818cf8, transparent)' }} />
          <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #60a5fa, transparent)' }} />

          <div className="relative z-10">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-indigo-200 text-sm font-medium mb-1">Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'},</p>
                <h1 className="text-2xl font-bold tracking-tight">{user?.name?.split(' ')[0]} 👋</h1>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/20">
                  <ShieldCheckIcon className="w-3.5 h-3.5 text-green-300" />
                  <span className="text-xs font-medium text-green-200">Secured</span>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-indigo-200 text-xs uppercase tracking-widest font-medium">Wallet Balance</p>
                <button onClick={() => setHideBalance(h => !h)} className="text-indigo-300 hover:text-white transition-colors">
                  {hideBalance ? <EyeIcon className="w-3.5 h-3.5" /> : <EyeSlashIcon className="w-3.5 h-3.5" />}
                </button>
              </div>
              <p className="text-4xl font-bold tracking-tight">{mask(formatCurrency(user?.walletBalance || 0))}</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Card Balance', value: mask(formatCurrency(totalCardBalance)), icon: CreditCardIcon },
                { label: 'Pending', value: mask(formatCurrency(pendingSettlement)), icon: ClockIcon },
                { label: 'Active Cards', value: activeCards, icon: SparklesIcon },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/10">
                  <Icon className="w-4 h-4 text-indigo-200 mb-2" />
                  <p className="text-white font-semibold text-sm">{value}</p>
                  <p className="text-indigo-300 text-xs mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Quick Actions ─────────────────────────────────────── */}
      <motion.div {...fade(0.1)}>
        <div className="grid grid-cols-4 gap-3">
          {[
            { href: '/user/wallet', icon: WalletIcon, label: 'Wallet', color: 'from-violet-500 to-purple-600' },
            { href: '/user/cards', icon: CreditCardIcon, label: 'Cards', color: 'from-blue-500 to-cyan-500' },
            { href: '/user/settlement', icon: BanknotesIcon, label: 'Settle', color: 'from-emerald-500 to-green-600' },
            { href: '/user/vouchers', icon: GiftIcon, label: 'Vouchers', color: 'from-pink-500 to-rose-500' },
          ].map(({ href, icon: Icon, label, color }) => (
            <Link key={href} href={href}>
              <div className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-sm`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs font-semibold text-gray-700">{label}</span>
              </div>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* ── Income / Expense Summary ──────────────────────────── */}
      <motion.div {...fade(0.15)}>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
              <ArrowDownLeftIcon className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium mb-0.5">Total In</p>
              <p className="text-lg font-bold text-green-600">{mask(formatCurrency(totalIn))}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
              <ArrowUpRightIcon className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium mb-0.5">Total Out</p>
              <p className="text-lg font-bold text-red-500">{mask(formatCurrency(totalOut))}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── My Cards ─────────────────────────────────────────── */}
      <motion.div {...fade(0.2)}>
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">My Cards</h3>
            <Link href="/user/cards" className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700">
              View All <ChevronRightIcon className="w-3.5 h-3.5" />
            </Link>
          </div>

          {cards.length > 0 ? (
            <div className="space-y-3">
              {cards.slice(0, 3).map((card, i) => {
                const gradients = [
                  'from-indigo-500 via-purple-500 to-pink-500',
                  'from-blue-500 via-cyan-500 to-teal-500',
                  'from-orange-500 via-red-500 to-rose-500',
                ];
                const g = gradients[i % gradients.length];
                return (
                  <div key={card._id} className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${g} p-4 text-white`}>
                    <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/10" />
                    <div className="relative z-10 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-white/60 mb-1 font-mono tracking-widest">
                          •••• •••• •••• {card.cardNumber?.slice(-4)}
                        </p>
                        <p className="font-bold text-base">{formatCurrency(card.balance)}</p>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          card.status === 'active' ? 'bg-white/20 text-white' : 'bg-black/20 text-white/70'
                        }`}>
                          {card.status}
                        </span>
                        <p className="text-xs text-white/60 mt-1">{card.expiryDate}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-3">
                <CreditCardIcon className="w-7 h-7 text-gray-300" />
              </div>
              <p className="text-sm text-gray-400 mb-3">No cards yet</p>
              <Link href="/user/cards" className="btn-primary text-sm py-2 px-4">Create Card</Link>
            </div>
          )}
        </div>
      </motion.div>

      {/* ── Recent Transactions ───────────────────────────────── */}
      <motion.div {...fade(0.25)}>
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">Recent Transactions</h3>
            <Link href="/user/transactions" className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700">
              View All <ChevronRightIcon className="w-3.5 h-3.5" />
            </Link>
          </div>

          {transactions.length > 0 ? (
            <div className="space-y-1">
              {transactions.map((tx) => (
                <div key={tx._id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    tx.type === 'credit' ? 'bg-green-50' : 'bg-red-50'
                  }`}>
                    {tx.type === 'credit'
                      ? <ArrowDownLeftIcon className="w-4 h-4 text-green-600" />
                      : <ArrowUpRightIcon className="w-4 h-4 text-red-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{tx.description}</p>
                    <p className="text-xs text-gray-400">{new Date(tx.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                  <span className={`text-sm font-bold flex-shrink-0 ${tx.type === 'credit' ? 'text-green-600' : 'text-red-500'}`}>
                    {tx.type === 'credit' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-3">
                <DocumentChartBarIcon className="w-7 h-7 text-gray-300" />
              </div>
              <p className="text-sm text-gray-400">No transactions yet</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* ── Security Banner ───────────────────────────────────── */}
      <motion.div {...fade(0.3)}>
        <div className="flex items-center gap-4 bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-5">
          <div className="w-11 h-11 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0">
            <ShieldCheckIcon className="w-6 h-6 text-green-400" />
          </div>
          <div className="flex-1">
            <p className="text-white font-semibold text-sm">Your account is secure</p>
            <p className="text-slate-400 text-xs mt-0.5">256-bit encryption · JWT protected · KYC verified</p>
          </div>
          <Link href="/user/kyc" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex-shrink-0">
            KYC Status
          </Link>
        </div>
      </motion.div>

    </div>
  );
}
