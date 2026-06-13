'use client';

import { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, UsersIcon, LockClosedIcon, LockOpenIcon, MinusCircleIcon } from '@heroicons/react/24/outline';
import { PageHeader, StatusBadge, ActionBtn, AdminModal } from '@/components/ui/AdminComponents';
import toast from 'react-hot-toast';

export default function MasterDistributorUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeductModal, setShowDeductModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [deductAmount, setDeductAmount] = useState('');
  const [deductRemark, setDeductRemark] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    setLoading(true);
    fetch('/api/masterdistributor/users')
      .then(r => r.json())
      .then(d => { setUsers(d.users || []); setLoading(false); })
      .catch(() => { toast.error('Failed to fetch users'); setLoading(false); });
  };

  const handleBlockUnblock = async (userId, currentStatus) => {
    const action = currentStatus === 'blocked' ? 'unblock' : 'block';
    const confirmMsg = action === 'block' 
      ? 'Are you sure you want to block this user? They will not be able to access their account.'
      : 'Are you sure you want to unblock this user?';
    
    if (!confirm(confirmMsg)) return;

    try {
      const res = await fetch('/api/masterdistributor/users/block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        fetchUsers();
      } else {
        toast.error(data.error || 'Failed to update user status');
      }
    } catch {
      toast.error('Something went wrong');
    }
  };

  const handleDeduct = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/masterdistributor/users/deduct', {
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
        toast.error(data.error || 'Failed to deduct');
      }
    } catch {
      toast.error('Something went wrong');
    }
  };

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="space-y-4 animate-pulse">
      <div className="h-12 bg-gray-200 rounded-2xl w-1/3" />
      <div className="h-64 bg-gray-200 rounded-2xl" />
    </div>
  );

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      <PageHeader icon={UsersIcon} title="All Users" subtitle="Users under your distributors" color="from-purple-500 to-pink-500"
        action={
          <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-3 py-1.5 rounded-xl">
            <span className="font-semibold text-gray-900">{filtered.length}</span> users
          </div>
        }
      />

      {/* Search */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <div className="relative">
          <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search users by name or email..." value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-300" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                {['Name', 'Email', 'Distributor', 'Wallet', 'Total Cards', 'Status', 'Joined', 'Actions'].map((h, i) => (
                  <th key={h} className={`py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide ${i === 7 ? 'text-right' : 'text-left'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 px-4"><p className="text-sm font-semibold text-gray-900">{user.name}</p></td>
                  <td className="py-3 px-4"><p className="text-sm text-gray-500">{user.email}</p></td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                      {user.distributorId?.name || '—'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <p className={`text-sm font-semibold ${user.walletBalance < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                      ₹{Math.abs(user.walletBalance?.toFixed(2) || 0)}
                    </p>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-violet-50 text-violet-700">
                      {user.totalCards || 0} {user.totalCards === 1 ? 'card' : 'cards'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {user.status === 'blocked' ? (
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">Blocked</span>
                    ) : (
                      <StatusBadge status={user.status} />
                    )}
                  </td>
                  <td className="py-3 px-4"><p className="text-xs text-gray-400">{new Date(user.createdAt).toLocaleDateString('en-IN')}</p></td>
                  <td className="py-3 px-4">
                    <div className="flex justify-end gap-1">
                      <ActionBtn
                        icon={MinusCircleIcon}
                        onClick={() => { setSelectedUser(user); setDeductAmount(''); setDeductRemark(''); setShowDeductModal(true); }}
                        color="text-orange-600 hover:bg-orange-50"
                        title="Deduct Wallet Balance"
                      />
                      {user.status === 'blocked' ? (
                        <ActionBtn icon={LockOpenIcon} onClick={() => handleBlockUnblock(user._id, user.status)} color="text-green-600 hover:bg-green-50" title="Unblock User" />
                      ) : (
                        <ActionBtn icon={LockClosedIcon} onClick={() => handleBlockUnblock(user._id, user.status)} color="text-red-600 hover:bg-red-50" title="Block User" />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <div className="text-center py-12 text-sm text-gray-400">No users found</div>}
      </div>
      {/* Deduct Modal */}
      {showDeductModal && selectedUser && (
        <AdminModal
          title="Deduct Wallet Balance"
          subtitle={`From ${selectedUser.name} · Current: ₹${selectedUser.walletBalance?.toFixed(2) || '0.00'}`}
          onClose={() => { setShowDeductModal(false); setDeductAmount(''); setDeductRemark(''); setSelectedUser(null); }}
        >
          <form onSubmit={handleDeduct} className="space-y-4">
            <div className="bg-red-50 border border-red-100 rounded-xl p-4">
              <p className="text-xs text-gray-500">Current Wallet Balance</p>
              <p className="text-2xl font-bold text-gray-900">₹{selectedUser.walletBalance?.toFixed(2) || '0.00'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Amount to Deduct (₹) <span className="text-red-500">*</span></label>
              <input
                type="number"
                value={deductAmount}
                onChange={e => setDeductAmount(e.target.value)}
                className="input-field"
                min="0.01"
                max={selectedUser.walletBalance}
                step="0.01"
                required
                autoFocus
                placeholder="Enter amount"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Reason <span className="text-red-500">*</span></label>
              <textarea
                value={deductRemark}
                onChange={e => setDeductRemark(e.target.value)}
                className="input-field resize-none"
                rows={3}
                required
                placeholder="Reason for deduction..."
              />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => { setShowDeductModal(false); setDeductAmount(''); setDeductRemark(''); setSelectedUser(null); }} className="flex-1 btn-secondary">Cancel</button>
              <button type="submit" className="flex-1 py-3 rounded-xl bg-orange-600 text-white font-semibold hover:bg-orange-700">Deduct Balance</button>
            </div>
          </form>
        </AdminModal>
      )}
    </div>
  );
}
