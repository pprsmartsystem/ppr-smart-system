'use client';

import { useState, useEffect } from 'react';
import { DocumentChartBarIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { formatCurrency } from '@/utils/cardUtils';
import toast from 'react-hot-toast';

export default function DistributorReportsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const res = await fetch('/api/distributor/reports');
      if (res.ok) {
        const data = await res.json();
        setTransactions(data.transactions || []);
      }
    } catch (error) {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const csv = [
      ['Date', 'Reference', 'User', 'Type', 'Amount', 'Status', 'Description'],
      ...transactions.map(t => [
        new Date(t.createdAt).toLocaleDateString(),
        t.reference || 'N/A',
        t.userId?.name || 'N/A',
        t.type,
        t.amount,
        t.status,
        t.description
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `distributor-report-${Date.now()}.csv`;
    a.click();
    toast.success('Report exported');
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Reports</h1>
          <p className="text-gray-600 mt-2">View transactions of your users</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <ArrowDownTrayIcon className="h-5 w-5" />
          Export CSV
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <tr key={transaction._id}>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(transaction.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-mono text-indigo-600 font-semibold">
                      {transaction.reference || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{transaction.userId?.name || 'N/A'}</p>
                    <p className="text-xs text-gray-500">{transaction.userId?.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      transaction.type === 'credit' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    } capitalize`}>
                      {transaction.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`font-semibold ${transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                      transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    } capitalize`}>
                      {transaction.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{transaction.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
