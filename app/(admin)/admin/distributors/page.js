'use client';

import { useState, useEffect } from 'react';
import { UserGroupIcon, PlusIcon, TrashIcon, WalletIcon, EyeIcon, EyeSlashIcon, PauseCircleIcon, PlayCircleIcon } from '@heroicons/react/24/outline';
import { formatCurrency } from '@/utils/cardUtils';
import toast from 'react-hot-toast';
import { PageHeader, StatusBadge, AdminModal, ActionBtn } from '@/components/ui/AdminComponents';

export default function AdminDistributorsPage() {
  const [distributors, setDistributors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showDeductModal, setShowDeductModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showHoldModal, setShowHoldModal] = useState(false);
  const [holdReason, setHoldReason] = useState('');
  const [selectedDistributor, setSelectedDistributor] = useState(null);
  const [distributorStats, setDistributorStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [statsDateFilter, setStatsDateFilter] = useState({ startDate: '', endDate: '' });
  const [newDistributor, setNewDistributor] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [walletAmount, setWalletAmount] = useState('');
  const [deductData, setDeductData] = useState({ amount: '', remark: '' });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    fetchDistributors();
  }, []);

  const fetchDistributors = async () => {
    try {
      const res = await fetch('/api/admin/distributors');
      if (res.ok) {
        const data = await res.json();
        setDistributors(data.distributors || []);
      }
    } catch (error) {
      toast.error('Failed to load distributors');
    } finally {
      setLoading(false);
    }
  };

  const fetchDistributorStats = async (distributorId, startDate = '', endDate = '') => {
    setLoadingStats(true);
    try {
      let url = `/api/admin/distributors/stats?distributorId=${distributorId}`;
      if (startDate) url += `&startDate=${startDate}`;
      if (endDate) url += `&endDate=${endDate}`;
      
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setDistributorStats(data);
      } else {
        toast.error('Failed to load stats');
      }
    } catch (error) {
      toast.error('Failed to load stats');
    } finally {
      setLoadingStats(false);
    }
  };

  const handleCreateDistributor = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch('/api/admin/distributors/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDistributor)
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(`Distributor created! Password: ${newDistributor.password}`);
        setShowCreateModal(false);
        setNewDistributor({ name: '', email: '', password: '' });
        fetchDistributors();
      } else {
        toast.error(data.error || 'Failed to create distributor');
      }
    } catch (error) {
      toast.error('Failed to create distributor');
    }
  };

  const handleDeleteDistributor = async (id) => {
    if (!confirm('Delete this distributor? This will also delete all their users and data.')) return;

    try {
      const res = await fetch(`/api/admin/distributors/delete?id=${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        toast.success('Distributor deleted');
        fetchDistributors();
      } else {
        toast.error('Failed to delete distributor');
      }
    } catch (error) {
      toast.error('Failed to delete distributor');
    }
  };

  const handleAddWallet = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch('/api/admin/distributors/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          distributorId: selectedDistributor._id,
          amount: parseFloat(walletAmount)
        })
      });

      if (res.ok) {
        toast.success('Wallet balance added');
        setShowWalletModal(false);
        setSelectedDistributor(null);
        setWalletAmount('');
        fetchDistributors();
      } else {
        toast.error('Failed to add balance');
      }
    } catch (error) {
      toast.error('Failed to add balance');
    }
  };

  const handleDeductWallet = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch('/api/admin/distributors/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          distributorId: selectedDistributor._id,
          amount: parseFloat(deductData.amount),
          action: 'deduct',
          remark: deductData.remark
        })
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Balance deducted successfully');
        setShowDeductModal(false);
        setSelectedDistributor(null);
        setDeductData({ amount: '', remark: '' });
        fetchDistributors();
      } else {
        toast.error(data.error || 'Failed to deduct balance');
      }
    } catch (error) {
      toast.error('Failed to deduct balance');
    }
  };

  const handleHoldDistributor = async (action) => {
    try {
      const res = await fetch('/api/admin/distributors/hold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          distributorId: selectedDistributor._id,
          action,
          reason: holdReason,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        setShowHoldModal(false);
        setHoldReason('');
        setSelectedDistributor(null);
        fetchDistributors();
      } else {
        toast.error(data.error || 'Failed');
      }
    } catch { toast.error('Failed to update hold status'); }
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewDistributor({ ...newDistributor, password });
  };

  if (loading) return <div className="flex items-center justify-center min-h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" /></div>;

  return (
    <div className="space-y-5">
      <PageHeader icon={UserGroupIcon} title="Distributors" subtitle="Manage distributor accounts and wallets" color="from-violet-500 to-purple-600"
        action={<button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors"><PlusIcon className="h-4 w-4" />Create Distributor</button>}
      />

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                {['Name','Email','Wallet Balance','Total Users','Status','Created','Actions'].map((h,i) => (
                  <th key={h} className={`py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide ${i===6?'text-right':'text-left'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {distributors.map((dist) => (
                <tr key={dist._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900">{dist.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{dist.email}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900">{formatCurrency(dist.walletBalance || 0)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{dist.userCount || 0}</td>
                  <td className="px-4 py-3">
                    <div className="space-y-1">
                      <StatusBadge status={dist.isOnHold ? 'blocked' : dist.status} />
                      {dist.isOnHold && dist.holdReason && (
                        <p className="text-xs text-amber-600 font-medium truncate max-w-[120px]" title={dist.holdReason}>
                          🔒 {dist.holdReason}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">{new Date(dist.createdAt).toLocaleDateString('en-IN')}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 justify-end">
                      <ActionBtn icon={EyeIcon} onClick={() => { setSelectedDistributor(dist); fetchDistributorStats(dist._id); setShowStatsModal(true); }} color="text-blue-600 hover:bg-blue-50" title="View Stats" />
                      <ActionBtn icon={WalletIcon} onClick={() => { setSelectedDistributor(dist); setShowWalletModal(true); }} color="text-green-600 hover:bg-green-50" title="Add Balance" />
                      <ActionBtn icon={() => <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>} onClick={() => { setSelectedDistributor(dist); setShowDeductModal(true); }} color="text-orange-600 hover:bg-orange-50" title="Deduct Balance" />
                      {/* Hold / Unhold */}
                      {dist.isOnHold || dist.status === 'blocked' ? (
                        <button
                          onClick={() => { setSelectedDistributor(dist); handleHoldDistributor('unhold'); }}
                          title="Remove Hold"
                          className="p-1.5 rounded-lg bg-amber-100 text-amber-700 hover:bg-amber-200 transition-colors"
                        >
                          <PlayCircleIcon className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => { setSelectedDistributor(dist); setShowHoldModal(true); }}
                          title="Place on Hold"
                          className="p-1.5 rounded-lg text-gray-400 hover:bg-amber-50 hover:text-amber-600 transition-colors"
                        >
                          <PauseCircleIcon className="w-4 h-4" />
                        </button>
                      )}
                      <ActionBtn icon={TrashIcon} onClick={() => handleDeleteDistributor(dist._id)} color="text-red-600 hover:bg-red-50" title="Delete" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {distributors.length === 0 && <div className="text-center py-12 text-sm text-gray-400">No distributors found</div>}
      </div>

      {/* Distributor Stats Modal */}
      {showStatsModal && selectedDistributor && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5">
              <div><h2 className="text-lg font-bold text-gray-900">Distributor Statistics</h2><p className="text-xs text-gray-400">{selectedDistributor.name}</p></div>
              <button onClick={() => { setShowStatsModal(false); setSelectedDistributor(null); setDistributorStats(null); }} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"><svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>

            {loadingStats ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              </div>
            ) : distributorStats ? (
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-indigo-900 mb-2">{selectedDistributor.name}</h3>
                  <p className="text-sm text-indigo-700">{selectedDistributor.email}</p>
                </div>

                {/* Date Filter */}
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Filter by Date</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
                      <input
                        type="date"
                        value={statsDateFilter.startDate}
                        onChange={(e) => setStatsDateFilter({ ...statsDateFilter, startDate: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">End Date</label>
                      <input
                        type="date"
                        value={statsDateFilter.endDate}
                        onChange={(e) => setStatsDateFilter({ ...statsDateFilter, endDate: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => fetchDistributorStats(selectedDistributor._id, statsDateFilter.startDate, statsDateFilter.endDate)}
                      className="flex-1 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700"
                    >
                      Apply Filter
                    </button>
                    <button
                      onClick={() => {
                        setStatsDateFilter({ startDate: '', endDate: '' });
                        fetchDistributorStats(selectedDistributor._id);
                      }}
                      className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 text-sm rounded-lg hover:bg-gray-300"
                    >
                      Clear
                    </button>
                  </div>
                  {(statsDateFilter.startDate || statsDateFilter.endDate) && (
                    <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-xs text-blue-800">
                        📅 Showing data from {statsDateFilter.startDate || 'beginning'} to {statsDateFilter.endDate || 'today'}
                      </p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <p className="text-sm text-blue-600 font-medium">Total Users</p>
                    <p className="text-3xl font-bold text-blue-900 mt-2">{distributorStats.totalUsers}</p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                    <p className="text-sm text-green-600 font-medium">Active Users</p>
                    <p className="text-3xl font-bold text-green-900 mt-2">{distributorStats.activeUsers}</p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                  <h4 className="text-lg font-semibold text-purple-900 mb-4">Redemption Summary</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-purple-700">Total Redemptions:</span>
                      <span className="text-2xl font-bold text-purple-900">{distributorStats.totalRedemptions}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-purple-700">Total Spend Amount:</span>
                      <span className="text-2xl font-bold text-purple-900">{formatCurrency(distributorStats.totalSpendAmount)}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
                    <p className="text-sm text-orange-600 font-medium">Today's Redemptions</p>
                    <p className="text-2xl font-bold text-orange-900 mt-2">{distributorStats.todayRedemptions}</p>
                    <p className="text-xs text-orange-600 mt-1">{formatCurrency(distributorStats.todaySpendAmount)}</p>
                  </div>
                  <div className="bg-pink-50 rounded-xl p-4 border border-pink-200">
                    <p className="text-sm text-pink-600 font-medium">This Month</p>
                    <p className="text-2xl font-bold text-pink-900 mt-2">{distributorStats.monthRedemptions}</p>
                    <p className="text-xs text-pink-600 mt-1">{formatCurrency(distributorStats.monthSpendAmount)}</p>
                  </div>
                </div>

                {distributorStats.topUsers && distributorStats.topUsers.length > 0 && (
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Top 5 Users by Spend</h4>
                    <div className="space-y-3">
                      {distributorStats.topUsers.map((user, index) => (
                        <div key={user._id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{user.name}</p>
                              <p className="text-xs text-gray-500">{user.email}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-900">{formatCurrency(user.totalSpend)}</p>
                            <p className="text-xs text-gray-500">{user.redemptionCount} redemptions</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">No data available</div>
            )}
          </div>
        </div>
      )}

      {/* Create Distributor Modal */}
      {showCreateModal && (
        <AdminModal title="Create Distributor" subtitle="New distributor account" onClose={() => setShowCreateModal(false)}>
          <form onSubmit={handleCreateDistributor} className="space-y-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label><input type="text" value={newDistributor.name} onChange={(e) => setNewDistributor({ ...newDistributor, name: e.target.value })} className="input-field" required /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label><input type="email" value={newDistributor.email} onChange={(e) => setNewDistributor({ ...newDistributor, email: e.target.value })} className="input-field" required /></div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={newDistributor.password} onChange={(e) => setNewDistributor({ ...newDistributor, password: e.target.value })} className="input-field pr-20" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{showPassword ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}</button>
              </div>
              <button type="button" onClick={generatePassword} className="mt-1.5 text-xs text-indigo-600 hover:text-indigo-700 font-medium">Generate Password</button>
            </div>
            <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 text-xs text-amber-800">Save the password and share it with the distributor. It cannot be retrieved later.</div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 btn-secondary">Cancel</button>
              <button type="submit" className="flex-1 btn-primary">Create</button>
            </div>
          </form>
        </AdminModal>
      )}

      {showWalletModal && selectedDistributor && (
        <AdminModal title="Add Wallet Balance" subtitle={`${selectedDistributor.name} · Current: ${formatCurrency(selectedDistributor.walletBalance || 0)}`} onClose={() => { setShowWalletModal(false); setSelectedDistributor(null); setWalletAmount(''); }}>
          <form onSubmit={handleAddWallet} className="space-y-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Amount (₹)</label><input type="number" value={walletAmount} onChange={(e) => setWalletAmount(e.target.value)} className="input-field" min="1" required autoFocus /></div>
            <div className="flex gap-3">
              <button type="button" onClick={() => { setShowWalletModal(false); setSelectedDistributor(null); setWalletAmount(''); }} className="flex-1 btn-secondary">Cancel</button>
              <button type="submit" className="flex-1 btn-primary">Add Balance</button>
            </div>
          </form>
        </AdminModal>
      )}

      {showDeductModal && selectedDistributor && (
        <AdminModal title="Deduct Balance" subtitle={`${selectedDistributor.name} · Current: ${formatCurrency(selectedDistributor.walletBalance || 0)}`} onClose={() => { setShowDeductModal(false); setSelectedDistributor(null); setDeductData({ amount: '', remark: '' }); }}>
          <form onSubmit={handleDeductWallet} className="space-y-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Amount (₹)</label><input type="number" value={deductData.amount} onChange={(e) => setDeductData({ ...deductData, amount: e.target.value })} className="input-field" min="1" step="0.01" required autoFocus /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Remark</label><textarea value={deductData.remark} onChange={(e) => setDeductData({ ...deductData, remark: e.target.value })} className="input-field" rows="3" placeholder="Reason for deduction..." required /></div>
            <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 text-xs text-amber-800">Balance can go negative. Deduction will be recorded in transaction history.</div>
            <div className="flex gap-3">
              <button type="button" onClick={() => { setShowDeductModal(false); setSelectedDistributor(null); setDeductData({ amount: '', remark: '' }); }} className="flex-1 btn-secondary">Cancel</button>
              <button type="submit" className="flex-1 py-3 rounded-xl bg-orange-600 text-white font-semibold hover:bg-orange-700">Deduct</button>
            </div>
          </form>
        </AdminModal>
      )}
      {showHoldModal && selectedDistributor && (
        <AdminModal
          title="Place Distributor on Hold"
          subtitle={`Temporarily suspend ${selectedDistributor.name}'s account`}
          onClose={() => { setShowHoldModal(false); setHoldReason(''); setSelectedDistributor(null); }}
        >
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <PauseCircleIcon className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-800">Account will be temporarily suspended</p>
                  <p className="text-xs text-amber-700 mt-1">
                    The distributor will not be able to log in or perform any operations.
                    Their users and data will remain intact. You can remove the hold anytime.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 space-y-1.5">
              {[['Name', selectedDistributor.name], ['Email', selectedDistributor.email], ['Wallet', formatCurrency(selectedDistributor.walletBalance || 0)], ['Users', selectedDistributor.userCount || 0]].map(([k, v]) => (
                <div key={k} className="flex justify-between text-sm">
                  <span className="text-gray-500">{k}</span>
                  <span className="font-semibold text-gray-900">{v}</span>
                </div>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Reason for Hold <span className="text-gray-400">(optional)</span></label>
              <textarea
                value={holdReason}
                onChange={e => setHoldReason(e.target.value)}
                placeholder="e.g. Suspicious activity, pending verification, compliance review..."
                className="input-field resize-none text-sm"
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setShowHoldModal(false); setHoldReason(''); setSelectedDistributor(null); }}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => handleHoldDistributor('hold')}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm transition-colors"
              >
                <PauseCircleIcon className="w-4 h-4" /> Place on Hold
              </button>
            </div>
          </div>
        </AdminModal>
      )}
    </div>
  );
}
