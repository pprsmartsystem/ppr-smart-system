'use client';

import { useState, useEffect } from 'react';
import { GiftIcon, PlusIcon, CheckIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { PageHeader, AdminModal } from '@/components/ui/AdminComponents';

export default function AdminCashbackPage() {
  const [cashbacks, setCashbacks] = useState([]);
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showRateModal, setShowRateModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [manualCashback, setManualCashback] = useState({ userId: '', spendAmount: '', cashbackRate: '' });
  const [selectedPending, setSelectedPending] = useState([]);
  const [selectedProcessed, setSelectedProcessed] = useState([]);
  const [filter, setFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState({ startDate: '', endDate: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const res = await fetch('/api/admin/cashback');
    if (res.ok) {
      const data = await res.json();
      setCashbacks(data.cashbacks || []);
      setUsers(data.users || []);
    }
  };

  const handleProcessCashback = async (cashbackId) => {
    try {
      const res = await fetch('/api/admin/cashback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'process', cashbackId }),
      });
      if (res.ok) {
        toast.success('Cashback processed!');
        fetchData();
      }
    } catch (error) {
      toast.error('Failed to process cashback');
    }
  };

  const handleBulkProcess = async () => {
    if (!selectedPending.length) return;
    try {
      const res = await fetch('/api/admin/cashback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'bulk_process', cashbackIds: selectedPending }),
      });
      if (res.ok) {
        const data = await res.json();
        toast.success(data.message);
        setSelectedPending([]);
        fetchData();
      }
    } catch (error) {
      toast.error('Failed to process');
    }
  };

  const handleBulkDelete = async (ids) => {
    if (!ids.length) return;
    if (!confirm(`Delete ${ids.length} cashback(s)?`)) return;
    try {
      const res = await fetch('/api/admin/cashback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', cashbackIds: ids }),
      });
      if (res.ok) {
        toast.success('Deleted successfully');
        setSelectedPending([]);
        setSelectedProcessed([]);
        fetchData();
      }
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const handleManualCashback = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/cashback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'manual_cashback', 
          userId: manualCashback.userId, 
          spendAmount: parseFloat(manualCashback.spendAmount),
          cashbackRate: manualCashback.cashbackRate ? parseFloat(manualCashback.cashbackRate) : undefined
        }),
      });
      if (res.ok) {
        toast.success('Manual cashback processed!');
        setShowModal(false);
        setManualCashback({ userId: '', spendAmount: '', cashbackRate: '' });
        fetchData();
      }
    } catch (error) {
      toast.error('Failed to process cashback');
    }
  };

  const handleToggleAutoCashback = async (userId, enabled) => {
    try {
      const res = await fetch('/api/admin/cashback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle_auto', userId, enabled }),
      });
      if (res.ok) {
        toast.success(`Auto cashback ${enabled ? 'enabled' : 'paused'}`);
        fetchData();
      }
    } catch (error) {
      toast.error('Failed to update settings');
    }
  };

  const handleSetRate = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    const rate = parseFloat(e.target.rate.value);
    try {
      const res = await fetch('/api/admin/cashback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set_rate', userId: selectedUser._id, cashbackRate: rate }),
      });
      if (res.ok) {
        toast.success('Cashback rate updated!');
        setShowRateModal(false);
        setSelectedUser(null);
        fetchData();
      }
    } catch (error) {
      toast.error('Failed to update rate');
    }
  };

  const pendingCashbacks = cashbacks.filter(c => {
    if (c.status !== 'pending') return false;
    if (dateFilter.startDate || dateFilter.endDate) {
      const cashbackDate = new Date(c.createdAt);
      if (dateFilter.startDate && cashbackDate < new Date(dateFilter.startDate)) return false;
      if (dateFilter.endDate) {
        const endDate = new Date(dateFilter.endDate);
        endDate.setHours(23, 59, 59, 999);
        if (cashbackDate > endDate) return false;
      }
    }
    return true;
  });
  
  const processedCashbacks = cashbacks.filter(c => {
    if (c.status !== 'processed') return false;
    if (dateFilter.startDate || dateFilter.endDate) {
      const cashbackDate = new Date(c.processedAt || c.createdAt);
      if (dateFilter.startDate && cashbackDate < new Date(dateFilter.startDate)) return false;
      if (dateFilter.endDate) {
        const endDate = new Date(dateFilter.endDate);
        endDate.setHours(23, 59, 59, 999);
        if (cashbackDate > endDate) return false;
      }
    }
    return true;
  });
  const filteredUsers = filter === 'all' ? users : users.filter(u => 
    filter === 'enabled' ? u.autoCashback : !u.autoCashback
  );

  return (
    <div className="space-y-5">
      <PageHeader icon={GiftIcon} title="Cashback Management" subtitle="Advanced cashback control & processing" color="from-pink-500 to-rose-500"
        action={<button onClick={() => setShowModal(true)} className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700"><PlusIcon className="w-4 h-4" />Manual Cashback</button>}
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-blue-100 p-5">
          <p className="text-sm text-blue-600 font-medium">Pending Cashbacks</p>
          <p className="text-3xl font-bold text-blue-900">{pendingCashbacks.length}</p>
          <p className="text-xs text-blue-600 mt-1">Spend: ₹{pendingCashbacks.reduce((sum, c) => sum + c.spendAmount, 0).toFixed(2)}</p>
          <p className="text-xs text-blue-600">Cashback: ₹{pendingCashbacks.reduce((sum, c) => sum + c.cashbackAmount, 0).toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-green-100 p-5">
          <p className="text-sm text-green-600 font-medium">Processed (Filtered)</p>
          <p className="text-3xl font-bold text-green-900">{processedCashbacks.length}</p>
          <p className="text-xs text-green-600 mt-1">Spend: ₹{processedCashbacks.reduce((sum, c) => sum + c.spendAmount, 0).toFixed(2)}</p>
          <p className="text-xs text-green-600">Cashback: ₹{processedCashbacks.reduce((sum, c) => sum + c.cashbackAmount, 0).toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-purple-100 p-5">
          <p className="text-sm text-purple-600 font-medium">Total (Filtered)</p>
          <p className="text-3xl font-bold text-purple-900">{pendingCashbacks.length + processedCashbacks.length}</p>
          <p className="text-xs text-purple-600 mt-1">Spend: ₹{([...pendingCashbacks, ...processedCashbacks].reduce((sum, c) => sum + c.spendAmount, 0)).toFixed(2)}</p>
          <p className="text-xs text-purple-600">Cashback: ₹{([...pendingCashbacks, ...processedCashbacks].reduce((sum, c) => sum + c.cashbackAmount, 0)).toFixed(2)}</p>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-orange-100 p-5">
          <p className="text-sm text-orange-600 font-medium">Total Users</p>
          <p className="text-3xl font-bold text-orange-900">{users.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-pink-100 p-5">
          <p className="text-sm text-pink-600 font-medium">Auto Enabled</p>
          <p className="text-3xl font-bold text-pink-900">{users.filter(u => u.autoCashback).length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-indigo-100 p-5">
          <p className="text-sm text-indigo-600 font-medium">Auto Disabled</p>
          <p className="text-3xl font-bold text-indigo-900">{users.filter(u => !u.autoCashback).length}</p>
        </div>
      </div>

      {/* Date Filter */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h2 className="text-xl font-semibold mb-4">Date Filter</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              value={dateFilter.startDate}
              onChange={(e) => setDateFilter({ ...dateFilter, startDate: e.target.value })}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
            <input
              type="date"
              value={dateFilter.endDate}
              onChange={(e) => setDateFilter({ ...dateFilter, endDate: e.target.value })}
              className="input-field"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setDateFilter({ startDate: '', endDate: '' })}
              className="btn-secondary w-full"
            >
              Clear Filter
            </button>
          </div>
        </div>
        {(dateFilter.startDate || dateFilter.endDate) && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              📅 Showing cashbacks from {dateFilter.startDate || 'beginning'} to {dateFilter.endDate || 'today'}
            </p>
          </div>
        )}
      </div>

      {/* User Cashback Settings */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">User Cashback Settings</h2>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input-field w-48">
            <option value="all">All Users</option>
            <option value="enabled">Auto Enabled</option>
            <option value="disabled">Auto Disabled</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-900">User</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-900">Cashback Rate</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-900">Auto Cashback</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user._id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                      {user.cashbackRate}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => handleToggleAutoCashback(user._id, !user.autoCashback)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium ${
                        user.autoCashback 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {user.autoCashback ? 'Enabled' : 'Disabled'}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => { setSelectedUser(user); setShowRateModal(true); }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      title="Edit Rate"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pending Cashbacks */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Pending Cashbacks ({pendingCashbacks.length})</h2>
          <div className="flex space-x-2">
            {selectedPending.length > 0 && (
              <>
                <button onClick={handleBulkProcess} className="btn-primary text-sm">
                  <CheckIcon className="w-4 h-4 mr-1" />
                  Settle Selected ({selectedPending.length})
                </button>
                <button onClick={() => handleBulkDelete(selectedPending)} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm">
                  <TrashIcon className="w-4 h-4 mr-1" />
                  Delete ({selectedPending.length})
                </button>
              </>
            )}
          </div>
        </div>
        <div className="space-y-3">
          {pendingCashbacks.length > 0 && (
            <label className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={selectedPending.length === pendingCashbacks.length}
                onChange={(e) => setSelectedPending(e.target.checked ? pendingCashbacks.map(c => c._id) : [])}
                className="w-4 h-4"
              />
              <span className="text-sm font-medium text-gray-700">Select All</span>
            </label>
          )}
          {pendingCashbacks.map((cashback) => (
            <div key={cashback._id} className="flex items-center space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <input
                type="checkbox"
                checked={selectedPending.includes(cashback._id)}
                onChange={(e) => setSelectedPending(e.target.checked 
                  ? [...selectedPending, cashback._id] 
                  : selectedPending.filter(id => id !== cashback._id)
                )}
                className="w-4 h-4"
              />
              <div className="flex-1">
                <p className="font-medium">{cashback.userId?.name || 'Unknown User'}</p>
                <p className="text-sm text-gray-600">Spend: ₹{Number(cashback.spendAmount).toFixed(2)} | Cashback: ₹{Number(cashback.cashbackAmount).toFixed(2)} ({cashback.cashbackRate}%)</p>
                <p className="text-xs text-gray-500">{new Date(cashback.createdAt).toLocaleString()}</p>
              </div>
              <button onClick={() => handleProcessCashback(cashback._id)} className="btn-primary text-sm">
                Process
              </button>
            </div>
          ))}
          {pendingCashbacks.length === 0 && (
            <div className="text-center py-8 text-gray-500">No pending cashbacks</div>
          )}
        </div>
      </div>

      {/* Processed Cashbacks */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Recent Processed ({processedCashbacks.length})</h2>
          {selectedProcessed.length > 0 && (
            <button onClick={() => handleBulkDelete(selectedProcessed)} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm">
              <TrashIcon className="w-4 h-4 mr-1" />
              Delete ({selectedProcessed.length})
            </button>
          )}
        </div>
        <div className="space-y-3">
          {processedCashbacks.length > 0 && (
            <label className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={selectedProcessed.length === processedCashbacks.length}
                onChange={(e) => setSelectedProcessed(e.target.checked ? processedCashbacks.map(c => c._id) : [])}
                className="w-4 h-4"
              />
              <span className="text-sm font-medium text-gray-700">Select All</span>
            </label>
          )}
          {processedCashbacks.slice(0, 20).map((cashback) => (
            <div key={cashback._id} className="flex items-center space-x-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <input
                type="checkbox"
                checked={selectedProcessed.includes(cashback._id)}
                onChange={(e) => setSelectedProcessed(e.target.checked 
                  ? [...selectedProcessed, cashback._id] 
                  : selectedProcessed.filter(id => id !== cashback._id)
                )}
                className="w-4 h-4"
              />
              <div className="flex-1">
                <p className="font-medium">{cashback.userId?.name || 'Unknown User'}</p>
                <p className="text-sm text-gray-600">Cashback: ₹{Number(cashback.cashbackAmount).toFixed(2)} ({cashback.cashbackRate}%) - {cashback.type}</p>
                <p className="text-xs text-gray-500">Processed: {new Date(cashback.processedAt).toLocaleString()}</p>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">Processed</span>
            </div>
          ))}
        </div>
      </div>

      {/* Manual Cashback Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-bold mb-6">Manual Cashback</h2>
            <form onSubmit={handleManualCashback} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">User</label>
                <select
                  value={manualCashback.userId}
                  onChange={(e) => setManualCashback({ ...manualCashback, userId: e.target.value })}
                  className="input-field"
                  required
                >
                  <option value="">Select User</option>
                  {users.map((user) => (
                    <option key={user._id} value={user._id}>{user.name} ({user.email})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Spend Amount (₹)</label>
                <input
                  type="number"
                  value={manualCashback.spendAmount}
                  onChange={(e) => setManualCashback({ ...manualCashback, spendAmount: e.target.value })}
                  className="input-field"
                  required
                  min="1"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Custom Cashback Rate (%) - Optional</label>
                <input
                  type="number"
                  value={manualCashback.cashbackRate}
                  onChange={(e) => setManualCashback({ ...manualCashback, cashbackRate: e.target.value })}
                  className="input-field"
                  placeholder="Leave empty to use user's default rate"
                  min="0"
                  max="100"
                  step="0.01"
                />
                <p className="text-xs text-gray-500 mt-1">Default: User's configured rate or 4%</p>
              </div>
              <div className="flex space-x-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 btn-secondary">Cancel</button>
                <button type="submit" className="flex-1 btn-primary">Process Cashback</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showRateModal && selectedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Set Cashback Rate</h2>
            <p className="text-sm text-gray-500 mb-4">User: <strong>{selectedUser.name}</strong></p>
            <form onSubmit={handleSetRate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Cashback Rate (%)</label>
                <input type="number" name="rate" defaultValue={selectedUser.cashbackRate} className="input-field" required min="0" max="100" step="0.01" />
                <p className="text-xs text-gray-400 mt-1">Current rate: {selectedUser.cashbackRate}%</p>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => { setShowRateModal(false); setSelectedUser(null); }} className="flex-1 btn-secondary">Cancel</button>
                <button type="submit" className="flex-1 btn-primary">Update Rate</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
