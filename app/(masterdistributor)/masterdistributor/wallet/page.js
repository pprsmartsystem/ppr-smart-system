'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { WalletIcon, ArrowUpRightIcon, ArrowDownLeftIcon } from '@heroicons/react/24/outline';
import { PageHeader } from '@/components/ui/AdminComponents';

export default function MasterDistributorWalletPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/masterdistributor/wallet')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="space-y-4 animate-pulse">
      <div className="h-32 bg-gray-200 rounded-2xl" />
      <div className="h-64 bg-gray-200 rounded-2xl" />
    </div>
  );

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      <PageHeader icon={WalletIcon} title="My Wallet" subtitle="View your wallet balance and transaction history" color="from-emerald-500 to-green-600" />

      {/* Balance Card */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="relative overflow-hidden rounded-3xl p-7 text-white"
          style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 45%, #4c1d95 100%)' }}>
          <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #a78bfa, transparent)' }} />
          <p className="text-purple-200 text-xs uppercase tracking-widest mb-1">Available Balance</p>
          <p className="text-4xl font-bold">₹{(data?.walletBalance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
          <p className="text-purple-300 text-sm mt-2">Master Distributor Wallet</p>
        </div>
      </motion.div>

      {/* Transaction History */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">Transaction History</h3>
        </div>
        <div className="divide-y divide-gray-50">
          {(data?.transactions || []).length === 0 ? (
            <div className="text-center py-12 text-sm text-gray-400">No transactions yet</div>
          ) : (
            (data?.transactions || []).map((txn) => (
              <div key={txn._id} className="flex items-center gap-4 p-4 hover:bg-gray-50/50 transition-colors">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${txn.type === 'credit' ? 'bg-green-50' : 'bg-red-50'}`}>
                  {txn.type === 'credit'
                    ? <ArrowDownLeftIcon className="w-5 h-5 text-green-600" />
                    : <ArrowUpRightIcon className="w-5 h-5 text-red-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{txn.description}</p>
                  <p className="text-xs text-gray-400">{new Date(txn.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
                <p className={`text-sm font-bold flex-shrink-0 ${txn.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                  {txn.type === 'credit' ? '+' : '-'}₹{txn.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
