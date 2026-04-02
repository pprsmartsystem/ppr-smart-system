'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowDownTrayIcon, TrashIcon, PencilIcon, MagnifyingGlassIcon, 
  FunnelIcon, CalendarIcon, UserIcon, CheckIcon 
} from '@heroicons/react/24/outline';
import { formatCurrency } from '@/utils/cardUtils';
import toast from 'react-hot-toast';

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    search: '',
    type: 'all',
    status: 'all',
    startDate: '',
    endDate: ''
  });
  const [stats, setStats] = useState({ totalCredit: 0, totalDebit: 0, count: 0 });
  const [selectedIds, setSelectedIds] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTransaction, setEditTransaction] = useState(null);
  const observerTarget = useRef(null);
  const limit = 50;

  useEffect(() => {
    setTransactions([]);
    setPage(1);
    setHasMore(true);
    fetchTransactions(1, true);
  }, [filters]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage(p => p + 1);
        }
      },
      { threshold: 1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading]);

  useEffect(() => {
    if (page > 1) {
      fetchTransactions(page, false);
    }
  }, [page]);

  const fetchTransactions = async (pageNum, reset = false) => {
    if (loading) return;
    setLoading(true);

    try {
      const params = new URLSearchParams({
        page: pageNum,
        limit,
        ...(filters.type !== 'all' && { type: filters.type }),
        ...(filters.status !== 'all' && { status: filters.status }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate })
      });

      const res = await fetch(`/api/admin/transactions?${params}`);
      if (res.ok) {
        const data = await res.json();
        
        if (reset) {
          setTransactions(data.transactions || []);
        } else {
          setTransactions(prev => [...prev, ...(data.transactions || [])]);
        }
        
        setTotal(data.total || 0);
        setHasMore(data.transactions.length === limit);
        
        // Calculate stats
        const credit = data.transactions.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0);
        const debit = data.transactions.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0);
        setStats({ totalCredit: credit, totalDebit: debit, count: data.total });
      }
    } catch (error) {
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams({
        format: 'csv',
        ...(filters.type !== 'all' && { type: filters.type }),
        ...(filters.status !== 'all' && { status: filters.status }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate })
      });

      const res = await fetch(`/api/admin/transactions/export?${params}`);
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transactions-${Date.now()}.csv`;
        a.click();
        toast.success('Exported successfully');
      }
    } catch (error) {
      toast.error('Export failed');
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedIds.length) return;
    if (!confirm(`Delete ${selectedIds.length} transaction(s)?`)) return;

    try {
      const res = await fetch('/api/admin/transactions/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds })
      });

      if (res.ok) {
        toast.success(`${selectedIds.length} transactions deleted`);
        setSelectedIds([]);
        setTransactions([]);
        setPage(1);
        fetchTransactions(1, true);
      }
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const handleEdit = (transaction) => {
    setEditTransaction({
      id: transaction._id,
      amount: transaction.amount,
      description: transaction.description,
      status: transaction.status,
      type: transaction.type
    });
    setShowEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/transactions/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editTransaction)
      });

      if (res.ok) {
        toast.success('Transaction updated');
        setShowEditModal(false);
        setTransactions([]);
        setPage(1);
        fetchTransactions(1, true);
      }
    } catch (error) {
      toast.error('Failed to update');
    }
  };

  const filteredTransactions = transactions.filter(t =>
    !filters.search || 
    t.userId?.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
    t.userId?.email?.toLowerCase().includes(filters.search.toLowerCase()) ||
    t.reference?.toLowerCase().includes(filters.search.toLowerCase()) ||
    t.description?.toLowerCase().includes(filters.search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-600 mt-2">{total.toLocaleString()} total transactions</p>
        </div>
        <div className="flex gap-2">
          {selectedIds.length > 0 && (
            <button onClick={handleBulkDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2">
              <TrashIcon className="w-4 h-4" />
              Delete ({selectedIds.length})
            </button>
          )}
          <button onClick={handleExport} className="btn-primary flex items-center gap-2">
            <ArrowDownTrayIcon className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="stats-card bg-gradient-to-br from-green-50 to-green-100">
          <p className="text-sm text-green-600 font-medium">Total Credit</p>
          <p className="text-3xl font-bold text-green-900">{formatCurrency(stats.totalCredit)}</p>
        </div>
        <div className="stats-card bg-gradient-to-br from-red-50 to-red-100">
          <p className="text-sm text-red-600 font-medium">Total Debit</p>
          <p className="text-3xl font-bold text-red-900">{formatCurrency(stats.totalDebit)}</p>
        </div>
        <div className="stats-card bg-gradient-to-br from-blue-50 to-blue-100">
          <p className="text-sm text-blue-600 font-medium">Net Balance</p>
          <p className="text-3xl font-bold text-blue-900">{formatCurrency(stats.totalCredit - stats.totalDebit)}</p>
        </div>
      </div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="stats-card">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-2 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, reference..."
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
              className="w-full pl-10 input-field"
            />
          </div>
          <select value={filters.type} onChange={(e) => setFilters({...filters, type: e.target.value})} className="input-field">
            <option value="all">All Types</option>
            <option value="credit">Credit</option>
            <option value="debit">Debit</option>
            <option value="voucher">Voucher</option>
            <option value="transfer">Transfer</option>
          </select>
          <select value={filters.status} onChange={(e) => setFilters({...filters, status: e.target.value})} className="input-field">
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
          <button onClick={() => setFilters({...filters, startDate: '', endDate: ''})} className="btn-secondary">
            Clear Dates
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input type="date" value={filters.startDate} onChange={(e) => setFilters({...filters, startDate: e.target.value})} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input type="date" value={filters.endDate} onChange={(e) => setFilters({...filters, endDate: e.target.value})} className="input-field" />
          </div>
        </div>
      </motion.div>

      {/* Transactions Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="stats-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === filteredTransactions.length && filteredTransactions.length > 0}
                    onChange={(e) => setSelectedIds(e.target.checked ? filteredTransactions.map(t => t._id) : [])}
                    className="w-4 h-4"
                  />
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Date & Time</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Reference</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">User</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Type</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Amount</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Description</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTransactions.map((transaction) => (
                <tr key={transaction._id} className="hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(transaction._id)}
                      onChange={(e) => setSelectedIds(e.target.checked 
                        ? [...selectedIds, transaction._id] 
                        : selectedIds.filter(id => id !== transaction._id)
                      )}
                      className="w-4 h-4"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-sm font-medium text-gray-900">{new Date(transaction.createdAt).toLocaleDateString()}</p>
                    <p className="text-xs text-gray-500">{new Date(transaction.createdAt).toLocaleTimeString()}</p>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-xs font-mono text-indigo-600 font-semibold">{transaction.reference || 'N/A'}</span>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-sm font-medium text-gray-900">{transaction.userId?.name || 'N/A'}</p>
                    <p className="text-xs text-gray-500">{transaction.userId?.email}</p>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      transaction.type === 'credit' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    } capitalize`}>{transaction.type}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`text-sm font-semibold ${
                      transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                      transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    } capitalize`}>{transaction.status}</span>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-sm text-gray-600 max-w-xs truncate" title={transaction.description}>{transaction.description}</p>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1 justify-center">
                      <button onClick={() => handleEdit(transaction)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg" title="Edit">
                        <PencilIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">Loading more...</p>
          </div>
        )}

        {!loading && hasMore && <div ref={observerTarget} className="h-10" />}

        {!loading && !hasMore && filteredTransactions.length > 0 && (
          <div className="text-center py-8 text-gray-500 text-sm">
            All {filteredTransactions.length} transactions loaded
          </div>
        )}

        {!loading && filteredTransactions.length === 0 && (
          <div className="text-center py-12 text-gray-500">No transactions found</div>
        )}
      </motion.div>

      {/* Edit Modal */}
      {showEditModal && editTransaction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-xl p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Edit Transaction</h2>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  value={editTransaction.amount}
                  onChange={(e) => setEditTransaction({...editTransaction, amount: parseFloat(e.target.value)})}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select value={editTransaction.type} onChange={(e) => setEditTransaction({...editTransaction, type: e.target.value})} className="input-field">
                  <option value="credit">Credit</option>
                  <option value="debit">Debit</option>
                  <option value="voucher">Voucher</option>
                  <option value="transfer">Transfer</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select value={editTransaction.status} onChange={(e) => setEditTransaction({...editTransaction, status: e.target.value})} className="input-field">
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={editTransaction.description} onChange={(e) => setEditTransaction({...editTransaction, description: e.target.value})} className="input-field" rows="3" />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="flex-1 btn-primary">Update</button>
                <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 btn-secondary">Cancel</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
