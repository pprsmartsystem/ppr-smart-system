'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  MagnifyingGlassIcon, PlusCircleIcon, MinusCircleIcon,
  BuildingOfficeIcon, NoSymbolIcon, CheckIcon, TrashIcon, PlusIcon,
  EyeIcon, EyeSlashIcon, XMarkIcon, UserGroupIcon, CreditCardIcon,
  WalletIcon, BanknotesIcon, ShieldCheckIcon, ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';
import { PageHeader, StatusBadge, AdminModal, ActionBtn } from '@/components/ui/AdminComponents';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function MasterDistributorDistributorsPage() {
  const [distributors, setDistributors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Create modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });

  // Balance modal
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [selectedDistributor, setSelectedDistributor] = useState(null);
  const [balanceAmount, setBalanceAmount] = useState('');
  const [balanceType, setBalanceType] = useState('add');
  const [deductRemark, setDeductRemark] = useState('');

  // Stats modal
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [statsData, setStatsData] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsDistId, setStatsDistId] = useState(null);
  const [statsFrom, setStatsFrom] = useState('');
  const [statsTo, setStatsTo] = useState('');

  useEffect(() => { fetchDistributors(); }, []);

  const handleViewStats = async (dist) => {
    setStatsData(null);
    setStatsDistId(dist._id);
    setStatsFrom('');
    setStatsTo('');
    setShowStatsModal(true);
    fetchStats(dist._id, '', '');
  };

  const fetchStats = async (distId, from, to) => {
    setStatsLoading(true);
    try {
      const params = new URLSearchParams({ distributorId: distId });
      if (from) params.append('from', from);
      if (to) params.append('to', to);
      const res = await fetch(`/api/masterdistributor/distributors/stats?${params}`);
      if (res.ok) setStatsData(await res.json());
      else toast.error('Failed to load stats');
    } catch { toast.error('Error loading stats'); }
    finally { setStatsLoading(false); }
  };

  const fetchDistributors = async () => {
    try {
      const res = await fetch('/api/masterdistributor/distributors');
      if (res.ok) setDistributors((await res.json()).distributors || []);
    } catch { toast.error('Failed to fetch distributors'); }
    finally { setLoading(false); }
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$';
    let p = '';
    for (let i = 0; i < 12; i++) p += chars.charAt(Math.floor(Math.random() * chars.length));
    setForm(f => ({ ...f, password: p }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/masterdistributor/distributors/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Distributor created successfully!');
        setShowCreateModal(false);
        setForm({ name: '', email: '', password: '', phone: '' });
        fetchDistributors();
      } else {
        toast.error(data.error || 'Failed to create');
      }
    } catch { toast.error('Error creating distributor'); }
  };

  const handleBalance = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/masterdistributor/distributors/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          distributorId: selectedDistributor._id,
          amount: parseFloat(balanceAmount),
          type: balanceType,
          remark: deductRemark,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        setShowBalanceModal(false);
        setBalanceAmount('');
        setDeductRemark('');
        setSelectedDistributor(null);
        fetchDistributors();
      } else {
        toast.error(data.error || 'Failed');
      }
    } catch { toast.error('Error updating balance'); }
  };

  const handleHoldToggle = async (distributorId, currentHoldStatus) => {
    const action = currentHoldStatus ? 'unhold' : 'hold';
    const reason = !currentHoldStatus ? prompt('Enter reason for holding (optional):') : null;
    if (!currentHoldStatus && reason === null) return;
    try {
      const res = await fetch('/api/masterdistributor/distributors/hold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ distributorId, action, reason }),
      });
      if (res.ok) {
        toast.success(`Distributor ${action === 'hold' ? 'held' : 'unheld'}`);
        fetchDistributors();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed');
      }
    } catch { toast.error('Error updating hold status'); }
  };

  const handleDelete = async (distributorId) => {
    if (!confirm('Delete this distributor and all associated data?')) return;
    try {
      const res = await fetch('/api/masterdistributor/distributors/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ distributorId }),
      });
      if (res.ok) {
        toast.success('Distributor deleted');
        fetchDistributors();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to delete');
      }
    } catch { toast.error('Failed to delete'); }
  };

  const filtered = distributors.filter(d =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="space-y-4 animate-pulse">
      <div className="h-12 bg-gray-200 rounded-2xl w-1/3" />
      <div className="h-64 bg-gray-200 rounded-2xl" />
    </div>
  );

  return (
    <div className="space-y-5">
      <PageHeader
        icon={BuildingOfficeIcon}
        title="Distributor Management"
        subtitle="Manage distributors under your account"
        color="from-blue-500 to-cyan-500"
        action={
          <button onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
            <PlusIcon className="h-4 w-4" /> Create Distributor
          </button>
        }
      />

      {/* Search */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <div className="relative">
          <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search distributors..." value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                {['Name', 'Email', 'Wallet', 'Status', 'Joined', 'Actions'].map((h, i) => (
                  <th key={h} className={`py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide ${i === 5 ? 'text-right' : 'text-left'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((dist) => (
                <tr key={dist._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 px-4"><p className="text-sm font-semibold text-gray-900">{dist.name}</p></td>
                  <td className="py-3 px-4"><p className="text-sm text-gray-500">{dist.email}</p></td>
                  <td className="py-3 px-4">
                    <p className={`text-sm font-semibold ${dist.walletBalance < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                      ₹{Math.abs(dist.walletBalance?.toFixed(2) || 0)}
                      {dist.walletBalance < 0 && <span className="ml-1 text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full">Debt</span>}
                    </p>
                  </td>
                  <td className="py-3 px-4">
                    {dist.isOnHold
                      ? <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">On Hold</span>
                      : <StatusBadge status={dist.status} />}
                  </td>
                  <td className="py-3 px-4"><p className="text-xs text-gray-400">{new Date(dist.createdAt).toLocaleDateString('en-IN')}</p></td>
                  <td className="py-3 px-4">
                    <div className="flex justify-end gap-1">
                      <ActionBtn icon={EyeIcon} onClick={() => handleViewStats(dist)} color="text-indigo-600 hover:bg-indigo-50" title="View Statistics" />
                      <ActionBtn icon={PlusCircleIcon} onClick={() => { setSelectedDistributor(dist); setBalanceType('add'); setShowBalanceModal(true); }} color="text-blue-600 hover:bg-blue-50" title="Add Balance" />
                      <ActionBtn icon={MinusCircleIcon} onClick={() => { setSelectedDistributor(dist); setBalanceType('deduct'); setShowBalanceModal(true); }} color="text-red-500 hover:bg-red-50" title="Deduct Balance" />
                      <ActionBtn icon={dist.isOnHold ? CheckIcon : NoSymbolIcon} onClick={() => handleHoldToggle(dist._id, dist.isOnHold)} color={dist.isOnHold ? 'text-green-600 hover:bg-green-50' : 'text-orange-600 hover:bg-orange-50'} title={dist.isOnHold ? 'Unhold' : 'Hold'} />
                      <ActionBtn icon={TrashIcon} onClick={() => handleDelete(dist._id)} color="text-red-600 hover:bg-red-50" title="Delete" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <div className="text-center py-12 text-sm text-gray-400">No distributors found</div>}
      </div>

      {/* Stats Modal */}
      {showStatsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white z-10">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{statsData?.distributor?.name || 'Distributor'} — Statistics</h2>
                <p className="text-sm text-gray-400 mt-0.5">
                  {statsData?.distributor?.email}
                  {statsData?.dateRange && (
                    <span className="ml-2 px-2 py-0.5 bg-indigo-50 text-indigo-600 text-xs font-semibold rounded-full">
                      {statsData.dateRange.from} → {statsData.dateRange.to || 'Today'}
                    </span>
                  )}
                </p>
              </div>
              <button onClick={() => { setShowStatsModal(false); setStatsData(null); }}
                className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                <XMarkIcon className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Date Filter */}
            <div className="px-5 pt-4 pb-2 flex flex-col sm:flex-row gap-3 items-end border-b border-gray-100">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-500 mb-1">From Date</label>
                <input type="date" value={statsFrom} onChange={e => setStatsFrom(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200" />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-500 mb-1">To Date</label>
                <input type="date" value={statsTo} onChange={e => setStatsTo(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200" />
              </div>
              <div className="flex gap-2">
                <button onClick={() => fetchStats(statsDistId, statsFrom, statsTo)}
                  className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors">
                  Apply
                </button>
                <button onClick={() => { setStatsFrom(''); setStatsTo(''); fetchStats(statsDistId, '', ''); }}
                  className="px-4 py-2 bg-gray-100 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-200 transition-colors">
                  Reset
                </button>
              </div>
            </div>

            <div className="p-5 space-y-5">
              {statsLoading ? (
                <div className="space-y-4 animate-pulse">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-gray-200 rounded-xl" />)}
                  </div>
                  <div className="h-40 bg-gray-200 rounded-xl" />
                </div>
              ) : statsData && (
                <>
                  {/* Distributor Info */}
                  <div className="flex items-center gap-4 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                    <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
                      <BuildingOfficeIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900">{statsData.distributor.name}</p>
                      <p className="text-sm text-gray-500">{statsData.distributor.email} · {statsData.distributor.phone || 'No phone'}</p>
                      <p className="text-xs text-gray-400 mt-0.5">Joined: {new Date(statsData.distributor.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400 mb-0.5">Wallet</p>
                      <p className="text-xl font-bold text-blue-700">₹{statsData.distributor.walletBalance?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                    </div>
                  </div>

                  {/* Summary Stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: 'Total Users', value: statsData.users.total, sub: `${statsData.users.active} active`, icon: UserGroupIcon, color: 'bg-purple-50 text-purple-700' },
                      { label: 'Total Cards', value: statsData.cards.total, sub: `${statsData.cards.active} active`, icon: CreditCardIcon, color: 'bg-violet-50 text-violet-700' },
                      { label: 'Transactions', value: statsData.transactions.total, sub: `₹${statsData.transactions.totalDebit?.toLocaleString('en-IN', { maximumFractionDigits: 0 })} vol`, icon: ArrowTrendingUpIcon, color: 'bg-orange-50 text-orange-700' },
                      { label: 'Settled', value: `₹${statsData.settlements.totalSettled?.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, sub: `${statsData.settlements.processed} processed`, icon: BanknotesIcon, color: 'bg-green-50 text-green-700' },
                    ].map(({ label, value, sub, icon: Icon, color }) => (
                      <div key={label} className="bg-white border border-gray-100 rounded-xl p-4">
                        <div className={`w-9 h-9 rounded-lg ${color.split(' ')[0]} flex items-center justify-center mb-2`}>
                          <Icon className={`w-4 h-4 ${color.split(' ')[1]}`} />
                        </div>
                        <p className={`text-lg font-bold ${color.split(' ')[1]}`}>{value}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                        <p className="text-xs text-gray-400">{sub}</p>
                      </div>
                    ))}
                  </div>

                  {/* Redemption Summary */}
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl p-4">
                    <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-lg bg-indigo-600 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">R</span>
                      </span>
                      Redemption Summary
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white rounded-xl p-3 border border-indigo-100">
                        <p className="text-xs text-gray-400 mb-1">Total Redemptions</p>
                        <p className="text-2xl font-bold text-indigo-700">{statsData.redemptions?.total || 0}</p>
                      </div>
                      <div className="bg-white rounded-xl p-3 border border-indigo-100">
                        <p className="text-xs text-gray-400 mb-1">Total Spend Amount</p>
                        <p className="text-2xl font-bold text-purple-700">₹{(statsData.redemptions?.totalSpendAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                      </div>
                    </div>
                  </div>

                  {/* 2-col grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* User Breakdown */}
                    <div className="bg-white border border-gray-100 rounded-xl p-4">
                      <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><UserGroupIcon className="w-4 h-4 text-purple-500" /> User Breakdown</h3>
                      <div className="space-y-2">
                        {[
                          { label: 'Active', value: statsData.users.active, color: 'bg-green-500', total: statsData.users.total },
                          { label: 'Pending', value: statsData.users.pending, color: 'bg-yellow-500', total: statsData.users.total },
                          { label: 'Blocked', value: statsData.users.blocked, color: 'bg-red-500', total: statsData.users.total },
                        ].map(({ label, value, color, total }) => (
                          <div key={label}>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-gray-500">{label}</span>
                              <span className="font-semibold text-gray-700">{value}</span>
                            </div>
                            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div className={`h-full ${color} rounded-full`} style={{ width: `${total ? (value / total) * 100 : 0}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 gap-2 text-xs">
                        <div><p className="text-gray-400">KYC Approved</p><p className="font-bold text-green-600">{statsData.kyc.approved}</p></div>
                        <div><p className="text-gray-400">KYC Pending</p><p className="font-bold text-yellow-600">{statsData.kyc.pending}</p></div>
                      </div>
                    </div>

                    {/* Card & Settlement Breakdown */}
                    <div className="bg-white border border-gray-100 rounded-xl p-4">
                      <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><CreditCardIcon className="w-4 h-4 text-violet-500" /> Cards & Settlements</h3>
                      <div className="space-y-2">
                        {[
                          { label: 'Active Cards', value: statsData.cards.active, color: 'bg-green-500', total: statsData.cards.total },
                          { label: 'Frozen Cards', value: statsData.cards.frozen, color: 'bg-blue-500', total: statsData.cards.total },
                        ].map(({ label, value, color, total }) => (
                          <div key={label}>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-gray-500">{label}</span>
                              <span className="font-semibold text-gray-700">{value}</span>
                            </div>
                            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div className={`h-full ${color} rounded-full`} style={{ width: `${total ? (value / total) * 100 : 0}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-100 space-y-1.5 text-xs">
                        <div className="flex justify-between"><span className="text-gray-400">Total Card Balance</span><span className="font-bold text-violet-600">₹{statsData.cards.totalBalance?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>
                        <div className="flex justify-between"><span className="text-gray-400">Pending Settlements</span><span className="font-bold text-yellow-600">{statsData.settlements.pending}</span></div>
                        <div className="flex justify-between"><span className="text-gray-400">Total Settled</span><span className="font-bold text-green-600">₹{statsData.settlements.totalSettled?.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span></div>
                      </div>
                    </div>
                  </div>

                  {/* Monthly Chart */}
                  {statsData.monthlyChart?.length > 0 && (
                    <div className="bg-white border border-gray-100 rounded-xl p-4">
                      <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><ArrowTrendingUpIcon className="w-4 h-4 text-orange-500" /> Monthly Transaction Volume</h3>
                      <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={statsData.monthlyChart} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                          <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                          <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 11 }} />
                          <Bar dataKey="credit" fill="#10b981" radius={[3, 3, 0, 0]} name="Credit" />
                          <Bar dataKey="debit" fill="#f59e0b" radius={[3, 3, 0, 0]} name="Debit" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {/* Top Users */}
                  {statsData.topUsers?.length > 0 && (
                    <div className="bg-white border border-gray-100 rounded-xl p-4">
                      <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><WalletIcon className="w-4 h-4 text-blue-500" /> Top Users by Wallet Balance</h3>
                      <div className="space-y-2">
                        {statsData.topUsers.map((u, i) => (
                          <div key={u._id} className="flex items-center gap-3">
                            <span className="text-xs font-bold text-gray-400 w-5">#{i + 1}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate">{u.name}</p>
                              <p className="text-xs text-gray-400 truncate">{u.email}</p>
                            </div>
                            <p className="text-sm font-bold text-blue-700 flex-shrink-0">₹{(u.walletBalance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recent Transactions */}
                  {statsData.transactions.recent?.length > 0 && (
                    <div className="bg-white border border-gray-100 rounded-xl p-4">
                      <h3 className="font-bold text-gray-900 mb-3">Recent Transactions</h3>
                      <div className="space-y-2">
                        {statsData.transactions.recent.map((t, i) => (
                          <div key={i} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                            <div className="flex items-center gap-2">
                              <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${t.type === 'credit' ? 'bg-green-50' : 'bg-red-50'}`}>
                                <span className={`text-xs font-bold ${t.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>{t.type === 'credit' ? '+' : '-'}</span>
                              </div>
                              <p className="text-xs text-gray-600 capitalize">{t.type}</p>
                            </div>
                            <p className={`text-xs font-bold ${t.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                              {t.type === 'credit' ? '+' : '-'}₹{t.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </p>
                            <p className="text-xs text-gray-400">{new Date(t.createdAt).toLocaleDateString('en-IN')}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <AdminModal title="Create Distributor" subtitle="New distributor under your account" onClose={() => { setShowCreateModal(false); setForm({ name: '', email: '', password: '', phone: '' }); }}>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
              <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone (optional)</label>
              <input type="text" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} className="input-field pr-20" required minLength={6} />
                <button type="button" onClick={() => setShowPassword(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPassword ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                </button>
              </div>
              <button type="button" onClick={generatePassword} className="mt-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium">Generate Password</button>
            </div>
            <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 text-xs text-amber-800">
              Save this password before closing. It cannot be retrieved later.
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => { setShowCreateModal(false); setForm({ name: '', email: '', password: '', phone: '' }); }} className="flex-1 btn-secondary">Cancel</button>
              <button type="submit" className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700">Create</button>
            </div>
          </form>
        </AdminModal>
      )}

      {/* Balance Modal */}
      {showBalanceModal && selectedDistributor && (
        <AdminModal
          title={balanceType === 'add' ? 'Add Balance' : 'Deduct Balance'}
          subtitle={`${balanceType === 'add' ? 'To' : 'From'} ${selectedDistributor.name}'s wallet`}
          onClose={() => { setShowBalanceModal(false); setBalanceAmount(''); setDeductRemark(''); setSelectedDistributor(null); }}
        >
          <div className={`${balanceType === 'add' ? 'bg-blue-50 border-blue-100' : 'bg-red-50 border-red-100'} border rounded-xl p-4 mb-4`}>
            <p className="text-xs text-gray-500">Current Balance</p>
            <p className="text-2xl font-bold text-gray-900">₹{selectedDistributor.walletBalance?.toFixed(2) || '0.00'}</p>
          </div>
          <form onSubmit={handleBalance} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Amount (₹)</label>
              <input type="number" value={balanceAmount} onChange={e => setBalanceAmount(e.target.value)} placeholder="Enter amount" min="1" step="0.01" required className="input-field" autoFocus />
            </div>
            {balanceType === 'deduct' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Remark</label>
                <textarea value={deductRemark} onChange={e => setDeductRemark(e.target.value)} placeholder="Reason for deduction" className="input-field" rows="3" required />
              </div>
            )}
            <div className="flex gap-3">
              <button type="button" onClick={() => { setShowBalanceModal(false); setBalanceAmount(''); setDeductRemark(''); setSelectedDistributor(null); }} className="flex-1 btn-secondary">Cancel</button>
              <button type="submit" className={`flex-1 py-3 rounded-xl text-white font-semibold ${balanceType === 'add' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'}`}>
                {balanceType === 'add' ? 'Add Balance' : 'Deduct'}
              </button>
            </div>
          </form>
        </AdminModal>
      )}
    </div>
  );
}
