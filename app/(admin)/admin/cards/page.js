'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCardIcon, PlusIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function AdminCardsPage() {
  const [users, setUsers] = useState([]);
  const [cards, setCards] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [formData, setFormData] = useState({ userId: '', amount: '', spendingLimit: '5000' });
  const [editData, setEditData] = useState({ spendingLimit: '', status: '' });

  useEffect(() => {
    fetchUsers();
    fetchCards();
  }, []);

  const fetchUsers = async () => {
    const res = await fetch('/api/admin/users');
    if (res.ok) {
      const data = await res.json();
      setUsers(data.users?.filter(u => u.status === 'approved') || []);
    }
  };

  const fetchCards = async () => {
    const res = await fetch('/api/admin/cards');
    if (res.ok) {
      const data = await res.json();
      setCards(data.cards || []);
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
        fetchCards();
      } else {
        toast.error('Failed to issue card');
      }
    } catch (error) {
      toast.error('Error issuing card');
    }
  };

  const handleEditCard = (card) => {
    setSelectedCard(card);
    setEditData({ 
      spendingLimit: card.spendingLimit.toString(), 
      status: card.status 
    });
    setShowEditModal(true);
  };

  const handleUpdateCard = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/cards/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardId: selectedCard._id,
          spendingLimit: parseFloat(editData.spendingLimit),
          status: editData.status,
        }),
      });
      
      if (res.ok) {
        toast.success('Card updated successfully!');
        setShowEditModal(false);
        setSelectedCard(null);
        fetchCards();
      } else {
        toast.error('Failed to update card');
      }
    } catch (error) {
      toast.error('Error updating card');
    }
  };

  const handleDeleteCard = async (cardId) => {
    if (!confirm('Are you sure you want to delete this card?')) return;
    
    try {
      const res = await fetch('/api/admin/cards/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardId }),
      });
      
      if (res.ok) {
        toast.success('Card deleted successfully!');
        fetchCards();
      } else {
        toast.error('Failed to delete card');
      }
    } catch (error) {
      toast.error('Error deleting card');
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

      {/* Issue Card Modal */}
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

      {/* Edit Card Modal */}
      {showEditModal && selectedCard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-6">Edit Card</h2>
            <form onSubmit={handleUpdateCard} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
                <input type="text" value={`•••• •••• •••• ${selectedCard.cardNumber.slice(-4)}`} disabled className="input-field bg-gray-100" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Spending Limit</label>
                <input 
                  type="number" 
                  value={editData.spendingLimit} 
                  onChange={(e) => setEditData({...editData, spendingLimit: e.target.value})} 
                  min="100" 
                  step="100" 
                  required 
                  className="input-field" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select 
                  value={editData.status} 
                  onChange={(e) => setEditData({...editData, status: e.target.value})} 
                  className="input-field"
                >
                  <option value="active">Active</option>
                  <option value="frozen">Frozen</option>
                  <option value="expired">Expired</option>
                </select>
              </div>
              <div className="flex space-x-3 pt-4">
                <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 btn-secondary">Cancel</button>
                <button type="submit" className="flex-1 btn-primary">Update Card</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      <div className="stats-card">
        {cards.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">Card Number</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">User</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">Balance</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">Limit</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">Status</th>
                  <th className="text-right py-4 px-4 font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {cards.map((card) => (
                  <tr key={card._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4 font-mono">
                      •••• •••• •••• {card.cardNumber.slice(-4)}
                    </td>
                    <td className="py-4 px-4">
                      {card.userId?.name || 'Unknown'}
                    </td>
                    <td className="py-4 px-4">
                      ₹{card.balance?.toFixed(2)}
                    </td>
                    <td className="py-4 px-4">
                      ₹{card.spendingLimit?.toFixed(2)}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        card.status === 'active' ? 'bg-green-100 text-green-800' :
                        card.status === 'frozen' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      } capitalize`}>
                        {card.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleEditCard(card)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Card"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteCard(card._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Card"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <CreditCardIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No cards issued yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
