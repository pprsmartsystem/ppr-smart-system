'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GiftIcon, PlusIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function AdminCashbackPage() {
  const [cashbacks, setCashbacks] = useState([]);
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [manualCashback, setManualCashback] = useState({ userId: '', spendAmount: '' });

  useEffect(() => {
    fetchCashbacks();
    fetchUsers();
  }, []);

  const fetchCashbacks = async () => {
    const res = await fetch('/api/admin/cashback');
    if (res.ok) {
      const data = await res.json();
      setCashbacks(data.cashbacks || []);
    }
  };

  const fetchUsers = async () => {
    const res = await fetch('/api/admin/users');
    if (res.ok) {
      const data = await res.json();
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
        fetchCashbacks();
      }
    } catch (error) {
      toast.error('Failed to process cashback');
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
          spendAmount: parseFloat(manualCashback.spendAmount) 
        }),
      });
      if (res.ok) {
        toast.success('Manual cashback processed!');
        setShowModal(false);
        setManualCashback({ userId: '', spendAmount: '' });
        fetchCashbacks();
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
        fetchUsers();
      }
    } catch (error) {
      toast.error('Failed to update settings');
    }
  };

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Cashback Management</h1>
            <p className="text-gray-600 mt-2">Manage user cashbacks (4% reward)</p>
          </div>
          <button onClick={() => setShowModal(true)} className="btn-primary">
            <PlusIcon className="w-4 h-4 mr-2" />
            Manual Cashback
          </button>
        </div>
      </motion.div>

      {/* Auto Cashback Controls */}
      <div className="stats-card">
        <h2 className="text-xl font-semibold mb-4">Auto Cashback Controls</h2>
        <div className="space-y-3">
          {users.map((user) => (
            <div key={user._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">{user.name}</p>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Auto Cashback:</span>
                <button
                  onClick={() => handleToggleAutoCashback(user._id, !user.autoCashback)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium ${
                    user.autoCashback 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {user.autoCashback ? 'Enabled' : 'Paused'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pending Cashbacks */}
      <div className="stats-card">
        <h2 className="text-xl font-semibold mb-4">Pending Cashbacks</h2>
        <div className="space-y-4">
          {cashbacks.filter(c => c.status === 'pending').map((cashback) => (
            <div key={cashback._id} className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div>
                <p className="font-medium">{cashback.userId?.name}</p>
                <p className="text-sm text-gray-600">Spend: ₹{cashback.spendAmount}</p>
                <p className="text-sm text-gray-600">Cashback: ₹{cashback.cashbackAmount} ({cashback.cashbackRate}%)</p>
                <p className="text-xs text-gray-500">{new Date(cashback.createdAt).toLocaleString()}</p>
              </div>
              <button
                onClick={() => handleProcessCashback(cashback._id)}
                className="btn-primary"
              >
                Process Now
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Processed Cashbacks */}
      <div className="stats-card">
        <h2 className="text-xl font-semibold mb-4">Recent Cashbacks</h2>
        <div className="space-y-4">
          {cashbacks.filter(c => c.status === 'processed').slice(0, 10).map((cashback) => (
            <div key={cashback._id} className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
              <div>
                <p className="font-medium">{cashback.userId?.name}</p>
                <p className="text-sm text-gray-600">Cashback: ₹{cashback.cashbackAmount} ({cashback.type})</p>
                <p className="text-xs text-gray-500">Processed: {new Date(cashback.processedAt).toLocaleString()}</p>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">Processed</span>
            </div>
          ))}
        </div>
      </div>

      {/* Manual Cashback Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-2xl p-8 max-w-md w-full">
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
                <p className="text-xs text-gray-500 mt-1">4% cashback will be calculated automatically</p>
              </div>
              <div className="flex space-x-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 btn-secondary">Cancel</button>
                <button type="submit" className="flex-1 btn-primary">Process Cashback</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}