'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  UserGroupIcon, BuildingOfficeIcon, CreditCardIcon, DocumentChartBarIcon,
  CurrencyDollarIcon, ArrowTrendingUpIcon, ShieldCheckIcon, BellIcon,
  ArrowUpRightIcon, ArrowDownLeftIcon, ChevronRightIcon, SparklesIcon,
  WalletIcon, ClockIcon, CheckCircleIcon, ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area,
} from 'recharts';

const COLORS = ['#6366f1', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b'];

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.35, ease: 'easeOut' },
});

const QUICK_LINKS = [
  { label: 'Users',        href: '/admin/users',        icon: UserGroupIcon,       color: 'from-blue-500 to-cyan-500' },
  { label: 'KYC',          href: '/admin/kyc',           icon: ShieldCheckIcon,     color: 'from-emerald-500 to-green-600' },
  { label: 'Settlement',   href: '/admin/settlement',    icon: CurrencyDollarIcon,  color: 'from-violet-500 to-purple-600' },
  { label: 'Transactions', href: '/admin/transactions',  icon: DocumentChartBarIcon,color: 'from-orange-500 to-amber-500' },
  { label: 'Cards',        href: '/admin/cards',         icon: CreditCardIcon,      color: 'from-pink-500 to-rose-500' },
  { label: 'Analytics',    href: '/admin/analytics',     icon: ArrowTrendingUpIcon, color: 'from-indigo-500 to-blue-600' },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [now] = useState(new Date());

  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          setStats(data.stats);
          setChartData(data.chartData || []);
          setPieData(data.pieData || []);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const greeting = now.getHours() < 12 ? 'Good Morning' : now.getHours() < 17 ? 'Good Afternoon' : 'Good Evening';

  const statCards = useMemo(() => !stats ? [] : [
    { label: 'Total Users',       value: stats.totalUsers?.toLocaleString(),       icon: UserGroupIcon,        color: 'bg-blue-50',   iconColor: 'text-blue-600',   trend: '+12%', up: true },
    { label: 'Corporates',        value: stats.totalCorporates?.toLocaleString(),  icon: BuildingOfficeIcon,   color: 'bg-violet-50', iconColor: 'text-violet-600', trend: '+8%',  up: true },
    { label: 'Active Cards',      value: stats.totalCards?.toLocaleString(),       icon: CreditCardIcon,       color: 'bg-emerald-50',iconColor: 'text-emerald-600',trend: '+15%', up: true },
    { label: 'Transactions',      value: stats.totalTransactions?.toLocaleString(),icon: DocumentChartBarIcon, color: 'bg-amber-50',  iconColor: 'text-amber-600',  trend: '+22%', up: true },
    { label: 'Revenue',           value: `₹${stats.totalRevenue?.toLocaleString('en-IN')}`, icon: CurrencyDollarIcon, color: 'bg-green-50', iconColor: 'text-green-600', trend: '+18%', up: true },
    { label: 'Monthly Growth',    value: `${stats.monthlyGrowth}%`,               icon: ArrowTrendingUpIcon,  color: 'bg-pink-50',   iconColor: 'text-pink-600',   trend: '+5%',  up: true },
  ], [stats]);

  if (loading) return (
    <div className="space-y-6 animate-pulse">
      <div className="h-44 bg-gray-200 rounded-3xl" />
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => <div key={i} className="h-28 bg-gray-200 rounded-2xl" />)}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 pb-8 max-w-7xl mx-auto">

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
                <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
                <p className="text-indigo-300 text-sm mt-1">
                  {now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/20">
                <ShieldCheckIcon className="w-3.5 h-3.5 text-green-300" />
                <span className="text-xs font-medium text-green-200">Secured</span>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Users',        value: stats?.totalUsers?.toLocaleString(),        icon: UserGroupIcon,        color: 'text-blue-300' },
                { label: 'Cards',        value: stats?.totalCards?.toLocaleString(),        icon: CreditCardIcon,       color: 'text-purple-300' },
                { label: 'Transactions', value: stats?.totalTransactions?.toLocaleString(), icon: DocumentChartBarIcon, color: 'text-amber-300' },
                { label: 'Revenue',      value: `₹${stats?.totalRevenue?.toLocaleString('en-IN') || 0}`, icon: CurrencyDollarIcon, color: 'text-green-300' },
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

      {/* ── Stat Cards ───────────────────────────────────────── */}
      <motion.div {...fade(0.08)}>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {statCards.map(({ label, value, icon: Icon, color, iconColor, trend, up }) => (
            <div key={label} className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-md transition-shadow">
              <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center mb-3`}>
                <Icon className={`w-4 h-4 ${iconColor}`} />
              </div>
              <p className="text-lg font-bold text-gray-900 leading-tight">{value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{label}</p>
              <p className={`text-xs font-semibold mt-1 ${up ? 'text-green-600' : 'text-red-500'}`}>{trend}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Quick Links ───────────────────────────────────────── */}
      <motion.div {...fade(0.12)}>
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="font-bold text-gray-900 mb-4">Quick Access</h3>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {QUICK_LINKS.map(({ label, href, icon: Icon, color }) => (
              <Link key={href} href={href}
                className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs font-semibold text-gray-600 text-center">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── Charts ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Area chart */}
        <motion.div {...fade(0.16)} className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-bold text-gray-900">Monthly Transactions</h3>
                <p className="text-xs text-gray-400 mt-0.5">Last 6 months activity</p>
              </div>
              <span className="text-xs font-semibold text-green-600 bg-green-50 px-2.5 py-1 rounded-full">↑ 22%</span>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="txGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, fontSize: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
                <Area type="monotone" dataKey="transactions" stroke="#6366f1" strokeWidth={2.5} fill="url(#txGrad)" dot={false} activeDot={{ r: 5, fill: '#6366f1' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Pie chart */}
        <motion.div {...fade(0.2)}>
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="mb-5">
              <h3 className="font-bold text-gray-900">User Distribution</h3>
              <p className="text-xs text-gray-400 mt-0.5">By role</p>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70}
                  dataKey="value" paddingAngle={3}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-2">
              {pieData.map((item, i) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="text-xs text-gray-600">{item.name}</span>
                  </div>
                  <span className="text-xs font-bold text-gray-800">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Recent Activity + Pending Actions ────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent activity */}
        <motion.div {...fade(0.24)}>
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Recent Activity</h3>
              <Link href="/admin/audit-logs" className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700">
                View All <ChevronRightIcon className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="space-y-1">
              {[
                { action: 'New user registered',      detail: 'user@example.com',   time: '2m ago',  type: 'user',    icon: UserGroupIcon,        color: 'bg-blue-50 text-blue-600' },
                { action: 'Corporate account created', detail: 'TechCorp Inc.',      time: '15m ago', type: 'corp',    icon: BuildingOfficeIcon,   color: 'bg-violet-50 text-violet-600' },
                { action: 'Virtual card issued',       detail: 'jane@example.com',   time: '1h ago',  type: 'card',    icon: CreditCardIcon,       color: 'bg-emerald-50 text-emerald-600' },
                { action: 'Settlement processed',      detail: '₹25,000 credited',   time: '2h ago',  type: 'settle',  icon: CurrencyDollarIcon,   color: 'bg-amber-50 text-amber-600' },
                { action: 'KYC approved',              detail: 'mike@example.com',   time: '3h ago',  type: 'kyc',     icon: ShieldCheckIcon,      color: 'bg-green-50 text-green-600' },
              ].map((a, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${a.color}`}>
                    <a.icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{a.action}</p>
                    <p className="text-xs text-gray-400 truncate">{a.detail}</p>
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0">{a.time}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Pending actions */}
        <motion.div {...fade(0.28)}>
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Pending Actions</h3>
              <span className="text-xs font-bold text-white bg-red-500 px-2 py-0.5 rounded-full">Needs Attention</span>
            </div>
            <div className="space-y-3">
              {[
                { label: 'KYC Verifications',    href: '/admin/kyc',        icon: ShieldCheckIcon,    color: 'bg-amber-50 text-amber-600',   badge: 'amber' },
                { label: 'Settlement Requests',  href: '/admin/settlement', icon: CurrencyDollarIcon, color: 'bg-blue-50 text-blue-600',     badge: 'blue' },
                { label: 'Support Tickets',      href: '/admin/support',    icon: BellIcon,           color: 'bg-red-50 text-red-500',       badge: 'red' },
                { label: 'Payment Requests',     href: '/admin/wallet',     icon: WalletIcon,         color: 'bg-violet-50 text-violet-600', badge: 'violet' },
              ].map(({ label, href, icon: Icon, color }) => (
                <Link key={href} href={href}
                  className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition-all group">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="flex-1 text-sm font-semibold text-gray-700">{label}</span>
                  <ChevronRightIcon className="w-4 h-4 text-gray-300 group-hover:text-indigo-400 transition-colors" />
                </Link>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Security Footer ───────────────────────────────────── */}
      <motion.div {...fade(0.32)}>
        <div className="flex items-center gap-4 bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-5">
          <div className="w-11 h-11 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0">
            <ShieldCheckIcon className="w-6 h-6 text-green-400" />
          </div>
          <div className="flex-1">
            <p className="text-white font-semibold text-sm">Admin panel is secure</p>
            <p className="text-slate-400 text-xs mt-0.5">256-bit SSL · JWT auth · Role-based access control · Audit logging enabled</p>
          </div>
          <Link href="/admin/audit-logs" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex-shrink-0">
            Audit Logs
          </Link>
        </div>
      </motion.div>

    </div>
  );
}
