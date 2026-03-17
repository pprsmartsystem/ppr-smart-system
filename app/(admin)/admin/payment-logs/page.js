'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CurrencyDollarIcon, MagnifyingGlassIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { formatCurrency } from '@/utils/cardUtils';

export default function PaymentLogsPage() {
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchPayments();
  }, []);

  useEffect(() => {
    filterPaymentsData();
  }, [payments, searchTerm, filterStatus]);

  const fetchPayments = async () => {
    try {
      const res = await fetch('/api/admin/payment-logs');
      if (res.ok) {
        const data = await res.json();
        setPayments(data.payments || []);
      }
    } catch (error) {
      toast.error('Failed to load payment logs');
    } finally {
      setLoading(false);
    }
  };

  const filterPaymentsData = () => {
    let filtered = [...payments];
    
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.paymentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.orderId?.orderId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(p => p.paymentStatus === filterStatus);
    }
    
    setFilteredPayments(filtered);
  };

  const handleExport = () => {
    const csv = [
      ['Payment ID', 'Order ID', 'Customer', 'Amount', 'Method', 'Status', 'Date'],
      ...filteredPayments.map(p => [
        p.paymentId || 'N/A',
        p.orderId?.orderId || 'N/A',
        p.orderId?.userId?.name || 'N/A',
        p.orderId?.amount || 0,
        p.orderId?.paymentMethod || 'N/A',
        p.paymentStatus || 'N/A',
        new Date(p.createdAt).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payment-logs-${Date.now()}.csv`;
    a.click();
    toast.success('Payment logs exported');
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payment Logs</h1>
          <p className="text-gray-600 mt-2">{filteredPayments.length} payment transactions</p>
        </div>
        <button onClick={handleExport} disabled={filteredPayments.length === 0} className="btn-primary disabled:opacity-50">
          <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
          Export CSV
        </button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by payment ID, order ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
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
        ) : filteredPayments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Payment ID</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Order ID</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Customer</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Amount</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Gateway</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPayments.map((payment) => (
                  <tr key={payment._id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <span className="text-xs font-mono text-indigo-600 font-semibold">{payment.paymentId || 'N/A'}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm font-mono text-gray-900">{payment.orderId?.orderId}</span>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm font-medium text-gray-900">{payment.orderId?.userId?.name}</p>
                      <p className="text-xs text-gray-500">{payment.orderId?.userId?.email}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm font-semibold text-gray-900">{formatCurrency(payment.orderId?.amount || 0)}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 capitalize">
                        {payment.orderId?.paymentMethod || 'N/A'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(payment.paymentStatus)}`}>
                        {payment.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm text-gray-600">{new Date(payment.createdAt).toLocaleDateString()}</p>
                      <p className="text-xs text-gray-500">{new Date(payment.createdAt).toLocaleTimeString()}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <CurrencyDollarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No payment logs found</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
