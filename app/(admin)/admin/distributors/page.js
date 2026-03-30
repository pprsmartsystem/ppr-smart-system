'use client';

import { useState, useEffect } from 'react';
import { UserGroupIcon, PlusIcon, TrashIcon, WalletIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { formatCurrency } from '@/utils/cardUtils';
import toast from 'react-hot-toast';

export default function AdminDistributorsPage() {
  const [distributors, setDistributors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showDeductModal, setShowDeductModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
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

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewDistributor({ ...newDistributor, password });
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
          <h1 className="text-3xl font-bold text-gray-900">Distributors</h1>
          <p className="text-gray-600 mt-2">Manage distributor accounts and wallets</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <PlusIcon className="h-5 w-5" />
          Create Distributor
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Wallet Balance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Users</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {distributors.map((dist) => (
                <tr key={dist._id}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{dist.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{dist.email}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                    {formatCurrency(dist.walletBalance || 0)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{dist.userCount || 0}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      dist.status === 'approved' ? 'bg-green-100 text-green-800' :
                      dist.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      dist.status === 'blocked' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {dist.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(dist.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedDistributor(dist);
                          fetchDistributorStats(dist._id);
                          setShowStatsModal(true);
                        }}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Stats"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedDistributor(dist);
                          setShowWalletModal(true);
                        }}
                        className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Add Wallet Balance"
                      >
                        <WalletIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedDistributor(dist);
                          setShowDeductModal(true);
                        }}
                        className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                        title="Deduct Balance"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteDistributor(dist._id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Distributor"
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
      </div>

      {/* Distributor Stats Modal */}
      {showStatsModal && selectedDistributor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Distributor Statistics</h2>
              <button
                onClick={() => {
                  setShowStatsModal(false);
                  setSelectedDistributor(null);
                  setDistributorStats(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Create New Distributor</h2>
            <form onSubmit={handleCreateDistributor} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={newDistributor.name}
                  onChange={(e) => setNewDistributor({ ...newDistributor, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email ID</label>
                <input
                  type="email"
                  value={newDistributor.email}
                  onChange={(e) => setNewDistributor({ ...newDistributor, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newDistributor.password}
                    onChange={(e) => setNewDistributor({ ...newDistributor, password: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 pr-20"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={generatePassword}
                  className="mt-2 text-sm text-indigo-600 hover:text-indigo-700"
                >
                  Generate Password
                </button>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-xs text-yellow-800">
                  <strong>Note:</strong> Save the password and share it with the distributor. It cannot be retrieved later.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Create Distributor
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Wallet Balance Modal */}
      {showWalletModal && selectedDistributor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Add Wallet Balance</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-blue-800">
                <strong>{selectedDistributor.name}</strong><br />
                Current Balance: <strong>{formatCurrency(selectedDistributor.walletBalance || 0)}</strong>
              </p>
            </div>
            <form onSubmit={handleAddWallet} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  value={walletAmount}
                  onChange={(e) => setWalletAmount(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  min="1"
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Add Balance
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowWalletModal(false);
                    setSelectedDistributor(null);
                    setWalletAmount('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deduct Balance Modal */}
      {showDeductModal && selectedDistributor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Deduct Wallet Balance</h2>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-orange-800">
                <strong>{selectedDistributor.name}</strong><br />
                Current Balance: <strong>{formatCurrency(selectedDistributor.walletBalance || 0)}</strong>
              </p>
            </div>
            <form onSubmit={handleDeductWallet} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  value={deductData.amount}
                  onChange={(e) => setDeductData({ ...deductData, amount: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  min="1"
                  step="0.01"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Remark</label>
                <textarea
                  value={deductData.remark}
                  onChange={(e) => setDeductData({ ...deductData, remark: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  rows="3"
                  placeholder="Reason for deduction..."
                  required
                />
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-xs text-yellow-800">
                  <strong>Note:</strong> Balance can go negative. Deduction will be recorded in transaction history.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                >
                  Deduct Balance
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowDeductModal(false);
                    setSelectedDistributor(null);
                    setDeductData({ amount: '', remark: '' });
                  }}
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
