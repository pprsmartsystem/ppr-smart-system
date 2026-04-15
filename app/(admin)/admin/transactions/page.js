'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowDownTrayIcon, TrashIcon, PencilIcon, MagnifyingGlassIcon,
  DocumentChartBarIcon, ArrowUpRightIcon, ArrowDownLeftIcon,
  ArrowPathIcon, FunnelIcon, XMarkIcon, CheckCircleIcon,
  GiftIcon, ArrowsRightLeftIcon, BanknotesIcon,
} from '@heroicons/react/24/outline';
import { formatCurrency } from '@/utils/cardUtils';
import toast from 'react-hot-toast';
import { PageHeader, StatusBadge, AdminModal } from '@/components/ui/AdminComponents';

const TYPE_CONFIG = {
  credit:          { icon: ArrowDownLeftIcon,   bg: 'bg-green-50',   color: 'text-green-600',  label: 'Credit',          sign: '+', amtColor: 'text-green-600' },
  debit:           { icon: ArrowUpRightIcon,    bg: 'bg-red-50',     color: 'text-red-500',    label: 'Debit',           sign: '-', amtColor: 'text-red-500' },
  voucher:         { icon: GiftIcon,            bg: 'bg-purple-50',  color: 'text-purple-600', label: 'Voucher',         sign: '-', amtColor: 'text-purple-600' },
  transfer:        { icon: ArrowsRightLeftIcon, bg: 'bg-blue-50',    color: 'text-blue-600',   label: 'Transfer',        sign: '',  amtColor: 'text-blue-600' },
  payment_request: { icon: BanknotesIcon,       bg: 'bg-amber-50',   color: 'text-amber-600',  label: 'Payment Request', sign: '+', amtColor: 'text-amber-600' },
};

