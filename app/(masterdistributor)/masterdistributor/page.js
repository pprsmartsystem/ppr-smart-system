'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  UserGroupIcon, WalletIcon, CreditCardIcon, DocumentChartBarIcon,
  ShieldCheckIcon, ArrowPathIcon, ChevronRightIcon, PlusIcon,
  BanknotesIcon, UsersIcon, BuildingOfficeIcon,
} from '@heroicons/react/24/outline';

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.35, ease: 'easeOut' },
});

const QUICK_LINKS = [
  { label: 'Distributors', href: '/masterdistributor/distributors', icon: BuildingOfficeIcon, color: 'from-blue-500 to-cyan-500' },
  { label: 'Users', href: '/masterdistributor/users', icon: UsersIcon, color: 'from-purple-500 to-pink-500' },
  { label: 'Settlement', href: '/masterdistributor/settlement', icon: BanknotesIcon, color: 'from-emerald-500 to-green-600' },
  { label: 'Reports', href: '/masterdistributor/reports', icon: DocumentChartBarIcon, color: 'from-orange-500 to-amber-500' },
];

export default function MasterDistributorDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [now] = useState(new Date());

  const load = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    try {
      const res = await fetch('/api/masterdistributor/dashboard');
      if (res.status === 403) {
        await fetch('/api/auth/logout', { method: 'POST' });
        window.location.href = '/login?message=Account is on hold';
        return;
      }
      if (res.ok) setStats(await res.json());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  const greeting = now.getHours() < 12 ? 'Good Morning' : now.getHours() < 17 ? 'Good Afternoon' : 'Good Evening';

  if (loading) return (
    <div className="space-y-6 animate-pulse max-w-6xl mx-auto">
      <div className="h-44 bg-gray-200 rounded-3xl" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-gray-200 rounded-2xl" />)}
      </div>
    </div>
  );

  const statCards = [
    { label: 'Wallet Balance', value: `₹${(stats?.walletBalance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, icon: WalletIcon, color: 'bg-emerald-50', iconColor: 'text-emerald-600', highlight: true },
    { label: 'Total Distributors', value: (stats?.totalDistributors || 0).toLocaleString(), icon: BuildingOfficeIcon, color: 'bg-blue-50', iconColor: 'text-blue-600' },
    { label: 'Total Users', value: (stats?.totalUsers || 0).toLocaleString(), icon: UserGroupIcon, color: 'bg-purple-50', iconColor: 'text-purple-600' },
    { label: 'Total Cards', value: (stats?.totalCards || 0).toLocaleString(), icon: CreditCardIcon, color: 'bg-violet-50', iconColor: 'text-violet-600' },
  ];

  return (
    <div className="space-y-6 pb-8 max-w-6xl mx-auto">
      {/* Hero */}
      <motion.div {...fade(0)}>
        <div className="relative overflow-hidden rounded-3xl p-7 text-white"
          style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 45%, #4c1d95 100%)' }}>
          <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #a78bfa, transparent)' }} />
          <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #c084fc, transparent)' }} />
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-purple-200 text-sm font-medium mb-1">{greeting} 👋</p>
                <h1 className="text-2xl font-bold tracking-tight">Master Distributor Panel</h1>
                <p className="text-purple-300 text-sm mt-1">
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
              <p className="text-purple-200 text-xs uppercase tracking-widest mb-1">Available Wallet Balance</p>
              <p className="text-4xl font-bold tracking-tight">
                ₹{(stats?.walletBalance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Distributors', value: stats?.totalDistributors || 0, icon: BuildingOfficeIcon, color: 'text-blue-300' },
                { label: 'Users', value: stats?.totalUsers || 0, icon: UserGroupIcon, color: 'text-purple-300' },
                { label: 'Cards', value: stats?.totalCards || 0, icon: CreditCardIcon, color: 'text-pink-300' },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/10">
                  <Icon className={`w-4 h-4 ${color} mb-2`} />
                  <p className="text-white font-bold text-sm">{value.toLocaleString()}</p>
                  <p className="text-purple-300 text-xs mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stat Cards */}
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

      {/* Quick Actions */}
      <motion.div {...fade(0.12)}>
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {QUICK_LINKS.map(({ label, href, icon: Icon, color }) => (
              <Link key={href} href={href}
                className="flex flex-col items-center gap-2.5 p-4 rounded-2xl border border-gray-100 hover:border-purple-100 hover:bg-purple-50/30 transition-all group">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-semibold text-gray-700">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Settlement Overview */}
        <motion.div {...fade(0.16)}>
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Settlement Overview</h3>
              <Link href="/masterdistributor/settlement" className="flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700">
                View <ChevronRightIcon className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="space-y-3">
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3">
                <p className="text-xs text-emerald-600 font-medium mb-1">Total Settled</p>
                <p className="text-lg font-bold text-emerald-700">₹{(stats?.totalSettledAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
              </div>
              {[
                { label: 'Total Requests', value: stats?.totalSettlements || 0, color: 'bg-blue-500', pct: 100 },
                { label: 'Approved', value: stats?.approvedSettlements || 0, color: 'bg-green-500', pct: stats?.totalSettlements ? (stats.approvedSettlements / stats.totalSettlements) * 100 : 0 },
                { label: 'Pending', value: stats?.pendingSettlements || 0, color: 'bg-yellow-500', pct: stats?.totalSettlements ? (stats.pendingSettlements / stats.totalSettlements) * 100 : 0 },
                { label: 'Rejected', value: stats?.rejectedSettlements || 0, color: 'bg-red-500', pct: stats?.totalSettlements ? (stats.rejectedSettlements / stats.totalSettlements) * 100 : 0 },
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
            {stats?.canSettleToday && stats?.walletBalance >= 10000 && (
              <Link href="/masterdistributor/settlement"
                className="mt-4 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition-colors">
                <BanknotesIcon className="w-4 h-4" /> Request Settlement
              </Link>
            )}
            {!stats?.canSettleToday && (
              <div className="mt-4 bg-amber-50 border border-amber-100 rounded-lg p-3 text-xs text-amber-800">
                ⏳ Settlement already initiated today. Next available tomorrow.
              </div>
            )}
          </div>
        </motion.div>

        {/* Distributor Overview */}
        <motion.div {...fade(0.18)}>
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Distributor Overview</h3>
              <Link href="/masterdistributor/distributors" className="flex items-center gap-1 text-xs font-semibold text-purple-600 hover:text-purple-700">
                Manage <ChevronRightIcon className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Total Distributors', value: stats?.totalDistributors || 0, color: 'bg-blue-500', pct: 100 },
                { label: 'Active Distributors', value: stats?.activeDistributors || 0, color: 'bg-green-500', pct: stats?.totalDistributors ? (stats.activeDistributors / stats.totalDistributors) * 100 : 0 },
                { label: 'On Hold', value: stats?.heldDistributors || 0, color: 'bg-orange-500', pct: stats?.totalDistributors ? (stats.heldDistributors / stats.totalDistributors) * 100 : 0 },
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

        {/* User Overview */}
        <motion.div {...fade(0.2)}>
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">User Overview</h3>
              <Link href="/masterdistributor/users" className="flex items-center gap-1 text-xs font-semibold text-purple-600 hover:text-purple-700">
                View <ChevronRightIcon className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Total Users', value: stats?.totalUsers || 0, color: 'bg-purple-500', pct: 100 },
                { label: 'Active Cards', value: stats?.totalCards || 0, color: 'bg-violet-500', pct: stats?.totalUsers ? Math.min((stats.totalCards / stats.totalUsers) * 100, 100) : 0 },
                { label: 'Transactions', value: stats?.totalTransactions || 0, color: 'bg-pink-500', pct: 75 },
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
      </div>

      {/* Security Banner */}
      <motion.div {...fade(0.24)}>
        <div className="flex items-center gap-4 bg-gradient-to-r from-purple-900 to-indigo-900 rounded-2xl p-5">
          <div className="w-11 h-11 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0">
            <ShieldCheckIcon className="w-6 h-6 text-green-400" />
          </div>
          <div className="flex-1">
            <p className="text-white font-semibold text-sm">Your panel is secure</p>
            <p className="text-purple-300 text-xs mt-0.5">256-bit SSL · JWT authentication · Role-based access control</p>
          </div>
          <Link href="/masterdistributor/settings" className="text-xs font-semibold text-purple-300 hover:text-purple-200 flex-shrink-0">
            Settings
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
