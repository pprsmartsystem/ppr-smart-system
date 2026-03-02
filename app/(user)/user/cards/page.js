'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCardIcon, PlusIcon } from '@heroicons/react/24/outline';
import VirtualCard from '@/components/cards/VirtualCard';
import toast from 'react-hot-toast';

export default function CardsPage() {
  const [cards, setCards] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ amount: '', pin: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [userRes, cardsRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/user/cards')
      ]);
      
      if (userRes.ok) setUser(await userRes.json());
      if (cardsRes.ok) {
        const data = await cardsRes.json();
        setCards(data.cards || []);
      }
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchCards = fetchData;

  const handleCreateCard = async (e) => {
    e.preventDefault();
    try {
      if (!formData.amount || !formData.pin) {
        toast.error('Please fill all fields');
        return;
      }

      if (formData.pin.length !== 4) {
        toast.error('PIN must be 4 digits');
        return;
      }

      const res = await fetch('/api/user/cards/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          amount: parseFloat(formData.amount),
          pin: formData.pin
        }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        toast.success('Card created successfully!');
        setShowModal(false);
        setFormData({ amount: '', pin: '' });
        fetchData();
      } else {
        toast.error(data.message || 'Failed to create card');
      }
    } catch (error) {
      toast.error('Error creating card');
    }
  };

  const handleDeleteCard = async (cardId) => {
    if (!confirm('Are you sure you want to delete this card?')) return;
    
    try {
      const res = await fetch(`/api/user/cards/${cardId}`, {
        method: 'DELETE',
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
          <h1 className="text-3xl font-bold text-gray-900">My Cards</h1>
          <p className="text-gray-600 mt-2">Manage your virtual cards • Wallet: ₹{user?.walletBalance?.toFixed(2) || '0.00'}</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <PlusIcon className="w-4 h-4 mr-2" />
          New Card
        </button>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-200 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : cards.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card, index) => (
            <motion.div key={card._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
              <VirtualCard card={card} onDelete={handleDeleteCard} />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 stats-card">
          <CreditCardIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No cards yet</h3>
          <p className="text-gray-600 mb-6">Create your first virtual card</p>
          <button onClick={handleCreateCard} className="btn-primary">
            <PlusIcon className="w-4 h-4 mr-2" />
            Create Card
          </button>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4">Create New Card</h2>
            <p className="text-gray-600 mb-6">Available Balance: <strong>₹{user?.walletBalance?.toFixed(2) || '0.00'}</strong></p>
            <form onSubmit={handleCreateCard} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Card Amount</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  placeholder="Enter amount to load"
                  min="1"
                  max={user?.walletBalance || 0}
                  step="0.01"
                  required
                  className="input-field"
                />
                <p className="text-xs text-gray-500 mt-1">Amount will be deducted from your wallet</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">4-Digit PIN</label>
                <input
                  type="password"
                  value={formData.pin}
                  onChange={(e) => setFormData({...formData, pin: e.target.value.replace(/\D/g, '').slice(0, 4)})}
                  placeholder="Enter 4-digit PIN"
                  maxLength="4"
                  required
                  className="input-field"
                />
                <p className="text-xs text-gray-500 mt-1">Set a secure PIN for transactions</p>
              </div>
              <div className="flex space-x-3 pt-4">
                <button type="button" onClick={() => { setShowModal(false); setFormData({ amount: '', pin: '' }); }} className="flex-1 btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="flex-1 btn-primary">
                  Create Card
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
