'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DocumentChartBarIcon, ArrowDownTrayIcon, TrashIcon, PencilIcon, MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { formatCurrency } from '@/utils/cardUtils';
import toast from 'react-hot-toast';

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTransaction, setEditTransaction] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    filterTransactions();
  }, [transactions, searchTerm, filterType, filterStatus]);

  const fetchTransactions = async () => {
    try {
      const res = await fetch('/api/admin/transactions');
      if (res.ok) {
        const data = await res.json();
        setTransactions(data.transactions || []);
        setFilteredTransactions(data.transactions || []);
      }
    } catch (error) {
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const filterTransactions = () => {
    let filtered = [...transactions];

    if (searchTerm) {
      filtered = filtered.filter(t => 
        t.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(t => t.type === filterType);
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(t => t.status === filterStatus);
    }

    setFilteredTransactions(filtered);
    setCurrentPage(1);
  };

  const handleExport = async (format) => {
    try {
      const res = await fetch(`/api/admin/transactions/export?format=${format}`);
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transactions-${Date.now()}.${format}`;
        a.click();
        toast.success(`Exported as ${format.toUpperCase()}`);
      }
    } catch (error) {
      toast.error('Export failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this transaction? This action cannot be undone.')) return;

    try {
      const res = await fetch(`/api/admin/transactions/delete?id=${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        toast.success('Transaction deleted');
        fetchTransactions();
      } else {
        toast.error('Failed to delete transaction');
      }
    } catch (error) {
      toast.error('Failed to delete transaction');
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
        fetchTransactions();
      } else {
        toast.error('Failed to update transaction');
      }
    } catch (error) {
      toast.error('Failed to update transaction');
    }
  };

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">All Transactions</h1>
          <p className="text-gray-600 mt-2">{filteredTransactions.length} transactions found</p>
        </div>
        <button onClick={() => handleExport('csv')} className="btn-primary">
          <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
          Export CSV
        </button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, reference, description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Types</option>
              <option value="credit">Credit</option>
              <option value="debit">Debit</option>
              <option value="voucher">Voucher</option>
              <option value="transfer">Transfer</option>
            </select>
          </div>
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-xl shadow-sm border border-gray-200">
        {loading ? (
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : filteredTransactions.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
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
                  {paginatedTransactions.map((transaction) => (
                    <tr key={transaction._id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4">
                        <p className="text-sm font-medium text-gray-900">{new Date(transaction.createdAt).toLocaleDateString()}</p>
                        <p className="text-xs text-gray-500">{new Date(transaction.createdAt).toLocaleTimeString()}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-xs font-mono text-indigo-600 font-semibold">
                          {transaction.reference || 'N/A'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm font-medium text-gray-900">{transaction.userId?.name || 'N/A'}</p>
                        <p className="text-xs text-gray-500">{transaction.userId?.email}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          transaction.type === 'credit' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        } capitalize`}>
                          {transaction.type}
                        </span>
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
                        } capitalize`}>
                          {transaction.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm text-gray-600 max-w-xs truncate" title={transaction.description}>
                          {transaction.description}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-1 justify-center">
                          <button
                            onClick={() => handleEdit(transaction)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(transaction._id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredTransactions.length)} of {filteredTransactions.length} transactions
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <div className="flex gap-1">
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium ${
                          currentPage === i + 1
                            ? 'bg-indigo-600 text-white'
                            : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <DocumentChartBarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No transactions found</p>
          </div>
        )}
      </motion.div>

      {showEditModal && (
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={editTransaction.type}
                  onChange={(e) => setEditTransaction({...editTransaction, type: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="credit">Credit</option>
                  <option value="debit">Debit</option>
                  <option value="voucher">Voucher</option>
                  <option value="transfer">Transfer</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={editTransaction.status}
                  onChange={(e) => setEditTransaction({...editTransaction, status: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={editTransaction.description}
                  onChange={(e) => setEditTransaction({...editTransaction, description: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  rows="3"
                />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                  Update
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
