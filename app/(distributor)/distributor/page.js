'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  UserGroupIcon, WalletIcon, CreditCardIcon, DocumentChartBarIcon,
  ShieldCheckIcon, ArrowUpRightIcon, ArrowDownLeftIcon, ChevronRightIcon,
  PlusIcon, ArrowPathIcon, BanknotesIcon, SparklesIcon,
} from '@heroicons/react/24/outline';

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.35, ease: 'easeOut' },
});

const QUICK_LINKS = [
  { label: 'Add User',    href: '/distributor/users',   icon: PlusIcon,              color: 'from-blue-500 to-cyan-500' },
  { label: 'Wallet',      href: '/distributor/wallet',  icon: WalletIcon,            color: 'from-emerald-500 to-green-600' },
  { label: 'Reports',     href: '/distributor/reports', icon: DocumentChartBarIcon,  color: 'from-orange-500 to-amber-500' },
  { label: 'Support',     href: '/distributor/support', icon: ShieldCheckIcon,       color: 'from-violet-500 to-purple-600' },
];

export default function DistributorDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [now] = useState(new Date());

  const load = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    try {
      const res = await fetch('/api/distributor/dashboard');
      if (res.ok) setStats(await res.json());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  const greeting = now.getHours() < 12 ? 'Good Morning' : now.getHours() < 17 ? 'Good Afternoon' : 'Good Evening';

  if (loading) return (
    <div className="space-y-6 animate-pulse max-w-4xl mx-auto">
      <div className="h-44 bg-gray-200 rounded-3xl" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-gray-200 rounded-2xl" />)}
      </div>
    </div>
  );

  const statCards = [
    { label: 'Wallet Balance',  value: `₹${(stats?.walletBalance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, icon: WalletIcon,            color: 'bg-emerald-50', iconColor: 'text-emerald-600', highlight: true },
    { label: 'Total Users',     value: (stats?.totalUsers || 0).toLocaleString(),                                                  icon: UserGroupIcon,         color: 'bg-blue-50',    iconColor: 'text-blue-600' },
    { label: 'Total Cards',     value: (stats?.totalCards || 0).toLocaleString(),                                                  icon: CreditCardIcon,        color: 'bg-violet-50',  iconColor: 'text-violet-600' },
    { label: 'Transactions',    value: (stats?.totalTransactions || 0).toLocaleString(),                                           icon: DocumentChartBarIcon,  color: 'bg-amber-50',   iconColor: 'text-amber-600' },
  ];

  return (
    <div className="space-y-6 pb-8 max-w-4xl mx-auto">

      {/* ── Hero ─────────────────────────────────────────────── */}
      <motion.div {...fade(0)}>
        <div className="relative overflow-hidden rounded-3xl p-7 text-white"
          style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 45%, #1d4ed8 100%)' }}>
          <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #818cf8, transparent)' }} />
          <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #38bdf8, transparent)' }} />
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-indigo-200 text-sm font-medium mb-1">{greeting} 👋</p>
                <h1 className="text-2xl font-bold tracking-tight">Distributor Panel</h1>
                <p className="text-indigo-300 text-sm mt-1">
                  {now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => load(true)}
                  className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                  <ArrowPathIcon className={`w-4 h-4 text-white ${refreshing ? 'animate-spin' : ''}`} />
                </button>
                <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/20">
                  <ShieldCheckIcon className="w-3.5 h-3.5 text-green-300" />
                  <span className="text-xs font-medium text-green-200">Secured</span>
                </div>
              </div>
            </div>

            {/* Wallet highlight */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10 mb-4">
              <p className="text-indigo-200 text-xs uppercase tracking-widest mb-1">Available Wallet Balance</p>
              <p className="text-4xl font-bold tracking-tight">
                ₹{(stats?.walletBalance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Users',        value: stats?.totalUsers || 0,        icon: UserGroupIcon,        color: 'text-blue-300' },
                { label: 'Cards',        value: stats?.totalCards || 0,        icon: CreditCardIcon,       color: 'text-purple-300' },
                { label: 'Transactions', value: stats?.totalTransactions || 0, icon: DocumentChartBarIcon, color: 'text-amber-300' },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/10">
                  <Icon className={`w-4 h-4 ${color} mb-2`} />
                  <p className="text-white font-bold text-sm">{value.toLocaleString()}</p>
                  <p className="text-indigo-300 text-xs mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Stat Cards ───────────────────────────────────────── */}
      <motion.div {...fade(0.08)}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map(({ label, value, icon: Icon, color, iconColor, highlight }) => (
            <div key={label} className={`bg-white rounded-2xl border p-5 hover:shadow-md transition-shadow ${highlight ? 'border-emerald-200' : 'border-gray-100'}`}>
              <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${iconColor}`} />
              </div>
              <p className={`text-xl font-bold ${highlight ? 'text-emerald-600' : 'text-gray-900'}`}>{value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Quick Actions ─────────────────────────────────────── */}
      <motion.div {...fade(0.12)}>
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {QUICK_LINKS.map(({ label, href, icon: Icon, color }) => (
              <Link key={href} href={href}
                className="flex flex-col items-center gap-2.5 p-4 rounded-2xl border border-gray-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition-all group">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-semibold text-gray-700">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── User Summary + Activity ───────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* User overview */}
        <motion.div {...fade(0.16)}>
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">User Overview</h3>
              <Link href="/distributor/users" className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700">
                Manage <ChevronRightIcon className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Total Users',    value: stats?.totalUsers || 0,        color: 'bg-blue-500',    pct: 100 },
                { label: 'Active Cards',   value: stats?.totalCards || 0,        color: 'bg-violet-500',  pct: stats?.totalCards && stats?.totalUsers ? Math.min((stats.totalCards / stats.totalUsers) * 100, 100) : 0 },
                { label: 'Transactions',   value: stats?.totalTransactions || 0, color: 'bg-amber-500',   pct: 75 },
              ].map(({ label, value, color, pct }) => (
                <div key={label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">{label}</span>
                    <span className="text-sm font-bold text-gray-900">{value.toLocaleString()}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Wallet activity */}
        <motion.div {...fade(0.2)}>
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Wallet Activity</h3>
              <Link href="/distributor/wallet" className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700">
                View <ChevronRightIcon className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Add Balance to User',  href: '/distributor/wallet',  icon: ArrowUpRightIcon,  color: 'bg-blue-50 text-blue-600',    desc: 'Credit user wallets' },
                { label: 'View Reports',          href: '/distributor/reports', icon: DocumentChartBarIcon, color: 'bg-amber-50 text-amber-600', desc: 'Transaction history' },
                { label: 'Recharge Wallet',       href: '/distributor/recharge',icon: BanknotesIcon,     color: 'bg-green-50 text-green-600',  desc: 'Top up your balance' },
              ].map(({ label, href, icon: Icon, color, desc }) => (
                <Link key={href} href={href}
                  className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition-all group">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800">{label}</p>
                    <p className="text-xs text-gray-400">{desc}</p>
                  </div>
                  <ChevronRightIcon className="w-4 h-4 text-gray-300 group-hover:text-indigo-400 transition-colors flex-shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Security Banner ───────────────────────────────────── */}
      <motion.div {...fade(0.24)}>
        <div className="flex items-center gap-4 bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-5">
          <div className="w-11 h-11 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0">
            <ShieldCheckIcon className="w-6 h-6 text-green-400" />
          </div>
          <div className="flex-1">
            <p className="text-white font-semibold text-sm">Your panel is secure</p>
            <p className="text-slate-400 text-xs mt-0.5">256-bit SSL · JWT authentication · Role-based access control</p>
          </div>
          <Link href="/distributor/settings" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex-shrink-0">
            Settings
          </Link>
        </div>
      </motion.div>

    </div>
  );
}
