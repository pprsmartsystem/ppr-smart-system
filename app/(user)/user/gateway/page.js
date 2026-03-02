'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { ShieldCheckIcon, CreditCardIcon } from '@heroicons/react/24/outline';

export default function GatewayPage() {
  const [step, setStep] = useState(1);
  const [cardData, setCardData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    amount: '',
  });
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCardSubmit = (e) => {
    e.preventDefault();
    
    if (cardData.cardNumber.length !== 16) {
      toast.error('Card number must be 16 digits');
      return;
    }
    if (cardData.cvv.length !== 3) {
      toast.error('CVV must be 3 digits');
      return;
    }
    if (!/^\d{2}\/\d{2}$/.test(cardData.expiryDate)) {
      toast.error('Expiry date must be in MM/YY format');
      return;
    }
    if (!cardData.amount || cardData.amount <= 0) {
      toast.error('Please enter card amount');
      return;
    }
    
    setStep(2);
  };

  const handlePinSubmit = async (e) => {
    e.preventDefault();
    
    if (pin.length !== 4) {
      toast.error('PIN must be 4 digits');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/user/gateway/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          cardNumber: cardData.cardNumber,
          expiryDate: cardData.expiryDate,
          cvv: cardData.cvv,
          amount: parseFloat(cardData.amount),
          pin,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || 'Card redeemed successfully!');
        setStep(1);
        setCardData({ cardNumber: '', expiryDate: '', cvv: '', amount: '' });
        setPin('');
      } else {
        toast.error(data.error || 'Redemption failed');
        setStep(1);
        setPin('');
      }
    } catch (error) {
      toast.error('Failed to redeem card');
      setStep(1);
      setPin('');
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gateway</h1>
        <p className="text-gray-600">Redeem your virtual card</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="stats-card"
      >
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
            <ShieldCheckIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Redeem Card</h2>
            <p className="text-sm text-gray-500">Step {step} of 2</p>
          </div>
        </div>

        {step === 1 ? (
          <form onSubmit={handleCardSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Card Number
              </label>
              <input
                type="text"
                maxLength="16"
                value={cardData.cardNumber}
                onChange={(e) => setCardData({ ...cardData, cardNumber: e.target.value.replace(/\D/g, '') })}
                placeholder="1234567890123456"
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount Available on Card
              </label>
              <input
                type="number"
                step="0.01"
                value={cardData.amount}
                onChange={(e) => setCardData({ ...cardData, amount: e.target.value })}
                placeholder="Enter card amount"
                className="input-field"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expiry Date
                </label>
                <input
                  type="text"
                  maxLength="5"
                  value={cardData.expiryDate}
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, '');
                    if (value.length >= 2) {
                      value = value.slice(0, 2) + '/' + value.slice(2, 4);
                    }
                    setCardData({ ...cardData, expiryDate: value });
                  }}
                  placeholder="MM/YY"
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CVV
                </label>
                <input
                  type="text"
                  maxLength="3"
                  value={cardData.cvv}
                  onChange={(e) => setCardData({ ...cardData, cvv: e.target.value.replace(/\D/g, '') })}
                  placeholder="123"
                  className="input-field"
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn-primary w-full">
              Continue
            </button>
          </form>
        ) : (
          <form onSubmit={handlePinSubmit} className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>Card Number:</strong> •••• •••• •••• {cardData.cardNumber.slice(-4)}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter 4-Digit PIN
              </label>
              <input
                type="password"
                maxLength="4"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                placeholder="••••"
                className="input-field text-center text-2xl tracking-widest"
                required
                autoFocus
              />
            </div>

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setPin('');
                }}
                className="btn-secondary flex-1"
                disabled={loading}
              >
                Back
              </button>
              <button
                type="submit"
                className="btn-primary flex-1"
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Redeem Card'}
              </button>
            </div>
          </form>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="stats-card bg-amber-50 border border-amber-200"
      >
        <div className="flex items-start space-x-3">
          <CreditCardIcon className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <p className="font-semibold mb-1">Important:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Card amount must match exactly with your card balance</li>
              <li>Transaction will be recorded in your history</li>
              <li>Amount will be deducted from card (payment gateway)</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
