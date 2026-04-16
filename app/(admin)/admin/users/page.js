'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  CheckCircleIcon, XCircleIcon, MagnifyingGlassIcon, FunnelIcon,
  PlusCircleIcon, NoSymbolIcon, EyeIcon, CheckIcon, TrashIcon,
  ArrowRightCircleIcon, MinusCircleIcon, UserGroupIcon, WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline';
import { PageHeader, AdminTable, StatusBadge, AdminModal, ActionBtn } from '@/components/ui/AdminComponents';

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
  const [maintenanceUsers, setMaintenanceUsers] = useState(new Set());
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [maintenanceTarget, setMaintenanceTarget] = useState(null);
  const [maintenanceMessage, setMaintenanceMessage] = useState('');

  const MAINTENANCE_PRESETS = [
    {
      label: 'System Update (Default)',
      text: 'We would like to inform you that due to an internal system update, our platform is currently under maintenance.\n\nDuring this period, certain services may be temporarily unavailable. We request you to kindly hold your transactions until the maintenance is completed.\n\nOur team is actively working to restore all services at the earliest.',
    },
    {
      label: 'Scheduled Update — 21st April 2026',
      text: 'We would like to inform you that our platform will undergo a scheduled internal system update on 21st April 2026.\n\nDuring this period, certain services may be temporarily unavailable. We request you to kindly hold your transactions until the update is completed.\n\nOur team is actively working to restore all services at the earliest.',
    },
  ];

  useEffect(() => {
    fetchUsers();
    fetchDistributors();
  }, []);

  const handleToggleMaintenance = async (userId, enabled) => {
    const id = userId.toString();
    try {
      const res = await fetch('/api/admin/users/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userId: id, enabled, message: enabled ? maintenanceMessage : '' }),
      });
      if (res.ok) {
        toast.success(`Maintenance mode ${enabled ? 'enabled 🔧' : 'disabled ✓'} for user`);
        setMaintenanceUsers(prev => {
          const next = new Set(prev);
          enabled ? next.add(id) : next.delete(id);
          return next;
        });
        setShowMaintenanceModal(false);
        setMaintenanceTarget(null);
        setMaintenanceMessage('');
      } else {
        const d = await res.json();
        toast.error(d.error || 'Failed to update maintenance mode');
      }
    } catch { toast.error('Failed to update maintenance mode'); }
  };

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
      const [usersRes, settingsRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/users/maintenance-status', { credentials: 'include' }).catch(() => null),
      ]);
      if (usersRes.ok) {
        const data = await usersRes.json();
        setUsers(data.users || []);
      }
      if (settingsRes?.ok) {
        const data = await settingsRes.json();
        setMaintenanceUsers(new Set((data.maintenanceUserIds || []).map(String)));
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

  if (loading) return (
    <div className="space-y-4 animate-pulse">
      <div className="h-12 bg-gray-200 rounded-2xl w-1/3" />
      <div className="h-64 bg-gray-200 rounded-2xl" />
    </div>
  );

  return (
    <div className="space-y-5">
      <PageHeader icon={UserGroupIcon} title="User Management" subtitle="Approve, reject and manage user accounts" color="from-blue-500 to-cyan-500"
        action={
          <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-3 py-1.5 rounded-xl">
            <span className="font-semibold text-gray-900">{filteredUsers.length}</span> users
          </div>
        }
      />

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search users..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300" />
          </div>
          <div className="flex gap-1 bg-gray-50 rounded-xl p-1">
            {['all','pending','approved','rejected','blocked'].map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all ${filter === f ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>{f}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                {['Name','Email','Role','Status','Wallet','Distributor','Joined','Actions'].map((h,i) => (
                  <th key={h} className={`py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide ${i===7?'text-right':'text-left'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 px-4"><p className="text-sm font-semibold text-gray-900">{user.name}</p></td>
                  <td className="py-3 px-4"><p className="text-sm text-gray-500">{user.email}</p></td>
                  <td className="py-3 px-4"><span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 capitalize">{user.role}</span></td>
                  <td className="py-3 px-4"><StatusBadge status={user.status} /></td>
                  <td className="py-3 px-4"><p className={`text-sm font-semibold ${user.walletBalance < 0 ? 'text-red-600' : 'text-gray-900'}`}>₹{Math.abs(user.walletBalance?.toFixed(2) || 0)}{user.walletBalance < 0 && <span className="ml-1 text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full">Debt</span>}</p></td>
                  <td className="py-3 px-4">{user.distributorId ? <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">{distributors.find(d => d._id === (user.distributorId?._id || user.distributorId))?.name || 'Assigned'}</span> : <span className="text-xs text-gray-400">—</span>}</td>
                  <td className="py-3 px-4"><p className="text-xs text-gray-400">{new Date(user.createdAt).toLocaleDateString('en-IN')}</p></td>
                  <td className="py-3 px-4">
                    <div className="flex justify-end gap-1">
                      <ActionBtn icon={() => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>} onClick={() => { setSelectedUser(user); setShowPasswordModal(true); setNewPassword(''); setGeneratedPassword(''); }} color="text-yellow-600 hover:bg-yellow-50" title="Reset Password" />
                      {/* View User Panel */}
                      <a
                        href={`/api/admin/users/impersonate?userId=${user._id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="View User Panel"
                        className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 transition-colors inline-flex items-center"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </a>
                      <ActionBtn icon={PlusCircleIcon} onClick={() => { setSelectedUser(user); setShowBalanceModal(true); }} color="text-blue-600 hover:bg-blue-50" title="Add Balance" />
                      <ActionBtn icon={MinusCircleIcon} onClick={() => { setSelectedUser(user); setShowDeductModal(true); }} color="text-red-500 hover:bg-red-50" title="Deduct Balance" />
                      <ActionBtn icon={EyeIcon} onClick={() => handleViewCards(user)} color="text-purple-600 hover:bg-purple-50" title="View Cards" />
                      {user.role !== 'distributor' && user.role !== 'admin' && <ActionBtn icon={ArrowRightCircleIcon} onClick={() => { setTransferUser(user); setShowTransferModal(true); }} color="text-indigo-600 hover:bg-indigo-50" title="Transfer to Distributor" />}
                      <ActionBtn icon={TrashIcon} onClick={() => handleDelete(user._id)} color="text-red-600 hover:bg-red-50" title="Delete" />
                      {user.status === 'blocked' ? <ActionBtn icon={CheckIcon} onClick={() => handleUnblock(user._id)} color="text-green-600 hover:bg-green-50" title="Unblock" /> : <ActionBtn icon={NoSymbolIcon} onClick={() => handleBlock(user._id)} color="text-orange-600 hover:bg-orange-50" title="Block" />}
                      {user.status === 'pending' && <><ActionBtn icon={CheckCircleIcon} onClick={() => handleApprove(user._id)} color="text-green-600 hover:bg-green-50" title="Approve" /><ActionBtn icon={XCircleIcon} onClick={() => handleReject(user._id)} color="text-red-600 hover:bg-red-50" title="Reject" /></>}
                      {/* Maintenance toggle */}
                      <button
                        onClick={() => handleToggleMaintenance(user._id, !maintenanceUsers.has(user._id.toString()))}
                        title={maintenanceUsers.has(user._id.toString()) ? 'Disable Maintenance Mode' : 'Enable Maintenance Mode'}
                        className={`p-1.5 rounded-lg transition-colors ${
                          maintenanceUsers.has(user._id.toString())
                            ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                            : 'text-gray-400 hover:bg-amber-50 hover:text-amber-600'
                        }`}
                      >
                        <WrenchScrewdriverIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredUsers.length === 0 && <div className="text-center py-12 text-sm text-gray-400">No users found</div>}
      </div>

      {/* Reset Password Modal */}
      {showPasswordModal && selectedUser && (
        <AdminModal title="Reset Password" subtitle={`For ${selectedUser.name}`} onClose={() => { setShowPasswordModal(false); setSelectedUser(null); setNewPassword(''); setGeneratedPassword(''); }}>
          {generatedPassword ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <p className="text-sm text-green-800 mb-2">✓ Password reset successfully!</p>
                <div className="bg-white rounded-lg p-3 border border-green-200 font-mono text-lg font-bold text-center text-gray-900">{generatedPassword}</div>
                <button onClick={() => { navigator.clipboard.writeText(generatedPassword); toast.success('Copied!'); }} className="mt-3 w-full py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">Copy Password</button>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">⚠️ Save this password now. It cannot be retrieved later.</div>
              <button onClick={() => { setShowPasswordModal(false); setSelectedUser(null); setNewPassword(''); setGeneratedPassword(''); }} className="w-full btn-secondary">Close</button>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
                <input type="text" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter or generate password" className="input-field" required />
                <button type="button" onClick={generateRandomPassword} className="mt-1.5 text-xs text-indigo-600 hover:text-indigo-700 font-medium">Generate Random Password</button>
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-700">Password will be hashed and stored securely. Save it before closing.</div>
              <div className="flex gap-3">
                <button type="button" onClick={() => { setShowPasswordModal(false); setSelectedUser(null); setNewPassword(''); }} className="flex-1 btn-secondary">Cancel</button>
                <button type="submit" className="flex-1 btn-primary">Reset Password</button>
              </div>
            </form>
          )}
        </AdminModal>
      )}

      {/* Deduct Balance Modal */}
      {showDeductModal && selectedUser && (
        <AdminModal title="Deduct Balance" subtitle={`From ${selectedUser.name}'s wallet`} onClose={() => { setShowDeductModal(false); setDeductAmount(''); setDeductRemark(''); setSelectedUser(null); }}>
          <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-4">
            <p className="text-xs text-gray-500">Current Balance</p>
            <p className="text-2xl font-bold text-gray-900">₹{selectedUser.walletBalance?.toFixed(2) || '0.00'}</p>
          </div>
          <form onSubmit={handleDeductBalance} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Amount to Deduct (₹)</label>
              <input type="number" value={deductAmount} onChange={(e) => setDeductAmount(e.target.value)} placeholder="Enter amount" min="1" step="0.01" required className="input-field" autoFocus />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Remark</label>
              <textarea value={deductRemark} onChange={(e) => setDeductRemark(e.target.value)} placeholder="Reason for deduction" className="input-field" rows="3" required />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => { setShowDeductModal(false); setDeductAmount(''); setDeductRemark(''); setSelectedUser(null); }} className="flex-1 btn-secondary">Cancel</button>
              <button type="submit" className="flex-1 py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700">Deduct</button>
            </div>
          </form>
        </AdminModal>
      )}

      {/* Transfer to Distributor Modal */}
      {showTransferModal && transferUser && (
        <AdminModal title="Assign to Distributor" subtitle="All data will be preserved" onClose={() => { setShowTransferModal(false); setTransferUser(null); setSelectedDistributorId(''); }}>
          <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-1.5 text-sm">
            {[['Name', transferUser.name], ['Email', transferUser.email], ['Wallet', `₹${transferUser.walletBalance?.toFixed(2)}`], ['Current Distributor', transferUser.distributorId ? distributors.find(d => d._id === transferUser.distributorId)?.name || 'Assigned' : 'None']].map(([k,v]) => (
              <div key={k} className="flex justify-between"><span className="text-gray-500">{k}</span><span className="font-semibold">{v}</span></div>
            ))}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Select Distributor</label>
            <select value={selectedDistributorId} onChange={(e) => setSelectedDistributorId(e.target.value)} className="input-field" required>
              <option value="">-- Select Distributor --</option>
              {distributors.map(d => <option key={d._id} value={d._id}>{d.name} ({d.email})</option>)}
            </select>
          </div>
          <div className="bg-green-50 border border-green-100 rounded-lg p-3 mb-4 text-xs text-green-700">✓ Wallet, cards, transactions & credentials preserved</div>
          <div className="flex gap-3">
            <button onClick={() => { setShowTransferModal(false); setTransferUser(null); setSelectedDistributorId(''); }} className="flex-1 btn-secondary">Cancel</button>
            <button onClick={handleTransferToDistributor} className="flex-1 btn-primary">Assign</button>
          </div>
        </AdminModal>
      )}

      {/* Add Balance Modal */}
      {showBalanceModal && selectedUser && (
        <AdminModal title="Add Wallet Balance" subtitle={`To ${selectedUser.name}'s wallet`} onClose={() => { setShowBalanceModal(false); setBalanceAmount(''); setSelectedUser(null); }}>
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-4">
            <p className="text-xs text-gray-500">Current Balance</p>
            <p className="text-2xl font-bold text-gray-900">₹{selectedUser.walletBalance?.toFixed(2) || '0.00'}</p>
          </div>
          <form onSubmit={handleAddBalance} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Amount to Add</label>
              <input type="number" value={balanceAmount} onChange={(e) => setBalanceAmount(e.target.value)} placeholder="Enter amount" min="1" step="0.01" required className="input-field" autoFocus />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => { setShowBalanceModal(false); setBalanceAmount(''); setSelectedUser(null); }} className="flex-1 btn-secondary">Cancel</button>
              <button type="submit" className="flex-1 btn-primary">Add Balance</button>
            </div>
          </form>
        </AdminModal>
      )}

      {/* View Cards Modal */}
      {showCardsModal && selectedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div><h2 className="text-lg font-bold text-gray-900">{selectedUser.name}&apos;s Cards</h2><p className="text-xs text-gray-400">{selectedUser.email}</p></div>
              <button onClick={() => { setShowCardsModal(false); setUserCards([]); setSelectedUser(null); }} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"><svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <div className="p-6">
              {userCards.length > 0 ? (
                <div className="space-y-3">
                  {userCards.map((card) => (
                    <div key={card._id} className="bg-gray-50 rounded-xl p-4 grid grid-cols-2 gap-3">
                      {[['Card Number', card.cardNumber], ['Expiry', card.expiryDate], ['CVV', card.cvv], ['PIN', card.pin || 'Not set'], ['Balance', `₹${card.balance?.toFixed(2)}`]].map(([k,v]) => (
                        <div key={k}><p className="text-xs text-gray-400">{k}</p><p className="font-mono font-semibold text-sm">{v}</p></div>
                      ))}
                      <div><p className="text-xs text-gray-400">Status</p><StatusBadge status={card.status} /></div>
                    </div>
                  ))}
                </div>
              ) : <p className="text-center text-gray-400 py-8">No cards found</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}