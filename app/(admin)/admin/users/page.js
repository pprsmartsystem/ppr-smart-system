'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  CheckCircleIcon,
  XCircleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusCircleIcon,
  NoSymbolIcon,
  EyeIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [balanceAmount, setBalanceAmount] = useState('');
  const [showCardsModal, setShowCardsModal] = useState(false);
  const [userCards, setUserCards] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId) => {
    try {
      const res = await fetch('/api/admin/users/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (res.ok) {
        toast.success('User approved successfully');
        fetchUsers();
      }
    } catch (error) {
      toast.error('Failed to approve user');
    }
  };

  const handleReject = async (userId) => {
    try {
      const res = await fetch('/api/admin/users/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (res.ok) {
        toast.success('User rejected');
        fetchUsers();
      }
    } catch (error) {
      toast.error('Failed to reject user');
    }
  };

  const handleBlock = async (userId) => {
    try {
      const res = await fetch('/api/admin/users/block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (res.ok) {
        toast.success('User blocked');
        fetchUsers();
      }
    } catch (error) {
      toast.error('Failed to block user');
    }
  };

  const handleUnblock = async (userId) => {
    try {
      const res = await fetch('/api/admin/users/unblock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (res.ok) {
        toast.success('User unblocked');
        fetchUsers();
      }
    } catch (error) {
      toast.error('Failed to unblock user');
    }
  };

  const handleViewCards = async (user) => {
    setSelectedUser(user);
    try {
      const res = await fetch(`/api/admin/users/${user._id}/cards`);
      if (res.ok) {
        const data = await res.json();
        setUserCards(data.cards || []);
        setShowCardsModal(true);
      }
    } catch (error) {
      toast.error('Failed to fetch cards');
    }
  };

  const handleAddBalance = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/users/add-balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: selectedUser._id, 
          amount: parseFloat(balanceAmount) 
        }),
      });
      if (res.ok) {
        toast.success('Balance added successfully!');
        setShowBalanceModal(false);
        setBalanceAmount('');
        setSelectedUser(null);
        fetchUsers();
      } else {
        toast.error('Failed to add balance');
      }
    } catch (error) {
      toast.error('Error adding balance');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesFilter = filter === 'all' || user.status === filter;
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600 mt-2">Approve, reject, and manage user accounts</p>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="stats-card"
      >
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <div className="flex items-center space-x-2">
            <FunnelIcon className="w-5 h-5 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="input-field"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Users Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="stats-card overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-4 px-4 font-semibold text-gray-900">Name</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-900">Email</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-900">Role</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-900">Status</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-900">Wallet</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-900">Joined</th>
                <th className="text-right py-4 px-4 font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, index) => (
                <motion.tr
                  key={user._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-4 px-4">
                    <p className="font-medium text-gray-900">{user.name}</p>
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-gray-600">{user.email}</p>
                  </td>
                  <td className="py-4 px-4">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                      {user.role}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      user.status === 'approved' ? 'bg-green-100 text-green-800' :
                      user.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    } capitalize`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-gray-900 font-medium">₹{user.walletBalance?.toFixed(2) || '0.00'}</p>
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-gray-600 text-sm">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowBalanceModal(true);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Add Balance"
                      >
                        <PlusCircleIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleViewCards(user)}
                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        title="View Cards"
                      >
                        <EyeIcon className="w-5 h-5" />
                      </button>
                      {user.status === 'blocked' ? (
                        <button
                          onClick={() => handleUnblock(user._id)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Unblock User"
                        >
                          <CheckIcon className="w-5 h-5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleBlock(user._id)}
                          className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                          title="Block User"
                        >
                          <NoSymbolIcon className="w-5 h-5" />
                        </button>
                      )}
                      {user.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(user._id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Approve"
                          >
                            <CheckCircleIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleReject(user._id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Reject"
                          >
                            <XCircleIcon className="w-5 h-5" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No users found</p>
          </div>
        )}
      </motion.div>

      {/* Add Balance Modal */}
      {showBalanceModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4">Add Wallet Balance</h2>
            <p className="text-gray-600 mb-6">
              Add balance to <strong>{selectedUser.name}</strong>&apos;s wallet
            </p>
            <form onSubmit={handleAddBalance} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Balance</label>
                <div className="text-2xl font-bold text-gray-900">₹{selectedUser.walletBalance?.toFixed(2) || '0.00'}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount to Add</label>
                <input
                  type="number"
                  value={balanceAmount}
                  onChange={(e) => setBalanceAmount(e.target.value)}
                  placeholder="Enter amount"
                  min="1"
                  step="0.01"
                  required
                  className="input-field"
                  autoFocus
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowBalanceModal(false);
                    setBalanceAmount('');
                    setSelectedUser(null);
                  }}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 btn-primary">
                  Add Balance
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* View Cards Modal */}
      {showCardsModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-2xl p-8 max-w-4xl w-full my-8">
            <h2 className="text-2xl font-bold mb-6">{selectedUser.name}&apos;s Cards</h2>
            
            <div className="mb-6 p-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-600">User ID: <span className="font-mono font-medium">{selectedUser._id}</span></p>
              <p className="text-sm text-gray-600">Email: <span className="font-medium">{selectedUser.email}</span></p>
            </div>

            {userCards.length > 0 ? (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {userCards.map((card) => (
                  <div key={card._id} className="p-4 border border-gray-200 rounded-xl">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Card Number</p>
                        <p className="font-mono font-medium">{card.cardNumber}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Expiry</p>
                        <p className="font-medium">{card.expiryDate}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">CVV</p>
                        <p className="font-mono font-medium text-lg">{card.cvv}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">4-Digit PIN</p>
                        <p className="font-mono font-medium text-lg">{card.pin || 'Not set'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Balance</p>
                        <p className="font-medium text-green-600">₹{card.balance?.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Status</p>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          card.status === 'active' ? 'bg-green-100 text-green-800' :
                          card.status === 'frozen' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        } capitalize`}>
                          {card.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">No cards found</p>
            )}

            <button
              onClick={() => {
                setShowCardsModal(false);
                setUserCards([]);
                setSelectedUser(null);
              }}
              className="mt-6 btn-secondary w-full"
            >
              Close
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}