function timeAgo(date) {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [globalStats, setGlobalStats] = useState({ credit: 0, debit: 0, net: 0, count: 0 });
  const [filters, setFilters] = useState({ search: '', type: 'all', status: 'all', startDate: '', endDate: '' });
  const [selectedIds, setSelectedIds] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [editTx, setEditTx] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const observerTarget = useRef(null);
  const LIMIT = 50;

  const fetchTransactions = useCallback(async (pageNum, reset = false) => {
    if (loading && !reset) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pageNum, limit: LIMIT,
        ...(filters.type !== 'all' && { type: filters.type }),
        ...(filters.status !== 'all' && { status: filters.status }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
      });
      const res = await fetch(`/api/admin/transactions?${params}`);
      if (res.ok) {
        const data = await res.json();
        const txs = data.transactions || [];
        setTransactions(prev => reset ? txs : [...prev, ...txs]);
        setTotal(data.total || 0);
        setHasMore(txs.length === LIMIT);
        if (reset) {
          const cr = txs.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0);
          const db = txs.filter(t => t.type !== 'credit').reduce((s, t) => s + t.amount, 0);
          setGlobalStats({ credit: cr, debit: db, net: cr - db, count: data.total });
        }
      }
    } catch { toast.error('Failed to load transactions'); }
    finally { setLoading(false); }
  }, [filters, loading]);

  useEffect(() => {
    setTransactions([]); setPage(1); setHasMore(true); setSelectedIds([]);
    fetchTransactions(1, true);
  }, [filters]);

  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !loading) setPage(p => p + 1);
    }, { threshold: 0.5 });
    if (observerTarget.current) obs.observe(observerTarget.current);
    return () => obs.disconnect();
  }, [hasMore, loading]);

  useEffect(() => { if (page > 1) fetchTransactions(page, false); }, [page]);

  const filtered = useMemo(() => transactions.filter(t =>
    !filters.search ||
    t.userId?.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
    t.userId?.email?.toLowerCase().includes(filters.search.toLowerCase()) ||
    t.reference?.toLowerCase().includes(filters.search.toLowerCase()) ||
    t.description?.toLowerCase().includes(filters.search.toLowerCase())
  ), [transactions, filters.search]);

  const handleExport = async () => {
    try {
      const params = new URLSearchParams({
        format: 'csv',
        ...(filters.type !== 'all' && { type: filters.type }),
        ...(filters.status !== 'all' && { status: filters.status }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
      });
      const res = await fetch(`/api/admin/transactions/export?${params}`);
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `transactions-${Date.now()}.csv`;
        document.body.appendChild(a); a.click();
        document.body.removeChild(a); URL.revokeObjectURL(url);
        toast.success('Exported successfully');
      }
    } catch { toast.error('Export failed'); }
  };

  const executeDelete = async (ids) => {
    setConfirmDelete(null);
    try {
      const res = await fetch('/api/admin/transactions/delete', {
        method: 'DELETE', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      });
      if (res.ok) {
        toast.success(`${ids.length} transaction(s) deleted`);
        setSelectedIds([]);
        setTransactions([]); setPage(1);
        fetchTransactions(1, true);
      }
    } catch { toast.error('Failed to delete'); }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/transactions/update', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editTx),
      });
      if (res.ok) {
        toast.success('Transaction updated');
        setEditTx(null);
        setTransactions([]); setPage(1);
        fetchTransactions(1, true);
      }
    } catch { toast.error('Failed to update'); }
  };

  const activeFiltersCount = [
    filters.type !== 'all', filters.status !== 'all',
    filters.startDate, filters.endDate,
  ].filter(Boolean).length;

  const allSelected = filtered.length > 0 && selectedIds.length === filtered.length;

  return (
    <div className="space-y-5">

      {/* Header */}
      <PageHeader
        icon={DocumentChartBarIcon}
        title="Transactions"
        subtitle={`${total.toLocaleString('en-IN')} total records`}
        color="from-blue-500 to-cyan-500"
        action={
          <div className="flex items-center gap-2">
            {selectedIds.length > 0 && (
              <button onClick={() => setConfirmDelete({ ids: selectedIds, label: `${selectedIds.length} transaction(s)` })}
                className="flex items-center gap-1.5 px-3 py-2 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700">
                <TrashIcon className="w-4 h-4" /> Delete ({selectedIds.length})
              </button>
            )}
            <button onClick={handleExport}
              className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700">
              <ArrowDownTrayIcon className="w-4 h-4" /> Export CSV
            </button>
            <button onClick={() => { setTransactions([]); setPage(1); fetchTransactions(1, true); }}
              className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
              <ArrowPathIcon className={`w-4 h-4 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        }
      />

      {/* Stats Hero */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total Records',  value: total.toLocaleString('en-IN'),                                                    icon: DocumentChartBarIcon, bg: 'from-slate-900 to-slate-800', text: 'text-white',       sub: 'text-slate-400' },
          { label: 'Total Credit',   value: formatCurrency(globalStats.credit),                                               icon: ArrowDownLeftIcon,    bg: 'from-green-600 to-emerald-600', text: 'text-white',     sub: 'text-green-200' },
          { label: 'Total Debit',    value: formatCurrency(globalStats.debit),                                                icon: ArrowUpRightIcon,     bg: 'from-red-500 to-rose-600',      text: 'text-white',     sub: 'text-red-200' },
          { label: 'Net Balance',    value: formatCurrency(Math.abs(globalStats.net)),                                        icon: BanknotesIcon,        bg: globalStats.net >= 0 ? 'from-blue-600 to-indigo-600' : 'from-orange-500 to-amber-600', text: 'text-white', sub: 'text-blue-200' },
        ].map(({ label, value, icon: Icon, bg, text, sub }) => (
          <div key={label} className={`bg-gradient-to-br ${bg} rounded-2xl p-5`}>
            <div className="flex items-center justify-between mb-3">
              <span className={`text-xs font-semibold uppercase tracking-wide ${sub}`}>{label}</span>
              <Icon className={`w-4 h-4 ${sub}`} />
            </div>
            <p className={`text-xl font-bold ${text} leading-tight`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Search + Filter bar */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, reference, description..."
              value={filters.search}
              onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300"
            />
          </div>
          <button
            onClick={() => setShowFilters(f => !f)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all ${showFilters || activeFiltersCount > 0 ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
          >
            <FunnelIcon className="w-4 h-4" />
            Filters {activeFiltersCount > 0 && <span className="bg-white/30 text-white text-xs px-1.5 py-0.5 rounded-full">{activeFiltersCount}</span>}
          </button>
        </div>

        {showFilters && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-3 pt-1">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Type</label>
                <select value={filters.type} onChange={e => setFilters(f => ({ ...f, type: e.target.value }))} className="input-field text-sm">
                  <option value="all">All Types</option>
                  <option value="credit">Credit</option>
                  <option value="debit">Debit</option>
                  <option value="voucher">Voucher</option>
                  <option value="transfer">Transfer</option>
                  <option value="payment_request">Payment Request</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                <select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))} className="input-field text-sm">
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Start Date</label>
                <input type="date" value={filters.startDate} onChange={e => setFilters(f => ({ ...f, startDate: e.target.value }))} className="input-field text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">End Date</label>
                <input type="date" value={filters.endDate} onChange={e => setFilters(f => ({ ...f, endDate: e.target.value }))} className="input-field text-sm" />
              </div>
            </div>
            {activeFiltersCount > 0 && (
              <button onClick={() => setFilters({ search: '', type: 'all', status: 'all', startDate: '', endDate: '' })}
                className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 font-medium">
                <XMarkIcon className="w-3.5 h-3.5" /> Clear all filters
              </button>
            )}
          </motion.div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="py-3 px-4 w-10">
                  <input type="checkbox" checked={allSelected}
                    onChange={e => setSelectedIds(e.target.checked ? filtered.map(t => t._id) : [])}
                    className="w-4 h-4 rounded text-indigo-600" />
                </th>
                {['Date', 'User', 'Reference', 'Type', 'Amount', 'Status', 'Description', ''].map((h, i) => (
                  <th key={i} className={`py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide ${i === 7 ? 'text-center w-10' : 'text-left'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((tx) => {
                const cfg = TYPE_CONFIG[tx.type] || TYPE_CONFIG.debit;
                const Icon = cfg.icon;
                const isSelected = selectedIds.includes(tx._id);
                return (
                  <tr key={tx._id}
                    className={`hover:bg-gray-50/50 transition-colors ${isSelected ? 'bg-indigo-50/30' : ''}`}>
                    <td className="py-3 px-4">
                      <input type="checkbox" checked={isSelected}
                        onChange={e => setSelectedIds(e.target.checked ? [...selectedIds, tx._id] : selectedIds.filter(id => id !== tx._id))}
                        className="w-4 h-4 rounded text-indigo-600" />
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <p className="text-xs font-semibold text-gray-900">{new Date(tx.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                      <p className="text-xs text-gray-400">{timeAgo(tx.createdAt)}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-xs font-semibold text-gray-900 truncate max-w-[100px]">{tx.userId?.name || '—'}</p>
                      <p className="text-xs text-gray-400 truncate max-w-[100px]">{tx.userId?.email}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs font-mono text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-lg">
                        {tx.reference ? tx.reference.slice(0, 16) + (tx.reference.length > 16 ? '…' : '') : '—'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold ${cfg.bg} ${cfg.color}`}>
                        <Icon className="w-3 h-3" />
                        {cfg.label}
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`text-sm font-bold ${cfg.amtColor}`}>
                        {cfg.sign}{formatCurrency(tx.amount)}
                      </span>
                    </td>
                    <td className="py-3 px-4"><StatusBadge status={tx.status} /></td>
                    <td className="py-3 px-4 max-w-[160px]">
                      <p className="text-xs text-gray-500 truncate" title={tx.description}>{tx.description}</p>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button onClick={() => setEditTx({ id: tx._id, amount: tx.amount, description: tx.description, status: tx.status, type: tx.type })}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <PencilIcon className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Loading / End states */}
        {loading && (
          <div className="flex items-center justify-center gap-3 py-8 text-gray-400">
            <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">Loading transactions...</span>
          </div>
        )}
        {!loading && hasMore && <div ref={observerTarget} className="h-8" />}
        {!loading && !hasMore && filtered.length > 0 && (
          <div className="flex items-center justify-center gap-2 py-6 text-xs text-gray-400">
            <CheckCircleIcon className="w-4 h-4 text-green-400" />
            All {filtered.length.toLocaleString('en-IN')} transactions loaded
          </div>
        )}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-16">
            <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-3">
              <DocumentChartBarIcon className="w-7 h-7 text-gray-300" />
            </div>
            <p className="text-sm text-gray-400 font-medium">No transactions found</p>
            <p className="text-xs text-gray-300 mt-1">Try adjusting your filters</p>
          </div>
        )}
      </div>

      {/* Confirm Delete Modal */}
      {confirmDelete && (
        <AdminModal title="Confirm Delete" subtitle={`Delete ${confirmDelete.label}? This cannot be undone.`} onClose={() => setConfirmDelete(null)}>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setConfirmDelete(null)} className="flex-1 btn-secondary">Cancel</button>
            <button onClick={() => executeDelete(confirmDelete.ids)} className="flex-1 py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700">Delete</button>
          </div>
        </AdminModal>
      )}

      {/* Edit Modal */}
      {editTx && (
        <AdminModal title="Edit Transaction" subtitle={`ID: ${editTx.id}`} onClose={() => setEditTx(null)}>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Amount (₹)</label>
              <input type="number" value={editTx.amount} onChange={e => setEditTx(t => ({ ...t, amount: parseFloat(e.target.value) }))} className="input-field" required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Type</label>
                <select value={editTx.type} onChange={e => setEditTx(t => ({ ...t, type: e.target.value }))} className="input-field text-sm">
                  <option value="credit">Credit</option>
                  <option value="debit">Debit</option>
                  <option value="voucher">Voucher</option>
                  <option value="transfer">Transfer</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Status</label>
                <select value={editTx.status} onChange={e => setEditTx(t => ({ ...t, status: e.target.value }))} className="input-field text-sm">
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Description</label>
              <textarea value={editTx.description} onChange={e => setEditTx(t => ({ ...t, description: e.target.value }))} className="input-field resize-none text-sm" rows={3} />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="flex-1 btn-primary">Update</button>
              <button type="button" onClick={() => setEditTx(null)} className="flex-1 btn-secondary">Cancel</button>
            </div>
          </form>
        </AdminModal>
      )}
    </div>
  );
}
