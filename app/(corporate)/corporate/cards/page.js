'use client';

import { useState, useEffect } from 'react';
import { CreditCardIcon } from '@heroicons/react/24/outline';
import { formatCurrency } from '@/utils/cardUtils';
import toast from 'react-hot-toast';

export default function CorporateCardsPage() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      const res = await fetch('/api/corporate/cards');
      if (res.ok) {
        const data = await res.json();
        setCards(data.cards || []);
      }
    } catch (error) {
      toast.error('Failed to load cards');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Employee Cards</h1>
        <p className="text-gray-600 mt-2">View all employee virtual cards</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Card Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Balance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Limit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {cards.map((card) => (
                <tr key={card._id}>
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{card.userId?.name}</p>
                    <p className="text-xs text-gray-500">{card.userId?.email}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 font-mono">
                    {card.cardNumber.replace(/(\d{4})/g, '$1 ')}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                    {formatCurrency(card.balance)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {formatCurrency(card.spendingLimit)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      card.status === 'active' ? 'bg-green-100 text-green-800' :
                      card.status === 'frozen' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {card.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(card.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
