'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCardIcon, PlusIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function AdminCardsPage() {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ userId: '', amount: '', spendingLimit: '5000' });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const res = await fetch('/api/admin/users');
    if (res.ok) {
      const data = await res.json();
      setUsers(data.users?.filter(u => u.status === 'approved') || []);
    }
  };

  const handleIssueCard = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/cards/issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: formData.userId,
          amount: parseFloat(formData.amount),
          spendingLimit: parseFloat(formData.spendingLimit),
        }),
      });
      
      if (res.ok) {
        toast.success('Card issued successfully!');
        setShowModal(false);
        setFormData({ userId: '', amount: '', spendingLimit: '5000' });
      } else {
        toast.error('Failed to issue card');
      }
    } catch (error) {
      toast.error('Error issuing card');
    }
  };

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cards Management</h1>
          <p className="text-gray-600 mt-2">Issue cards to users and corporates</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <PlusIcon className="w-4 h-4 mr-2" />
          Issue Card
        </button>
      </motion.div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-6">Issue New Card</h2>
            <form onSubmit={handleIssueCard} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select User</label>
                <select value={formData.userId} onChange={(e) => setFormData({...formData, userId: e.target.value})} required className="input-field">
                  <option value="">Choose user...</option>
                  {users.map(user => (
                    <option key={user._id} value={user._id}>{user.name} ({user.email})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Initial Balance</label>
                <input type="number" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} placeholder="0.00" min="0" step="0.01" required className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Spending Limit</label>
                <input type="number" value={formData.spendingLimit} onChange={(e) => setFormData({...formData, spendingLimit: e.target.value})} placeholder="5000" min="100" step="100" required className="input-field" />
              </div>
              <div className="flex space-x-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 btn-secondary">Cancel</button>
                <button type="submit" className="flex-1 btn-primary">Issue Card</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      <div className="stats-card text-center py-12">
        <CreditCardIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Click "Issue Card" to create a new card for users</p>
      </div>
    </div>
  );
}
