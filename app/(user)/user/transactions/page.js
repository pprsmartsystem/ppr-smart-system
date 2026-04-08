'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  ArrowDownLeftIcon,
  ArrowUpRightIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  DocumentChartBarIcon,
  ArrowPathIcon,
  BanknotesIcon,
  CreditCardIcon,
  GiftIcon,
  ArrowsRightLeftIcon,
} from '@heroicons/react/24/outline';

const TYPE_ICON = {
  credit: { icon: ArrowDownLeftIcon, bg: 'bg-green-50', color: 'text-green-600', ring: 'ring-green-100' },
  debit:  { icon: ArrowUpRightIcon,  bg: 'bg-red-50',   color: 'text-red-500',   ring: 'ring-red-100'   },
  voucher:{ icon: GiftIcon,          bg: 'bg-purple-50',color: 'text-purple-600',ring: 'ring-purple-100' },
  transfer:{ icon: ArrowsRightLeftIcon, bg: 'bg-blue-50', color: 'text-blue-600', ring: 'ring-blue-100' },
};

const STATUS_STYLE = {
  completed: 'bg-green-50 text-green-700 ring-1 ring-green-200',
  pending:   'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  failed:    'bg-red-50   text-red-600   ring-1 ring-red-200',
};

function groupByDate(txns) {
  const groups = {};
  txns.forEach(tx => {
    const d = new Date(tx.createdAt);
    const today = new Date();
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
    let label;
    if (d.toDateString() === today.toDateString()) label = 'Today';
    else if (d.toDateString() === yesterday.toDateString()) label = 'Yesterday';
    else label = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    if (!groups[label]) groups[label] = [];
    groups[label].push(tx);
  });
  return groups;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [activeStatus, setActiveStatus] = useState('all');

  useEffect(() => { fetchTransactions(); }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/user/transactions?limit=100');
      if (res.ok) setTransactions((await res.json()).transactions || []);
    } catch { toast.error('Failed to load transactions'); }
    finally { setLoading(false); }
  };

  const totalIn  = useMemo(() => transactions.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0), [transactions]);
  const totalOut = useMemo(() => transactions.filter(t => t.type !== 'credit').reduce((s, t) => s + t.amount, 0), [transactions]);
  const pending  = useMemo(() => transactions.filter(t => t.status === 'pending').length, [transactions]);

  const filtered = useMemo(() => transactions.filter(tx => {
    const matchTab    = activeTab === 'all' || tx.type === activeTab;
    const matchStatus = activeStatus === 'all' || tx.status === activeStatus;
    const matchSearch = !search || tx.description?.toLowerCase().includes(search.toLowerCase()) || tx.reference?.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchStatus && matchSearch;
  }), [transactions, activeTab, activeStatus, search]);

  const grouped = useMemo(() => groupByDate(filtered), [filtered]);

  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-10">

      {/* ── Header ───────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="relative overflow-hidden rounded-3xl p-6 text-white"
          style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #1d4ed8 100%)' }}>
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #818cf8, transparent)' }} />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                <DocumentChartBarIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold">Transactions</h1>
                <p className="text-indigo-300 text-xs">{transactions.length} total records</p>
              </div>
              <button onClick={fetchTransactions} className="ml-auto w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                <ArrowPathIcon className="w-4 h-4 text-white" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Total In',  value: `₹${totalIn.toLocaleString('en-IN',  { minimumFractionDigits: 2 })}`, icon: ArrowDownLeftIcon,  color: 'text-green-300' },
                { label: 'Total Out', value: `₹${totalOut.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, icon: ArrowUpRightIcon,   color: 'text-red-300'   },
                { label: 'Pending',   value: pending,                                                               icon: BanknotesIcon,      color: 'text-amber-300' },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/10">
                  <Icon className={`w-4 h-4 ${color} mb-1.5`} />
                  <p className="text-white font-bold text-sm">{value}</p>
                  <p className="text-indigo-300 text-xs">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Filters ───────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
        <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by description or reference..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition-all"
            />
          </div>

          {/* Type tabs */}
          <div className="flex gap-1 bg-gray-50 rounded-xl p-1">
            {[['all','All'],['credit','In'],['debit','Out'],['voucher','Voucher']].map(([val, label]) => (
              <button key={val} onClick={() => setActiveTab(val)}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${activeTab === val ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                {label}
              </button>
            ))}
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-2">
            <FunnelIcon className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <div className="flex gap-1.5 flex-wrap">
              {[['all','All Status'],['completed','Completed'],['pending','Pending'],['failed','Failed']].map(([val, label]) => (
                <button key={val} onClick={() => setActiveStatus(val)}
                  className={`px-3 py-1 text-xs font-medium rounded-full transition-all ${activeStatus === val ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Transaction List ──────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        {loading ? (
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3 animate-pulse">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 bg-gray-100 rounded w-2/3" />
                  <div className="h-3 bg-gray-100 rounded w-1/3" />
                </div>
                <div className="h-4 bg-gray-100 rounded w-16" />
              </div>
            ))}
          </div>
        ) : Object.keys(grouped).length > 0 ? (
          <div className="space-y-5">
            {Object.entries(grouped).map(([date, txns]) => (
              <div key={date}>
                {/* Date label */}
                <div className="flex items-center gap-3 mb-2 px-1">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{date}</span>
                  <div className="flex-1 h-px bg-gray-100" />
                  <span className="text-xs text-gray-400">{txns.length} txn{txns.length > 1 ? 's' : ''}</span>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden divide-y divide-gray-50">
                  {txns.map((tx) => {
                    const typeKey = TYPE_ICON[tx.type] ? tx.type : (tx.type === 'credit' ? 'credit' : 'debit');
                    const { icon: Icon, bg, color, ring } = TYPE_ICON[typeKey] || TYPE_ICON.debit;
                    const isCredit = tx.type === 'credit';
                    return (
                      <div key={tx._id} className="flex items-center gap-3 p-4 hover:bg-gray-50/80 transition-colors">
                        {/* Icon */}
                        <div className={`w-10 h-10 rounded-xl ${bg} ring-1 ${ring} flex items-center justify-center flex-shrink-0`}>
                          <Icon className={`w-4 h-4 ${color}`} />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">{tx.description}</p>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            {tx.reference && (
                              <span className="text-xs font-mono text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded">
                                {tx.reference}
                              </span>
                            )}
                            <span className="text-xs text-gray-400">
                              {new Date(tx.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLE[tx.status] || STATUS_STYLE.pending}`}>
                              {tx.status}
                            </span>
                          </div>
                        </div>

                        {/* Amount */}
                        <div className="text-right flex-shrink-0">
                          <p className={`text-sm font-bold ${isCredit ? 'text-green-600' : 'text-red-500'}`}>
                            {isCredit ? '+' : '-'}₹{tx.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </p>
                          <p className="text-xs text-gray-400 capitalize mt-0.5">{tx.type}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
              <DocumentChartBarIcon className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium mb-1">No transactions found</p>
            <p className="text-gray-400 text-sm">
              {search || activeTab !== 'all' || activeStatus !== 'all' ? 'Try adjusting your filters' : 'Your transaction history will appear here'}
            </p>
          </div>
        )}
      </motion.div>

    </div>
  );
}
