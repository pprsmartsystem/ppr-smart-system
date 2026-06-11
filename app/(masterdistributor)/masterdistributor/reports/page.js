'use client';

import { useState, useEffect } from 'react';
import {
  DocumentChartBarIcon, BuildingOfficeIcon, UserGroupIcon,
  CreditCardIcon, WalletIcon, ArrowTrendingUpIcon, ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
import { PageHeader } from '@/components/ui/AdminComponents';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

const TABS = ['Overview', 'Distributor Analytics', 'User Analytics', 'Transaction Analytics'];

export default function MasterDistributorReportsPage() {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [activeTab, setActiveTab] = useState('Overview');
  const [selectedDist, setSelectedDist] = useState('all');

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

  const exportCSV = () => {
    if (!reports?.distributorBreakdown?.length) { toast.error('No data to export'); return; }
    const rows = [
      ['Distributor', 'Email', 'Status', 'Users', 'Active Users', 'Cards', 'Transactions', 'Wallet Balance'].join(','),
      ...reports.distributorBreakdown.map(d => [
        d.name, d.email, d.status, d.userCount, d.activeUserCount,
        d.cardCount, d.transactionCount, d.walletBalance?.toFixed(2)
      ].join(','))
    ].join('\n');
    const blob = new Blob([rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `distributor-analytics-${Date.now()}.csv`;
    a.click();
  };

  const breakdown = reports?.distributorBreakdown || [];
  const filtered = selectedDist === 'all' ? breakdown : breakdown.filter(d => d._id === selectedDist);

  if (loading) return (
    <div className="space-y-4 animate-pulse max-w-7xl mx-auto">
      <div className="h-12 bg-gray-200 rounded-2xl w-1/3" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-gray-200 rounded-2xl" />)}
      </div>
      <div className="h-64 bg-gray-200 rounded-2xl" />
    </div>
  );

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      <PageHeader
        icon={DocumentChartBarIcon}
        title="Distributor Analytics"
        subtitle="Deep insights into your distributor network"
        color="from-orange-500 to-amber-500"
        action={
          <button onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white text-sm font-semibold rounded-xl hover:bg-orange-600 transition-colors">
            <ArrowDownTrayIcon className="w-4 h-4" /> Export CSV
          </button>
        }
      />

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-3 items-end">
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
          <div className="flex-1">
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Filter by Distributor</label>
            <select value={selectedDist} onChange={e => setSelectedDist(e.target.value)}
              className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200">
              <option value="all">All Distributors</option>
              {breakdown.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
            </select>
          </div>
          <button onClick={fetchReports}
            className="px-6 py-2.5 bg-orange-500 text-white text-sm font-semibold rounded-xl hover:bg-orange-600 transition-colors">
            Apply
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total Distributors', value: reports?.totalDistributors || 0, icon: BuildingOfficeIcon, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Total Users', value: reports?.totalUsers || 0, icon: UserGroupIcon, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Total Cards', value: reports?.totalCards || 0, icon: CreditCardIcon, color: 'text-violet-600', bg: 'bg-violet-50' },
          { label: 'Total Transactions', value: reports?.totalTransactions || 0, icon: ArrowTrendingUpIcon, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Total Volume', value: `₹${(reports?.totalVolume || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, icon: WalletIcon, color: 'text-green-600', bg: 'bg-green-50' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <p className={`text-xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="flex gap-1 p-2 border-b border-gray-100 overflow-x-auto">
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors ${
                activeTab === tab ? 'bg-orange-500 text-white' : 'text-gray-500 hover:bg-gray-50'
              }`}>{tab}</button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'Overview' && (
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Top Distributors by Users */}
              <div>
                <h3 className="font-bold text-gray-900 mb-3">Top Distributors by Users</h3>
                <div className="space-y-2">
                  {[...breakdown].sort((a, b) => b.userCount - a.userCount).slice(0, 5).map((d, i) => (
                    <div key={d._id} className="flex items-center gap-3">
                      <span className="text-xs font-bold text-gray-400 w-5">#{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-semibold text-gray-900 truncate">{d.name}</p>
                          <p className="text-xs font-bold text-purple-600 ml-2">{d.userCount} users</p>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-purple-500 rounded-full transition-all duration-700"
                            style={{ width: `${breakdown[0]?.userCount ? (d.userCount / breakdown[0].userCount) * 100 : 0}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}
                  {breakdown.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No distributors found</p>}
                </div>
              </div>

              {/* Top Distributors by Volume */}
              <div>
                <h3 className="font-bold text-gray-900 mb-3">Top Distributors by Transaction Volume</h3>
                <div className="space-y-2">
                  {[...breakdown].sort((a, b) => b.transactionVolume - a.transactionVolume).slice(0, 5).map((d, i) => (
                    <div key={d._id} className="flex items-center gap-3">
                      <span className="text-xs font-bold text-gray-400 w-5">#{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-semibold text-gray-900 truncate">{d.name}</p>
                          <p className="text-xs font-bold text-green-600 ml-2">₹{(d.transactionVolume || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500 rounded-full transition-all duration-700"
                            style={{ width: `${breakdown[0]?.transactionVolume ? (d.transactionVolume / Math.max(...breakdown.map(x => x.transactionVolume || 0))) * 100 : 0}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}
                  {breakdown.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No distributors found</p>}
                </div>
              </div>
            </div>

            {/* Bar Chart */}
            {breakdown.length > 0 && (
              <div>
                <h3 className="font-bold text-gray-900 mb-3">Users per Distributor</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={breakdown.map(d => ({ name: d.name.split(' ')[0], users: d.userCount, cards: d.cardCount }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, fontSize: 12 }} />
                    <Bar dataKey="users" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Users" />
                    <Bar dataKey="cards" fill="#10b981" radius={[4, 4, 0, 0]} name="Cards" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {/* Distributor Analytics Tab */}
        {activeTab === 'Distributor Analytics' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  {['Distributor', 'Status', 'Users', 'Active Users', 'Cards', 'Transactions', 'Volume', 'Wallet', 'Joined'].map((h, i) => (
                    <th key={h} className={`py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide ${i >= 6 ? 'text-right' : 'text-left'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.length === 0 ? (
                  <tr><td colSpan={9} className="text-center py-12 text-sm text-gray-400">No data found</td></tr>
                ) : filtered.map((d) => (
                  <tr key={d._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <p className="text-sm font-semibold text-gray-900">{d.name}</p>
                      <p className="text-xs text-gray-400">{d.email}</p>
                    </td>
                    <td className="py-3 px-4">
                      {d.isOnHold
                        ? <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">On Hold</span>
                        : d.status === 'approved'
                        ? <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">Active</span>
                        : <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 capitalize">{d.status}</span>}
                    </td>
                    <td className="py-3 px-4"><p className="text-sm text-gray-700">{d.userCount || 0}</p></td>
                    <td className="py-3 px-4"><p className="text-sm text-green-600 font-semibold">{d.activeUserCount || 0}</p></td>
                    <td className="py-3 px-4"><p className="text-sm text-gray-700">{d.cardCount || 0}</p></td>
                    <td className="py-3 px-4"><p className="text-sm text-gray-700">{d.transactionCount || 0}</p></td>
                    <td className="py-3 px-4 text-right"><p className="text-sm font-semibold text-green-700">₹{(d.transactionVolume || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p></td>
                    <td className="py-3 px-4 text-right"><p className="text-sm font-semibold text-gray-900">₹{(d.walletBalance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p></td>
                    <td className="py-3 px-4"><p className="text-xs text-gray-400">{new Date(d.createdAt).toLocaleDateString('en-IN')}</p></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* User Analytics Tab */}
        {activeTab === 'User Analytics' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  {['User', 'Distributor', 'Status', 'Wallet', 'Cards', 'Transactions', 'KYC', 'Joined'].map((h, i) => (
                    <th key={h} className={`py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide ${i === 3 ? 'text-right' : 'text-left'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {(reports?.userBreakdown || []).filter(u => selectedDist === 'all' || u.distributorId === selectedDist).length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-12 text-sm text-gray-400">No users found</td></tr>
                ) : (reports?.userBreakdown || [])
                    .filter(u => selectedDist === 'all' || u.distributorId === selectedDist)
                    .map((u) => (
                  <tr key={u._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <p className="text-sm font-semibold text-gray-900">{u.name}</p>
                      <p className="text-xs text-gray-400">{u.email}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">{u.distributorName || '—'}</span>
                    </td>
                    <td className="py-3 px-4">
                      {u.status === 'blocked'
                        ? <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">Blocked</span>
                        : u.status === 'approved'
                        ? <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">Active</span>
                        : <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 capitalize">{u.status}</span>}
                    </td>
                    <td className="py-3 px-4 text-right"><p className="text-sm font-semibold text-gray-900">₹{(u.walletBalance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p></td>
                    <td className="py-3 px-4"><p className="text-sm text-gray-700">{u.cardCount || 0}</p></td>
                    <td className="py-3 px-4"><p className="text-sm text-gray-700">{u.transactionCount || 0}</p></td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${u.kycStatus === 'approved' ? 'bg-green-100 text-green-700' : u.kycStatus === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}>
                        {u.kycStatus || 'None'}
                      </span>
                    </td>
                    <td className="py-3 px-4"><p className="text-xs text-gray-400">{new Date(u.createdAt).toLocaleDateString('en-IN')}</p></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Transaction Analytics Tab */}
        {activeTab === 'Transaction Analytics' && (
          <div className="p-5 space-y-5">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Credit', value: `₹${(reports?.totalCredit || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, color: 'text-green-600', bg: 'bg-green-50' },
                { label: 'Total Debit', value: `₹${(reports?.totalDebit || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, color: 'text-red-600', bg: 'bg-red-50' },
                { label: 'Avg per User', value: `₹${(reports?.avgTransactionPerUser || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, color: 'text-blue-600', bg: 'bg-blue-50' },
                { label: 'Active Users (txn)', value: reports?.activeTransactingUsers || 0, color: 'text-purple-600', bg: 'bg-purple-50' },
              ].map(({ label, value, color, bg }) => (
                <div key={label} className={`${bg} rounded-xl p-4`}>
                  <p className="text-xs text-gray-500 mb-1">{label}</p>
                  <p className={`text-lg font-bold ${color}`}>{value}</p>
                </div>
              ))}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    {['Distributor', 'Total Txns', 'Credit', 'Debit', 'Net Volume'].map((h, i) => (
                      <th key={h} className={`py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide ${i > 0 ? 'text-right' : 'text-left'}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((d) => (
                    <tr key={d._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-4">
                        <p className="text-sm font-semibold text-gray-900">{d.name}</p>
                        <p className="text-xs text-gray-400">{d.userCount} users</p>
                      </td>
                      <td className="py-3 px-4 text-right"><p className="text-sm text-gray-700">{d.transactionCount || 0}</p></td>
                      <td className="py-3 px-4 text-right"><p className="text-sm font-semibold text-green-600">₹{(d.creditVolume || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p></td>
                      <td className="py-3 px-4 text-right"><p className="text-sm font-semibold text-red-600">₹{(d.debitVolume || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p></td>
                      <td className="py-3 px-4 text-right"><p className="text-sm font-bold text-gray-900">₹{(d.transactionVolume || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p></td>
                    </tr>
                  ))}
                  {filtered.length === 0 && <tr><td colSpan={5} className="text-center py-12 text-sm text-gray-400">No data found</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
