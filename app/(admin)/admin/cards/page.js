'use client';

import { useState, useEffect } from 'react';
import { CreditCardIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { PageHeader, StatusBadge, AdminModal } from '@/components/ui/AdminComponents';

export default function AdminCardsPage() {
  const [users, setUsers] = useState([]);
  const [cards, setCards] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ userId: '', amount: '', spendingLimit: '5000' });

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
    <div className="space-y-5">
      <PageHeader icon={CreditCardIcon} title="Cards Management" subtitle="Issue and manage virtual cards" color="from-purple-500 to-violet-600"
        action={<button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700"><PlusIcon className="w-4 h-4" />Issue Card</button>}
      />

      {showModal && (
        <AdminModal title="Issue New Card" onClose={() => setShowModal(false)}>
          <form onSubmit={handleIssueCard} className="space-y-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Select User</label><select value={formData.userId} onChange={(e) => setFormData({...formData, userId: e.target.value})} required className="input-field"><option value="">Choose user...</option>{users.map(user => <option key={user._id} value={user._id}>{user.name} ({user.email})</option>)}</select></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Initial Balance</label><input type="number" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} placeholder="0.00" min="0" step="0.01" required className="input-field" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Spending Limit</label><input type="number" value={formData.spendingLimit} onChange={(e) => setFormData({...formData, spendingLimit: e.target.value})} placeholder="5000" min="100" step="100" required className="input-field" /></div>
            <div className="flex gap-3"><button type="button" onClick={() => setShowModal(false)} className="flex-1 btn-secondary">Cancel</button><button type="submit" className="flex-1 btn-primary">Issue Card</button></div>
          </form>
        </AdminModal>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {cards.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-gray-100 bg-gray-50/50">{['Card Number','User','Balance','Status','Actions'].map((h,i) => <th key={h} className={`py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide ${i===4?'text-right':'text-left'}`}>{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-gray-50">
                {cards.map((card) => (
                  <tr key={card._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4 font-mono text-sm">•••• •••• •••• {card.cardNumber.slice(-4)}</td>
                    <td className="py-3 px-4 text-sm text-gray-700">{card.userId?.name || 'Unknown'}</td>
                    <td className="py-3 px-4 text-sm font-semibold text-gray-900">₹{card.balance?.toFixed(2)}</td>
                    <td className="py-3 px-4"><StatusBadge status={card.status} /></td>
                    <td className="py-3 px-4 text-right"><button onClick={() => handleDeleteCard(card._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><TrashIcon className="w-4 h-4" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12"><CreditCardIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" /><p className="text-sm text-gray-400">No cards issued yet</p></div>
        )}
      </div>
    </div>
  );
}
