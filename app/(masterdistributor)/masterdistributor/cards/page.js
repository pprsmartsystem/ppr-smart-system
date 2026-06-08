'use client';

import { useState, useEffect } from 'react';
import { CreditCardIcon, MagnifyingGlassIcon, LockClosedIcon, LockOpenIcon, TrashIcon } from '@heroicons/react/24/outline';
import { PageHeader, StatusBadge, ActionBtn } from '@/components/ui/AdminComponents';
import toast from 'react-hot-toast';

export default function MasterDistributorCardsPage() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = () => {
    setLoading(true);
    fetch('/api/masterdistributor/cards')
      .then(r => r.json())
      .then(d => { setCards(d.cards || []); setLoading(false); })
      .catch(() => { toast.error('Failed to fetch cards'); setLoading(false); });
  };

  const handleFreeze = async (cardId, currentStatus) => {
    const action = currentStatus === 'frozen' ? 'unfreeze' : 'freeze';
    const confirmMsg = action === 'freeze'
      ? 'Are you sure you want to freeze this card? The user will not be able to use it.'
      : 'Are you sure you want to unfreeze this card?';

    if (!confirm(confirmMsg)) return;

    try {
      const res = await fetch('/api/masterdistributor/cards/freeze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardId, action }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        fetchCards();
      } else {
        toast.error(data.error || 'Failed to update card');
      }
    } catch {
      toast.error('Something went wrong');
    }
  };

  const handleDelete = async (cardId, cardNumber) => {
    const reason = prompt(`Delete card ${cardNumber}?\n\nReason (e.g., PIN forgotten, security concern):`);
    if (!reason || !reason.trim()) return;

    try {
      const res = await fetch('/api/masterdistributor/cards/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardId, reason: reason.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        fetchCards();
      } else {
        toast.error(data.error || 'Failed to delete card');
      }
    } catch {
      toast.error('Something went wrong');
    }
  };

  const filtered = cards.filter(c =>
    c.cardNumber?.includes(searchTerm) ||
    c.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="space-y-4 animate-pulse">
      <div className="h-12 bg-gray-200 rounded-2xl w-1/3" />
      <div className="h-64 bg-gray-200 rounded-2xl" />
    </div>
  );

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      <PageHeader 
        icon={CreditCardIcon} 
        title="All Cards" 
        subtitle="Manage virtual cards under your network" 
        color="from-violet-500 to-purple-600"
        action={
          <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-3 py-1.5 rounded-xl">
            <span className="font-semibold text-gray-900">{filtered.length}</span> cards
          </div>
        }
      />

      {/* Search */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <div className="relative">
          <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by card number, user name or email..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-300" 
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Cards', value: cards.length, color: 'bg-violet-50 text-violet-700' },
          { label: 'Active', value: cards.filter(c => c.status === 'active').length, color: 'bg-green-50 text-green-700' },
          { label: 'Frozen', value: cards.filter(c => c.status === 'frozen').length, color: 'bg-blue-50 text-blue-700' },
          { label: 'Expired', value: cards.filter(c => c.status === 'expired').length, color: 'bg-gray-50 text-gray-600' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color.split(' ')[1]}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                {['Card Number', 'User', 'Distributor', 'Balance', 'Limit', 'Status', 'Created', 'Actions'].map((h, i) => (
                  <th key={h} className={`py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide ${i === 7 ? 'text-right' : 'text-left'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((card) => (
                <tr key={card._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                        <CreditCardIcon className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-mono font-semibold text-gray-900">
                          {card.cardNumber ? `•••• •••• •••• ${card.cardNumber.slice(-4)}` : '•••• •••• •••• ••••'}
                        </p>
                        <p className="text-xs text-gray-400">Exp: {card.expiryDate}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-sm font-semibold text-gray-900">{card.userId?.name}</p>
                    <p className="text-xs text-gray-400">{card.userId?.email}</p>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                      {card.distributorName || '—'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-sm font-semibold text-gray-900">₹{card.balance?.toFixed(2) || '0.00'}</p>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-sm text-gray-500">₹{card.spendingLimit?.toLocaleString('en-IN') || '0'}</p>
                  </td>
                  <td className="py-3 px-4">
                    {card.status === 'frozen' ? (
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">Frozen</span>
                    ) : card.status === 'expired' ? (
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">Expired</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">Active</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-xs text-gray-400">{new Date(card.createdAt).toLocaleDateString('en-IN')}</p>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex justify-end gap-1">
                      {card.status === 'frozen' ? (
                        <ActionBtn 
                          icon={LockOpenIcon} 
                          onClick={() => handleFreeze(card._id, card.status)} 
                          color="text-green-600 hover:bg-green-50" 
                          title="Unfreeze Card" 
                        />
                      ) : card.status === 'active' ? (
                        <ActionBtn 
                          icon={LockClosedIcon} 
                          onClick={() => handleFreeze(card._id, card.status)} 
                          color="text-blue-600 hover:bg-blue-50" 
                          title="Freeze Card" 
                        />
                      ) : null}
                      <ActionBtn 
                        icon={TrashIcon} 
                        onClick={() => handleDelete(card._id, card.cardNumber)} 
                        color="text-red-600 hover:bg-red-50" 
                        title="Delete Card" 
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-sm text-gray-400">No cards found</div>
        )}
      </div>
    </div>
  );
}
