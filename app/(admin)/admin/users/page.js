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
  TrashIcon,
  ArrowRightCircleIcon,
  MinusCircleIcon,
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
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferUser, setTransferUser] = useState(null);
  const [distributors, setDistributors] = useState([]);
  const [selectedDistributorId, setSelectedDistributorId] = useState('');
  const [showDeductModal, setShowDeductModal] = useState(false);
  const [deductAmount, setDeductAmount] = useState('');
  const [deductRemark, setDeductRemark] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [generatedPassword, setGeneratedPassword] = useState('');

  useEffect(() => {
    fetchUsers();
    fetchDistributors();
  }, []);

  const fetchDistributors = async () => {
    try {
      const res = await fetch('/api/admin/distributors');
      if (res.ok) {
        const data = await res.json();
        setDistributors(data.distributors || []);
      }
    } catch {}
  };

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

  const handleDeductBalance = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/users/deduct-balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedUser._id, amount: parseFloat(deductAmount), remark: deductRemark }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        setShowDeductModal(false);
        setDeductAmount('');
        setDeductRemark('');
        setSelectedUser(null);
        fetchUsers();
      } else {
        toast.error(data.error || 'Failed to deduct balance');
      }
    } catch { toast.error('Error deducting balance'); }
  };

  const handleTransferToDistributor = async () => {
    if (!selectedDistributorId) { toast.error('Please select a distributor'); return; }
    try {
      const res = await fetch('/api/admin/users/transfer-to-distributor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: transferUser._id, distributorId: selectedDistributorId }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        setShowTransferModal(false);
        setTransferUser(null);
        setSelectedDistributorId('');
        fetchUsers();
      } else {
        toast.error(data.error || 'Transfer failed');
      }
    } catch (error) {
      toast.error('Transfer failed');
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

  const handleDelete = async (userId) => {
    if (!confirm('Are you sure? This will delete user, cards, and transactions permanently.')) return;
    
    try {
      const res = await fetch('/api/admin/users/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (res.ok) {
        toast.success('User deleted');
        fetchUsers();
      }
    } catch (error) {
      toast.error('Failed to delete user');
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

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/users/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedUser._id, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setGeneratedPassword(data.newPassword);
        toast.success('Password reset successfully!');
      } else {
        toast.error(data.error || 'Failed to reset password');
      }
    } catch (error) {
      toast.error('Error resetting password');
    }
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(password);
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
                <th className="text-left py-4 px-4 font-semibold text-gray-900">Distributor</th>
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
                    <p className={`font-medium ${user.walletBalance < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                      {user.walletBalance < 0 ? '-' : ''}₹{Math.abs(user.walletBalance?.toFixed(2) || 0)}
                      {user.walletBalance < 0 && <span className="ml-1 text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full">Debt</span>}
                    </p>
                  </td>
                  <td className="py-4 px-4">
                    {user.distributorId ? (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                        {distributors.find(d => d._id === (user.distributorId?._id || user.distributorId))?.name || 'Assigned'}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
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
                          setShowPasswordModal(true);
                          setNewPassword('');
                          setGeneratedPassword('');
                        }}
                        className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                        title="Reset Password"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                      </button>
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
                        onClick={() => {
                          setSelectedUser(user);
                          setShowDeductModal(true);
                        }}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Deduct Balance"
                      >
                        <MinusCircleIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleViewCards(user)}
                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        title="View Cards"
                      >
                        <EyeIcon className="w-5 h-5" />
                      </button>
                      {user.role !== 'distributor' && user.role !== 'admin' && (
                        <button
                          onClick={() => { setTransferUser(user); setShowTransferModal(true); }}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Transfer to Distributor"
                        >
                          <ArrowRightCircleIcon className="w-5 h-5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(user._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete User"
                      >
                        <TrashIcon className="w-5 h-5" />
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

      {/* Reset Password Modal */}
      {showPasswordModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-2">Reset Password</h2>
            <p className="text-gray-500 text-sm mb-6">Reset password for <strong>{selectedUser.name}</strong></p>
            
            {generatedPassword ? (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <p className="text-sm text-green-800 mb-2">✓ Password reset successfully!</p>
                  <p className="text-xs text-green-700 mb-3">Share this password with the user:</p>
                  <div className="bg-white rounded-lg p-3 border border-green-300">
                    <p className="font-mono text-lg font-bold text-gray-900 text-center">{generatedPassword}</p>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generatedPassword);
                      toast.success('Password copied to clipboard!');
                    }}
                    className="mt-3 w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                  >
                    Copy Password
                  </button>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-xs text-yellow-800">⚠️ Save this password now. It cannot be retrieved later.</p>
                </div>
                <button
                  onClick={() => {
                    setShowPasswordModal(false);
                    setSelectedUser(null);
                    setNewPassword('');
                    setGeneratedPassword('');
                  }}
                  className="w-full btn-secondary"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                  <input
                    type="text"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password or generate one"
                    className="input-field"
                    required
                  />
                  <button
                    type="button"
                    onClick={generateRandomPassword}
                    className="mt-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    Generate Random Password
                  </button>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-800">💡 The password will be hashed and stored securely. Make sure to save it before closing.</p>
                </div>
                <div className="flex space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordModal(false);
                      setSelectedUser(null);
                      setNewPassword('');
                    }}
                    className="flex-1 btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 btn-primary">
                    Reset Password
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}

      {/* Deduct Balance Modal */}
      {showDeductModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-2 text-red-600">Deduct Wallet Balance</h2>
            <p className="text-gray-500 text-sm mb-6">Deduct amount from <strong>{selectedUser.name}</strong>&apos;s wallet</p>
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-600">Current Balance</p>
              <p className="text-2xl font-bold text-gray-900">₹{selectedUser.walletBalance?.toFixed(2) || '0.00'}</p>
            </div>
            <form onSubmit={handleDeductBalance} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount to Deduct (₹)</label>
                <input
                  type="number"
                  value={deductAmount}
                  onChange={(e) => setDeductAmount(e.target.value)}
                  placeholder="Enter amount"
                  min="1"
                  step="0.01"
                  required
                  className="input-field"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Remark</label>
                <textarea
                  value={deductRemark}
                  onChange={(e) => setDeductRemark(e.target.value)}
                  placeholder="e.g. Penalty charge, Refund adjustment, Fee deduction"
                  className="input-field"
                  rows="3"
                  required
                />
              </div>
              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowDeductModal(false); setDeductAmount(''); setDeductRemark(''); setSelectedUser(null); }}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                  Deduct
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Transfer to Distributor Modal */}
      {showTransferModal && transferUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-2">Assign to Distributor</h2>
            <p className="text-gray-500 text-sm mb-6">Assign this user under a distributor. All wallet, cards, and transaction history will be preserved.</p>

            <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Name:</span>
                <span className="font-semibold">{transferUser.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Email:</span>
                <span className="font-semibold">{transferUser.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Wallet:</span>
                <span className="font-semibold text-green-600">₹{transferUser.walletBalance?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Current Distributor:</span>
                <span className="font-semibold">{transferUser.distributorId ? distributors.find(d => d._id === transferUser.distributorId)?.name || 'Assigned' : 'None'}</span>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Distributor</label>
              <select
                value={selectedDistributorId}
                onChange={(e) => setSelectedDistributorId(e.target.value)}
                className="input-field"
                required
              >
                <option value="">-- Select Distributor --</option>
                {distributors.map(d => (
                  <option key={d._id} value={d._id}>{d.name} ({d.email})</option>
                ))}
              </select>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6">
              <p className="text-xs text-green-800">✓ Wallet balance preserved<br />✓ All cards remain intact<br />✓ Full transaction history kept<br />✓ Login credentials unchanged</p>
            </div>

            <div className="flex space-x-3">
              <button onClick={() => { setShowTransferModal(false); setTransferUser(null); setSelectedDistributorId(''); }} className="flex-1 btn-secondary">Cancel</button>
              <button onClick={handleTransferToDistributor} className="flex-1 btn-primary">Assign</button>
            </div>
          </motion.div>
        </div>
      )}

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