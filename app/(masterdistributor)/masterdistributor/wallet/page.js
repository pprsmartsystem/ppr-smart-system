'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { WalletIcon, ArrowUpRightIcon, ArrowDownLeftIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { PageHeader } from '@/components/ui/AdminComponents';

export default function MasterDistributorWalletPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetch('/api/masterdistributor/wallet')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const txns = (data?.transactions || []).filter(t => {
    const matchFilter = filter === 'all' || t.type === filter;
    const matchSearch = !search ||
      t.reference?.toLowerCase().includes(search.toLowerCase()) ||
      t.description?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const totalCredit = (data?.transactions || []).filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0);
  const totalDebit  = (data?.transactions || []).filter(t => t.type === 'debit').reduce((s, t) => s + t.amount, 0);

  if (loading) return (
    <div className="space-y-4 animate-pulse">
      <div className="h-32 bg-gray-200 rounded-2xl" />
      <div className="h-64 bg-gray-200 rounded-2xl" />
    </div>
  );

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      <PageHeader icon={WalletIcon} title="My Wallet" subtitle="Balance & transaction history" color="from-emerald-500 to-green-600" />

      {/* Balance Card */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="relative overflow-hidden rounded-3xl p-7 text-white"
          style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 45%, #4c1d95 100%)' }}>
          <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #a78bfa, transparent)' }} />
          <div className="relative z-10">
            <p className="text-purple-200 text-xs uppercase tracking-widest mb-1">Available Balance</p>
            <p className="text-4xl font-bold mb-4">₹{(data?.walletBalance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/10 rounded-xl p-3">
                <p className="text-green-300 text-xs mb-1">Total Credited</p>
                <p className="text-white font-bold">₹{totalCredit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
              </div>
              <div className="bg-white/10 rounded-xl p-3">
                <p className="text-red-300 text-xs mb-1">Total Debited</p>
                <p className="text-white font-bold">₹{totalDebit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filters & Search */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search by UTR or description..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-200" />
        </div>
        <div className="flex gap-2">
          {['all', 'credit', 'debit'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-colors ${
                filter === f ? 'bg-emerald-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}>{f}</button>
          ))}
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-900">Transaction History</h3>
          <span className="text-xs text-gray-400">{txns.length} transactions</span>
        </div>
        <div className="divide-y divide-gray-50">
          {txns.length === 0 ? (
            <div className="text-center py-12 text-sm text-gray-400">No transactions found</div>
          ) : (
            txns.map((txn) => (
              <div key={txn._id} className="p-4 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${txn.type === 'credit' ? 'bg-green-50' : 'bg-red-50'}`}>
                    {txn.type === 'credit'
                      ? <ArrowDownLeftIcon className="w-5 h-5 text-green-600" />
                      : <ArrowUpRightIcon className="w-5 h-5 text-red-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-gray-900">{txn.description}</p>
                      <p className={`text-sm font-bold flex-shrink-0 ${txn.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                        {txn.type === 'credit' ? '+' : '-'}₹{txn.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    {txn.reference && (
                      <p className="text-xs font-mono text-indigo-600 mt-0.5">UTR: {txn.reference}</p>
                    )}
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <p className="text-xs text-gray-400">
                        {new Date(txn.createdAt).toLocaleString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric',
                          hour: '2-digit', minute: '2-digit', hour12: true,
                        })}
                      </p>
                      {txn.balanceAfter !== undefined && txn.balanceAfter !== null && (
                        <p className="text-xs text-gray-400">Balance: ₹{txn.balanceAfter?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                      )}
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        txn.type === 'credit' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                      }`}>{txn.type}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
