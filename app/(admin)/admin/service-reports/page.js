'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ClipboardDocumentListIcon, ArrowDownTrayIcon, CalendarIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { formatCurrency } from '@/utils/cardUtils';

export default function ServiceReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    topService: '',
  });

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const res = await fetch(`/api/admin/service-reports?${params}`);
      if (res.ok) {
        const data = await res.json();
        setReports(data.reports || []);
        setStats(data.stats || { totalOrders: 0, totalRevenue: 0, topService: '' });
      }
    } catch (error) {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const csv = [
      ['Service Name', 'Total Orders', 'Total Revenue', 'Avg Order Value'],
      ...reports.map(r => [
        r.serviceName,
        r.totalOrders,
        r.totalRevenue,
        r.avgOrderValue
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `service-report-${Date.now()}.csv`;
    a.click();
    toast.success('Report exported');
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Service Reports</h1>
          <p className="text-gray-600 mt-2">Sales analytics and service performance</p>
        </div>
        <button onClick={handleExport} disabled={reports.length === 0} className="btn-primary disabled:opacity-50">
          <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
          Export CSV
        </button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex items-end">
            <button onClick={fetchReports} className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              Apply Filters
            </button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <p className="text-sm opacity-90">Total Orders</p>
          <h2 className="text-3xl font-bold mt-2">{stats.totalOrders}</h2>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
          <p className="text-sm opacity-90">Total Revenue</p>
          <h2 className="text-3xl font-bold mt-2">{formatCurrency(stats.totalRevenue)}</h2>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <p className="text-sm opacity-90">Top Service</p>
          <h2 className="text-xl font-bold mt-2">{stats.topService || 'N/A'}</h2>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bg-white rounded-xl shadow-sm border border-gray-200">
        {loading ? (
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : reports.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Service Name</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Total Orders</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Total Revenue</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Avg Order Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reports.map((report, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <p className="text-sm font-medium text-gray-900">{report.serviceName}</p>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-sm font-semibold text-blue-600">{report.totalOrders}</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-sm font-semibold text-green-600">{formatCurrency(report.totalRevenue)}</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-sm font-semibold text-purple-600">{formatCurrency(report.avgOrderValue)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <ClipboardDocumentListIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No data available</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
