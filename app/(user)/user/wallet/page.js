'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { WalletIcon, PlusIcon, ArrowUpIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function WalletPage() {
  const [user, setUser] = useState(null);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    const res = await fetch('/api/auth/me');
    if (res.ok) setUser(await res.json());
  };

  const handleAddMoney = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch('/api/user/wallet/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: parseFloat(amount) }),
      });
      
      if (res.ok) {
        toast.success('Money added successfully!');
        setAmount('');
        fetchUser();
      } else {
        toast.error('Failed to add money');
      }
    } catch (error) {
      toast.error('Error adding money');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-gray-900">My Wallet</h1>
        <p className="text-gray-600 mt-2">Manage your wallet balance</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="stats-card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Current Balance</h3>
            <WalletIcon className="w-8 h-8 text-green-600" />
          </div>
          <div className="text-4xl font-bold text-gray-900 mb-2">
            ₹{user?.walletBalance?.toFixed(2) || '0.00'}
          </div>
          <p className="text-sm text-gray-600">Available to spend</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="stats-card">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Add Money</h3>
          <div className="bg-gray-50 rounded-lg p-6 text-center">
            <PlusIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">Self-service disabled</p>
            <p className="text-sm text-gray-500">Contact admin to add balance to your wallet</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
