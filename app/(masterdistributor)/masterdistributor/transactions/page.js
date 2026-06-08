'use client';

import { useState, useEffect } from 'react';
import { DocumentChartBarIcon, ArrowUpRightIcon, ArrowDownLeftIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { PageHeader } from '@/components/ui/AdminComponents';
import toast from 'react-hot-toast';

export default function MasterDistributorTransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetch('/api/masterdistributor/wallet')
      .then(r => r.json())
      .then(d => { setTransactions(d.transactions || []); setLoading(false); })
      .catch(() => { toast.error('Failed to load transactions'); setLoading(false); });
  }, []);

  const filtered = transactions.filter(t => {
    const matchFilter = filter === 'all' || t.type === filter;
    const matchSearch = !search ||
      t.reference?.toLowerCase().includes(search.toLowerCase()) ||
      t.description?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const totalCredit = transactions.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0);
  const totalDebit  = transactions.filter(t => t.type === 'debit').reduce((s, t) => s + t.amount, 0);

  if (loading) return (
    <div className="space-y-4 animate-pulse">
      <div className="h-12 bg-gray-200 rounded-2xl w-1/3" />
      <div className="h-64 bg-gray-200 rounded-2xl" />
    </div>
  );

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      <PageHeader icon={DocumentChartBarIcon} title="Transactions" subtitle="Complete wallet transaction history" color="from-blue-500 to-indigo-600" />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Transactions', value: transactions.length, color: 'text-gray-900', bg: 'bg-gray-50' },
          { label: 'Total Credited', value: `₹${totalCredit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Total Debited', value: `₹${totalDebit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, color: 'text-red-600', bg: 'bg-red-50' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl border border-gray-100 p-4`}>
            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search by UTR number or description..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200" />
        </div>
        <div className="flex gap-2">
          {['all', 'credit', 'debit'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-colors ${
                filter === f ? 'bg-indigo-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}>{f}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-900">Transaction History</h3>
          <span className="text-xs text-gray-400">{filtered.length} records</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                {['Type', 'Description', 'UTR / Reference', 'Amount', 'Balance After', 'Date & Time'].map((h, i) => (
                  <th key={h} className={`py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide ${i === 3 || i === 4 ? 'text-right' : 'text-left'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-sm text-gray-400">No transactions found</td></tr>
              ) : (
                filtered.map((txn) => (
                  <tr key={txn._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${txn.type === 'credit' ? 'bg-green-50' : 'bg-red-50'}`}>
                        {txn.type === 'credit'
                          ? <ArrowDownLeftIcon className="w-4 h-4 text-green-600" />
                          : <ArrowUpRightIcon className="w-4 h-4 text-red-600" />}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm font-semibold text-gray-900">{txn.description}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${txn.type === 'credit' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {txn.type}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {txn.reference ? (
                        <p className="text-xs font-mono text-indigo-600 font-semibold">{txn.reference}</p>
                      ) : (
                        <p className="text-xs text-gray-400">—</p>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <p className={`text-sm font-bold ${txn.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                        {txn.type === 'credit' ? '+' : '-'}₹{txn.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </p>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <p className="text-sm font-semibold text-gray-700">
                        {txn.balanceAfter != null ? `₹${txn.balanceAfter?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—'}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-xs text-gray-700 font-medium">
                        {new Date(txn.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(txn.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                      </p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
