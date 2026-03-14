'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { WalletIcon, PlusIcon, ArrowUpIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function WalletPage() {
  const [user, setUser] = useState(null);
  const [paymentGateways, setPaymentGateways] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [paymentData, setPaymentData] = useState({ utrNumber: '', name: '', amount: '' });

  useEffect(() => {
    fetchUser();
    fetchPaymentGateways();
  }, []);

  const fetchUser = async () => {
    const res = await fetch('/api/auth/me');
    if (res.ok) setUser(await res.json());
  };

  const fetchPaymentGateways = async () => {
    const res = await fetch('/api/user/payment-gateway');
    if (res.ok) {
      const data = await res.json();
      setPaymentGateways(data.gateways || []);
    }
  };

  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/user/payment-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData),
      });
      
      if (res.ok) {
        toast.success('Payment request submitted!');
        setShowModal(false);
        setPaymentData({ utrNumber: '', name: '', amount: '' });
      } else {
        toast.error('Failed to submit');
      }
    } catch (error) {
      toast.error('Error submitting payment');
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
          {paymentGateways.length > 0 ? (
            <div className="space-y-4">
              {paymentGateways.map((gw) => (
                <div key={gw._id} className="p-4 border border-gray-200 rounded-xl">
                  <h4 className="font-semibold text-gray-900 mb-2">{gw.name}</h4>
                  {gw.type === 'qr_code' && gw.qrCodeUrl && (
                    <div className="text-center">
                      <img src={gw.qrCodeUrl} alt="QR Code" className="w-48 h-48 mx-auto object-contain" />
                      <p className="text-sm text-gray-600 mt-2">Scan to pay</p>
                    </div>
                  )}
                  {gw.type === 'payment_link' && gw.paymentLink && (
                    <a href={gw.paymentLink.startsWith('http') ? gw.paymentLink : `https://${gw.paymentLink}`} target="_blank" rel="noopener noreferrer" className="btn-primary w-full text-center block">
                      Pay Now
                    </a>
                  )}
                  {gw.instructions && (
                    <p className="text-sm text-gray-600 mt-2">{gw.instructions}</p>
                  )}
                </div>
              ))}
              <button onClick={() => setShowModal(true)} className="btn-primary w-full">
                Submit Payment Details
              </button>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <PlusIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">No payment methods available</p>
              <p className="text-sm text-gray-500">Contact admin to add balance to your wallet</p>
            </div>
          )}
        </motion.div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-2xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-6">Submit Payment Details</h2>
            <form onSubmit={handleSubmitPayment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">UTR Number</label>
                <input
                  type="text"
                  value={paymentData.utrNumber}
                  onChange={(e) => setPaymentData({ ...paymentData, utrNumber: e.target.value })}
                  placeholder="Enter UTR number"
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={paymentData.name}
                  onChange={(e) => setPaymentData({ ...paymentData, name: e.target.value })}
                  placeholder="Your name"
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount (₹)</label>
                <input
                  type="number"
                  value={paymentData.amount}
                  onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                  placeholder="Enter amount"
                  className="input-field"
                  required
                  min="1"
                  step="0.01"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 btn-secondary">Cancel</button>
                <button type="submit" className="flex-1 btn-primary">Submit</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
