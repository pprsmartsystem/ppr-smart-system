'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  UserGroupIcon, WalletIcon, CreditCardIcon, DocumentChartBarIcon,
  ShieldCheckIcon, ChevronRightIcon, PlusIcon, ArrowUpRightIcon,
  BuildingOfficeIcon, BanknotesIcon, ArrowPathIcon,
} from '@heroicons/react/24/outline';

const fade = (d = 0) => ({ initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { delay: d, duration: 0.35, ease: 'easeOut' } });

const QUICK = [
  { label: 'Add Employee',  href: '/corporate/employees', icon: PlusIcon,              color: 'from-blue-500 to-cyan-500' },
  { label: 'Bulk Credit',   href: '/corporate/wallet',    icon: BanknotesIcon,         color: 'from-emerald-500 to-green-600' },
  { label: 'Issue Cards',   href: '/corporate/cards',     icon: CreditCardIcon,        color: 'from-violet-500 to-purple-600' },
  { label: 'Reports',       href: '/corporate/reports',   icon: DocumentChartBarIcon,  color: 'from-orange-500 to-amber-500' },
];

export default function CorporateDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [now] = useState(new Date());

  useEffect(() => {
    fetch('/api/corporate/dashboard').then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setStats(d); }).finally(() => setLoading(false));
  }, []);

  const greeting = now.getHours() < 12 ? 'Good Morning' : now.getHours() < 17 ? 'Good Afternoon' : 'Good Evening';

  if (loading) return (
    <div className="space-y-6 animate-pulse max-w-5xl mx-auto">
      <div className="h-44 bg-gray-200 rounded-3xl" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-gray-200 rounded-2xl" />)}</div>
    </div>
  );

  const cards = [
    { label: 'Employees',      value: (stats?.totalEmployees || 0).toLocaleString(),                                                    icon: UserGroupIcon,        bg: 'bg-blue-50',    ic: 'text-blue-600' },
    { label: 'Wallet Balance', value: `₹${(stats?.walletBalance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,          icon: WalletIcon,           bg: 'bg-emerald-50', ic: 'text-emerald-600', highlight: true },
    { label: 'Active Cards',   value: (stats?.activeCards || 0).toLocaleString(),                                                       icon: CreditCardIcon,       bg: 'bg-violet-50',  ic: 'text-violet-600' },
    { label: 'Monthly Spend',  value: `₹${(stats?.monthlySpend || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,           icon: ArrowUpRightIcon,     bg: 'bg-amber-50',   ic: 'text-amber-600' },
  ];

  return (
    <div className="space-y-6 pb-8 max-w-5xl mx-auto">

      {/* Hero */}
      <motion.div {...fade(0)}>
        <div className="relative overflow-hidden rounded-3xl p-7 text-white"
          style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 45%, #1d4ed8 100%)' }}>
          <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #818cf8, transparent)' }} />
          <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #38bdf8, transparent)' }} />
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-indigo-200 text-sm font-medium mb-1">{greeting} 👋</p>
                <h1 className="text-2xl font-bold">Corporate Dashboard</h1>
                <p className="text-indigo-300 text-sm mt-1">{now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
              <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/20">
                <ShieldCheckIcon className="w-3.5 h-3.5 text-green-300" />
                <span className="text-xs font-medium text-green-200">Secured</span>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Employees',    value: stats?.totalEmployees || 0,   icon: UserGroupIcon,       color: 'text-blue-300' },
                { label: 'Wallet',       value: `₹${(stats?.walletBalance || 0).toLocaleString('en-IN')}`, icon: WalletIcon, color: 'text-green-300' },
                { label: 'Cards',        value: stats?.activeCards || 0,      icon: CreditCardIcon,      color: 'text-purple-300' },
                { label: 'Monthly Spend',value: `₹${(stats?.monthlySpend || 0).toLocaleString('en-IN')}`, icon: ArrowUpRightIcon, color: 'text-amber-300' },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/10">
                  <Icon className={`w-4 h-4 ${color} mb-2`} />
                  <p className="text-white font-bold text-sm">{typeof value === 'number' ? value.toLocaleString() : value}</p>
                  <p className="text-indigo-300 text-xs mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stat Cards */}
      <motion.div {...fade(0.08)}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map(({ label, value, icon: Icon, bg, ic, highlight }) => (
            <div key={label} className={`bg-white rounded-2xl border p-5 hover:shadow-md transition-shadow ${highlight ? 'border-emerald-200' : 'border-gray-100'}`}>
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}><Icon className={`w-5 h-5 ${ic}`} /></div>
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
            {QUICK.map(({ label, href, icon: Icon, color }) => (
              <Link key={href} href={href} className="flex flex-col items-center gap-2.5 p-4 rounded-2xl border border-gray-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition-all group">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-semibold text-gray-700 text-center">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Employee Overview + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <motion.div {...fade(0.16)}>
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Employee Overview</h3>
              <Link href="/corporate/employees" className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700">Manage <ChevronRightIcon className="w-3.5 h-3.5" /></Link>
            </div>
            <div className="space-y-4">
              {[
                { label: 'Total Employees', value: stats?.totalEmployees || 0, color: 'bg-blue-500', pct: 100 },
                { label: 'Active Cards',    value: stats?.activeCards || 0,    color: 'bg-violet-500', pct: stats?.totalEmployees ? Math.min(((stats?.activeCards || 0) / stats.totalEmployees) * 100, 100) : 0 },
              ].map(({ label, value, color, pct }) => (
                <div key={label}>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-sm text-gray-600">{label}</span>
                    <span className="text-sm font-bold text-gray-900">{value.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              ))}
              <div className="pt-2 grid grid-cols-2 gap-3">
                <Link href="/corporate/employees" className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-50 text-blue-600 text-sm font-semibold hover:bg-blue-100 transition-colors">
                  <UserGroupIcon className="w-4 h-4" /> View All
                </Link>
                <Link href="/corporate/allowances" className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-50 text-emerald-600 text-sm font-semibold hover:bg-emerald-100 transition-colors">
                  <BanknotesIcon className="w-4 h-4" /> Allowances
                </Link>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div {...fade(0.2)}>
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Recent Activity</h3>
              <Link href="/corporate/reports" className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700">Reports <ChevronRightIcon className="w-3.5 h-3.5" /></Link>
            </div>
            <div className="space-y-1">
              {[
                { action: 'Employee added',          detail: 'Alice Wilson',    time: '2h ago',  icon: UserGroupIcon,       color: 'bg-blue-50 text-blue-600' },
                { action: 'Allowance distributed',   detail: '5 employees',     time: '1d ago',  icon: BanknotesIcon,       color: 'bg-green-50 text-green-600' },
                { action: 'Card issued',             detail: 'Bob Brown',       time: '2d ago',  icon: CreditCardIcon,      color: 'bg-violet-50 text-violet-600' },
                { action: 'Report generated',        detail: 'Monthly Report',  time: '3d ago',  icon: DocumentChartBarIcon,color: 'bg-amber-50 text-amber-600' },
              ].map((a, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${a.color}`}><a.icon className="w-4 h-4" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{a.action}</p>
                    <p className="text-xs text-gray-400">{a.detail}</p>
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0">{a.time}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Security Banner */}
      <motion.div {...fade(0.24)}>
        <div className="flex items-center gap-4 bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-5">
          <div className="w-11 h-11 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0">
            <ShieldCheckIcon className="w-6 h-6 text-green-400" />
          </div>
          <div className="flex-1">
            <p className="text-white font-semibold text-sm">Corporate panel is secure</p>
            <p className="text-slate-400 text-xs mt-0.5">256-bit SSL · JWT auth · Role-based access control</p>
          </div>
          <Link href="/corporate/settings" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex-shrink-0">Settings</Link>
        </div>
      </motion.div>
    </div>
  );
}
