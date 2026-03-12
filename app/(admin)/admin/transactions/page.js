'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DocumentChartBarIcon, ArrowDownTrayIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline';
import { formatCurrency } from '@/utils/cardUtils';
import toast from 'react-hot-toast';

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTransaction, setEditTransaction] = useState(null);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const res = await fetch('/api/admin/transactions');
      if (res.ok) {
        const data = await res.json();
        setTransactions(data.transactions || []);
      }
    } catch (error) {
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
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

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">All Transactions</h1>
          <p className="text-gray-600 mt-2">View and export transaction history</p>
        </div>
        <button onClick={() => handleExport('csv')} className="btn-primary">
          <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
          Export CSV
        </button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="stats-card">
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">Date</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">User</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">Type</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">Amount</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">Status</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">Description</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4 text-sm text-gray-600">
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-medium text-gray-900">{transaction.userId?.name || 'N/A'}</p>
                      <p className="text-xs text-gray-500">{transaction.userId?.email}</p>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        transaction.type === 'credit' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      } capitalize`}>
                        {transaction.type}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`font-semibold ${transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                        transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      } capitalize`}>
                        {transaction.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">{transaction.description}</td>
                    <td className="py-4 px-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(transaction)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(transaction._id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
        ) : (
          <div className="text-center py-12">
            <DocumentChartBarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No transactions found</p>
          </div>
        )}
      </motion.div>

      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
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
          </div>
        </div>
      )}
    </div>
  );
}
