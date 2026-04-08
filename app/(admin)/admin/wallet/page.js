'use client';

import { useState, useEffect } from 'react';
import { WalletIcon, PlusCircleIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { PageHeader, AdminModal } from '@/components/ui/AdminComponents';

export default function AdminWalletPage() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');

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

  const handleAddBalance = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/users/add-balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: selectedUser._id, 
          amount: parseFloat(amount),
          reason: reason
        }),
      });
      
      if (res.ok) {
        toast.success('Balance added successfully!');
        setShowModal(false);
        setAmount('');
        setReason('');
        setSelectedUser(null);
        fetchUsers();
      } else {
        const data = await res.json();
        toast.error(data.message || 'Failed to add balance');
      }
    } catch (error) {
      toast.error('Error adding balance');
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <PageHeader icon={WalletIcon} title="Wallet Management" subtitle="Add balance to user wallets" color="from-emerald-500 to-green-600" />

      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <div className="relative">
          <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search users..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200" />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="space-y-3 p-4">{[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filteredUsers.map((user) => (
              <div key={user._id} className="flex items-center justify-between p-4 hover:bg-gray-50/50 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-400">{user.email}</p>
                  <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium ${
                    user.role === 'admin' ? 'bg-red-50 text-red-700' :
                    user.role === 'corporate' ? 'bg-purple-50 text-purple-700' :
                    user.role === 'employee' ? 'bg-blue-50 text-blue-700' :
                    'bg-green-50 text-green-700'
                  }`}>{user.role}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Balance</p>
                    <p className="text-lg font-bold text-gray-900">₹{user.walletBalance?.toFixed(2) || '0.00'}</p>
                  </div>
                  <button onClick={() => { setSelectedUser(user); setShowModal(true); }} className="w-9 h-9 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-700 transition-colors">
                    <PlusCircleIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        {!loading && filteredUsers.length === 0 && <div className="text-center py-12 text-sm text-gray-400">No users found</div>}
      </div>

      {showModal && selectedUser && (
        <AdminModal title="Add Wallet Balance" subtitle={`To ${selectedUser.name}'s wallet · Current: ₹${selectedUser.walletBalance?.toFixed(2) || '0.00'}`} onClose={() => { setShowModal(false); setAmount(''); setReason(''); setSelectedUser(null); }}>
          <form onSubmit={handleAddBalance} className="space-y-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Amount to Add</label><input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Enter amount" min="1" step="0.01" required className="input-field" autoFocus /></div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Reason</label>
              <select value={reason} onChange={(e) => setReason(e.target.value)} required className="input-field">
                <option value="">Select reason</option>
                {['Card Loading Amount','Settlement','Commission','Bonus','Refund','Cashback','Reward','Other'].map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => { setShowModal(false); setAmount(''); setReason(''); setSelectedUser(null); }} className="flex-1 btn-secondary">Cancel</button>
              <button type="submit" className="flex-1 btn-primary">Add Balance</button>
            </div>
          </form>
        </AdminModal>
      )}
    </div>
  );
}
