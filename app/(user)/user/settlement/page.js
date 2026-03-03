'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { BanknotesIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';

export default function SettlementPage() {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    const res = await fetch('/api/auth/me');
    if (res.ok) {
      const data = await res.json();
      setUser(data);
    }
  };

  const getNextWorkingDay = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (tomorrow.getDay() === 0) tomorrow.setDate(tomorrow.getDate() + 1);
    if (tomorrow.getDay() === 6) tomorrow.setDate(tomorrow.getDate() + 2);
    
    return tomorrow.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter valid amount');
      return;
    }

    if (parseFloat(amount) > user?.walletBalance) {
      toast.error('Insufficient wallet balance');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/user/settlement/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ amount: parseFloat(amount) }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || 'Settlement initiated successfully!');
        setAmount('');
        fetchUser();
      } else {
        toast.error(data.error || 'Settlement failed');
      }
    } catch (error) {
      toast.error('Failed to initiate settlement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settlement</h1>
        <p className="text-gray-600">T+1 Settlement - Next Working Day</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="stats-card"
      >
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
            <BanknotesIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Initiate Settlement</h2>
            <p className="text-sm text-gray-500">Withdraw funds to your bank account</p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <div className="flex items-start space-x-3">
            <CalendarDaysIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-blue-900 mb-1">Settlement Date</p>
              <p className="text-sm text-blue-800">{getNextWorkingDay()}</p>
              <p className="text-xs text-blue-600 mt-1">Your amount will be credited on the next working day</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Available Balance
            </label>
            <div className="text-3xl font-bold text-gray-900 mb-4">
              ₹{user?.walletBalance?.toFixed(2) || '0.00'}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Settlement Amount
            </label>
            <input
              type="number"
              step="0.01"
              min="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="input-field"
              required
            />
          </div>

          <button
            type="submit"
            className="btn-primary w-full"
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Initiate Settlement'}
          </button>
        </form>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="stats-card bg-amber-50 border border-amber-200"
      >
        <div className="text-sm text-amber-800">
          <p className="font-semibold mb-2">Important Information:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Settlement follows T+1 model (Next working day)</li>
            <li>Weekends and holidays are excluded</li>
            <li>Amount will be deducted from your wallet immediately</li>
            <li>Bank transfer will be processed on the settlement date</li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
}
