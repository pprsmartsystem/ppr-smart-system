'use client';

import { useState, useEffect } from 'react';
import { ChartBarIcon, ArrowDownTrayIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { formatCurrency } from '@/utils/cardUtils';
import toast from 'react-hot-toast';
import { PageHeader } from '@/components/ui/AdminComponents';

export default function AnalyticsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (filterType !== 'all') params.append('type', filterType);

      const res = await fetch(`/api/admin/reports?${params}`);
      if (res.ok) {
        const data = await res.json();
        setReports(data.reports || []);
      }
    } catch (error) {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const csv = [
      ['User Name', 'Email', 'Total Redeem Amount', 'Settlement Initiated Amount', 'Pending Settlement'],
      ...reports.map(r => [
        r.userName,
        r.userEmail,
        r.totalRedeem,
        r.settlementInitiated,
        r.pendingSettlement
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `redeem-settlement-report-${Date.now()}.csv`;
    a.click();
    toast.success('Report exported');
  };

  const totalRedeem = reports.reduce((sum, r) => sum + r.totalRedeem, 0);
  const totalSettlement = reports.reduce((sum, r) => sum + r.settlementInitiated, 0);
  const totalPending = reports.reduce((sum, r) => sum + r.pendingSettlement, 0);

  return (
    <div className="space-y-5">
      <PageHeader icon={ChartBarIcon} title="Analytics & Reports" subtitle="Date-wise Redeem & Settlement Reports" color="from-indigo-500 to-blue-600"
        action={<button onClick={handleExport} disabled={reports.length === 0} className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50"><ArrowDownTrayIcon className="w-4 h-4" />Export CSV</button>}
      />

      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div><label className="block text-xs font-medium text-gray-500 mb-1.5">Start Date</label><input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="input-field text-sm" /></div>
          <div><label className="block text-xs font-medium text-gray-500 mb-1.5">End Date</label><input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="input-field text-sm" /></div>
          <div><label className="block text-xs font-medium text-gray-500 mb-1.5">Filter Type</label><select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="input-field text-sm"><option value="all">All Users</option><option value="user">Regular Users</option><option value="distributor">Distributors</option></select></div>
          <div className="flex items-end"><button onClick={fetchReports} className="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700">Apply Filters</button></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-5 text-white"><p className="text-xs opacity-80 uppercase tracking-wide">Total Redeem</p><p className="text-2xl font-bold mt-1">{formatCurrency(totalRedeem)}</p></div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-5 text-white"><p className="text-xs opacity-80 uppercase tracking-wide">Settlement Initiated</p><p className="text-2xl font-bold mt-1">{formatCurrency(totalSettlement)}</p></div>
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl p-5 text-white"><p className="text-xs opacity-80 uppercase tracking-wide">Pending Settlement</p><p className="text-2xl font-bold mt-1">{formatCurrency(totalPending)}</p></div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-5 space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />)}</div>
        ) : reports.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-gray-100 bg-gray-50/50">{['User Name','Email','Role','Total Redeem','Settlement Initiated','Pending Settlement'].map((h,i) => <th key={h} className={`py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide ${i>=3?'text-right':'text-left'}`}>{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-gray-50">
                {reports.map((r, i) => (
                  <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4 text-sm font-semibold text-gray-900">{r.userName}</td>
                    <td className="py-3 px-4 text-sm text-gray-500">{r.userEmail}</td>
                    <td className="py-3 px-4"><span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 capitalize">{r.userRole}</span></td>
                    <td className="py-3 px-4 text-right text-sm font-semibold text-blue-600">{formatCurrency(r.totalRedeem)}</td>
                    <td className="py-3 px-4 text-right text-sm font-semibold text-green-600">{formatCurrency(r.settlementInitiated)}</td>
                    <td className="py-3 px-4 text-right text-sm font-semibold text-amber-600">{formatCurrency(r.pendingSettlement)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t-2 border-gray-200 bg-gray-50/50">
                <tr>
                  <td colSpan="3" className="py-3 px-4 text-xs font-bold text-gray-700 uppercase">TOTAL</td>
                  <td className="py-3 px-4 text-right text-sm font-bold text-blue-600">{formatCurrency(totalRedeem)}</td>
                  <td className="py-3 px-4 text-right text-sm font-bold text-green-600">{formatCurrency(totalSettlement)}</td>
                  <td className="py-3 px-4 text-right text-sm font-bold text-amber-600">{formatCurrency(totalPending)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-3"><ChartBarIcon className="w-7 h-7 text-gray-300" /></div>
            <p className="text-sm font-medium text-gray-500">No Data Available</p>
            <p className="text-xs text-gray-400 mt-1">Select date range and apply filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
