'use client';

import { useState, useEffect } from 'react';
import { DocumentChartBarIcon } from '@heroicons/react/24/outline';
import { PageHeader } from '@/components/ui/AdminComponents';
import toast from 'react-hot-toast';

export default function MasterDistributorReportsPage() {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (fromDate) params.append('from', fromDate);
      if (toDate) params.append('to', toDate);
      const res = await fetch(`/api/masterdistributor/reports?${params}`);
      if (res.ok) setReports(await res.json());
    } catch { toast.error('Failed to fetch reports'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchReports(); }, []);

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      <PageHeader icon={DocumentChartBarIcon} title="Reports" subtitle="View distributor and user activity reports" color="from-orange-500 to-amber-500" />

      {/* Date Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">From Date</label>
            <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)}
              className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200" />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">To Date</label>
            <input type="date" value={toDate} onChange={e => setToDate(e.target.value)}
              className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200" />
          </div>
          <div className="flex items-end">
            <button onClick={fetchReports}
              className="px-6 py-2.5 bg-orange-500 text-white text-sm font-semibold rounded-xl hover:bg-orange-600 transition-colors">
              Apply
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-gray-200 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Distributors', value: reports?.totalDistributors || 0, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Total Users', value: reports?.totalUsers || 0, color: 'text-purple-600', bg: 'bg-purple-50' },
            { label: 'Total Transactions', value: reports?.totalTransactions || 0, color: 'text-orange-600', bg: 'bg-orange-50' },
            { label: 'Total Volume', value: `₹${(reports?.totalVolume || 0).toLocaleString('en-IN')}`, color: 'text-green-600', bg: 'bg-green-50' },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
                <DocumentChartBarIcon className={`w-5 h-5 ${color}`} />
              </div>
              <p className={`text-xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Distributor-wise breakdown */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">Distributor-wise Breakdown</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                {['Distributor', 'Users', 'Cards', 'Transactions', 'Wallet Balance'].map((h, i) => (
                  <th key={h} className={`py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide ${i === 4 ? 'text-right' : 'text-left'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(reports?.distributorBreakdown || []).map((dist) => (
                <tr key={dist._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 px-4">
                    <p className="text-sm font-semibold text-gray-900">{dist.name}</p>
                    <p className="text-xs text-gray-400">{dist.email}</p>
                  </td>
                  <td className="py-3 px-4"><p className="text-sm text-gray-700">{dist.userCount || 0}</p></td>
                  <td className="py-3 px-4"><p className="text-sm text-gray-700">{dist.cardCount || 0}</p></td>
                  <td className="py-3 px-4"><p className="text-sm text-gray-700">{dist.transactionCount || 0}</p></td>
                  <td className="py-3 px-4 text-right"><p className="text-sm font-semibold text-gray-900">₹{(dist.walletBalance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p></td>
                </tr>
              ))}
            </tbody>
          </table>
          {(reports?.distributorBreakdown || []).length === 0 && (
            <div className="text-center py-12 text-sm text-gray-400">No data available</div>
          )}
        </div>
      </div>
    </div>
  );
}
