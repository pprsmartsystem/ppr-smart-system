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
  const [selectedDistributor, setSelectedDistributor] = useState(null);
  const [newDistributor, setNewDistributor] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [walletAmount, setWalletAmount] = useState('');
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
                          setShowWalletModal(true);
                        }}
                        className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Add Wallet Balance"
                      >
                        <WalletIcon className="h-4 w-4" />
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
    </div>
  );
}
