'use client';

import { useState, useEffect } from 'react';
import { WalletIcon, ArrowUpIcon } from '@heroicons/react/24/outline';
import { formatCurrency } from '@/utils/cardUtils';
import toast from 'react-hot-toast';

export default function DistributorWalletPage() {
  const [distributorWallet, setDistributorWallet] = useState(0);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [amount, setAmount] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [walletRes, usersRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/distributor/users')
      ]);

      if (walletRes.ok) {
        const walletData = await walletRes.json();
        setDistributorWallet(walletData.walletBalance || 0);
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.users || []);
      }
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleRecharge = async (e) => {
    e.preventDefault();

    const rechargeAmount = parseFloat(amount);

    if (rechargeAmount > distributorWallet) {
      toast.error('Insufficient wallet balance');
      return;
    }

    try {
      const res = await fetch('/api/distributor/wallet/recharge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser,
          amount: rechargeAmount
        })
      });

      if (res.ok) {
        toast.success('Wallet recharged successfully');
        setShowModal(false);
        setSelectedUser('');
        setAmount('');
        fetchData();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to recharge wallet');
      }
    } catch (error) {
      toast.error('Failed to recharge wallet');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Wallet Management</h1>
        <p className="text-gray-600 mt-2">Recharge user wallets from your balance</p>
      </div>

      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-90">My Wallet Balance</p>
            <h2 className="text-4xl font-bold mt-2">{formatCurrency(distributorWallet)}</h2>
          </div>
          <WalletIcon className="h-16 w-16 opacity-50" />
        </div>
        <p className="text-sm mt-4 opacity-90">
          Contact admin to recharge your distributor wallet
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Recharge User Wallet</h3>
          <button
            onClick={() => setShowModal(true)}
            disabled={distributorWallet === 0}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              distributorWallet === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            <ArrowUpIcon className="h-5 w-5" />
            Recharge
          </button>
        </div>

        {distributorWallet === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              Your wallet balance is zero. Please contact admin to recharge your distributor wallet before you can recharge user wallets.
            </p>
          </div>
        )}

        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-700 mb-4">User Wallet Balances</h4>
          <div className="space-y-3">
            {users.map((user) => (
              <div key={user._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{formatCurrency(user.walletBalance || 0)}</p>
                  <p className="text-xs text-gray-500">Current Balance</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Recharge User Wallet</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-blue-800">
                Your Balance: <strong>{formatCurrency(distributorWallet)}</strong>
              </p>
            </div>
            <form onSubmit={handleRecharge} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select User</label>
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="">-- Select User --</option>
                  {users.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.name} - {user.email} (Balance: {formatCurrency(user.walletBalance || 0)})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  min="1"
                  max={distributorWallet}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Maximum: {formatCurrency(distributorWallet)}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Recharge
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
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
