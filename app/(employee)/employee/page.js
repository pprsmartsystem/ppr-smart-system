'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  WalletIcon, CreditCardIcon, GiftIcon, DocumentChartBarIcon,
  ShieldCheckIcon, ChevronRightIcon, SparklesIcon, BuildingOfficeIcon,
  EyeIcon, EyeSlashIcon,
} from '@heroicons/react/24/outline';

const fade = (d = 0) => ({ initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { delay: d, duration: 0.35, ease: 'easeOut' } });

const QUICK = [
  { label: 'Allowance',    href: '/employee/allowance',    icon: WalletIcon,            color: 'from-emerald-500 to-green-600' },
  { label: 'My Cards',     href: '/employee/cards',        icon: CreditCardIcon,        color: 'from-blue-500 to-cyan-500' },
  { label: 'Vouchers',     href: '/employee/vouchers',     icon: GiftIcon,              color: 'from-violet-500 to-purple-600' },
  { label: 'Transactions', href: '/employee/transactions', icon: DocumentChartBarIcon,  color: 'from-orange-500 to-amber-500' },
];

export default function EmployeeDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hideBalance, setHideBalance] = useState(false);
  const [now] = useState(new Date());

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setUser(d); }).finally(() => setLoading(false));
  }, []);

  const greeting = now.getHours() < 12 ? 'Good Morning' : now.getHours() < 17 ? 'Good Afternoon' : 'Good Evening';
  const mask = v => hideBalance ? '••••••' : v;

  if (loading) return (
    <div className="space-y-6 animate-pulse max-w-2xl mx-auto">
      <div className="h-44 bg-gray-200 rounded-3xl" />
      <div className="grid grid-cols-2 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-gray-200 rounded-2xl" />)}</div>
    </div>
  );

  const stats = [
    { label: 'Allowance Balance', value: `₹${(user?.walletBalance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, icon: WalletIcon,           bg: 'bg-emerald-50', ic: 'text-emerald-600', masked: true },
    { label: 'Active Cards',      value: '2',                                                                                       icon: CreditCardIcon,      bg: 'bg-blue-50',    ic: 'text-blue-600' },
    { label: 'Vouchers Used',     value: '5',                                                                                       icon: GiftIcon,            bg: 'bg-violet-50',  ic: 'text-violet-600' },
    { label: 'Transactions',      value: '12',                                                                                      icon: DocumentChartBarIcon,bg: 'bg-amber-50',   ic: 'text-amber-600' },
  ];

  return (
    <div className="space-y-6 pb-8 max-w-2xl mx-auto">

      {/* Hero */}
      <motion.div {...fade(0)}>
        <div className="relative overflow-hidden rounded-3xl p-7 text-white"
          style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 45%, #1d4ed8 100%)' }}>
          <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #818cf8, transparent)' }} />
          <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #38bdf8, transparent)' }} />
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-5">
              <div>
                <p className="text-indigo-200 text-sm font-medium mb-1">{greeting} 👋</p>
                <h1 className="text-2xl font-bold">{user?.name?.split(' ')[0]}</h1>
                <p className="text-indigo-300 text-xs mt-1">{now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setHideBalance(h => !h)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                  {hideBalance ? <EyeIcon className="w-4 h-4 text-white" /> : <EyeSlashIcon className="w-4 h-4 text-white" />}
                </button>
                <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/20">
                  <ShieldCheckIcon className="w-3.5 h-3.5 text-green-300" />
                  <span className="text-xs font-medium text-green-200">Secured</span>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10 mb-4">
              <p className="text-indigo-200 text-xs uppercase tracking-widest mb-1">Allowance Balance</p>
              <p className="text-4xl font-bold tracking-tight">
                {hideBalance ? '₹ ••••••' : `₹${(user?.walletBalance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Cards',        value: '2',  icon: CreditCardIcon,       color: 'text-blue-300' },
                { label: 'Vouchers',     value: '5',  icon: GiftIcon,             color: 'text-purple-300' },
                { label: 'Transactions', value: '12', icon: DocumentChartBarIcon, color: 'text-amber-300' },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/10">
                  <Icon className={`w-4 h-4 ${color} mb-2`} />
                  <p className="text-white font-bold text-sm">{value}</p>
                  <p className="text-indigo-300 text-xs mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stat Cards */}
      <motion.div {...fade(0.08)}>
        <div className="grid grid-cols-2 gap-4">
          {stats.map(({ label, value, icon: Icon, bg, ic, masked }) => (
            <div key={label} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}><Icon className={`w-5 h-5 ${ic}`} /></div>
              <p className="text-xl font-bold text-gray-900">{masked ? mask(value) : value}</p>
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

      {/* Benefits Banner */}
      <motion.div {...fade(0.16)}>
        <div className="bg-white rounded-2xl border border-indigo-100 p-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <SparklesIcon className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-gray-900 mb-1">Corporate Benefits</p>
              <p className="text-sm text-gray-500 mb-3">Use your allowance to purchase gift vouchers, manage virtual cards, and enjoy rewards provided by your company.</p>
              <Link href="/employee/vouchers" className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700">
                Explore Benefits <ChevronRightIcon className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Security Banner */}
      <motion.div {...fade(0.2)}>
        <div className="flex items-center gap-4 bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-5">
          <div className="w-11 h-11 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0">
            <ShieldCheckIcon className="w-6 h-6 text-green-400" />
          </div>
          <div className="flex-1">
            <p className="text-white font-semibold text-sm">Your account is secure</p>
            <p className="text-slate-400 text-xs mt-0.5">256-bit SSL · JWT auth · Corporate verified</p>
          </div>
          <div className="flex items-center gap-1.5 bg-green-500/20 px-2.5 py-1 rounded-full flex-shrink-0">
            <BuildingOfficeIcon className="w-3.5 h-3.5 text-green-400" />
            <span className="text-xs font-medium text-green-300">Employee</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
