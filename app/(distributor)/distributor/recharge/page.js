'use client';

import { useState, useEffect } from 'react';
import { WalletIcon, CreditCardIcon } from '@heroicons/react/24/outline';
import { formatCurrency } from '@/utils/cardUtils';
import toast from 'react-hot-toast';

export default function DistributorRechargePage() {
  const [gateways, setGateways] = useState([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [gatewayRes, userRes] = await Promise.all([
        fetch('/api/distributor/payment-gateways'),
        fetch('/api/auth/me')
      ]);

      if (gatewayRes.ok) {
        const data = await gatewayRes.json();
        setGateways(data.gateways || []);
      }

      if (userRes.ok) {
        const userData = await userRes.json();
        setWalletBalance(userData.walletBalance || 0);
      }
    } catch (error) {
      toast.error('Failed to load data');
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
        <h1 className="text-3xl font-bold text-gray-900">Recharge Wallet</h1>
        <p className="text-gray-600 mt-2">Add balance to your distributor wallet</p>
      </div>

      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-90">Current Wallet Balance</p>
            <h2 className="text-4xl font-bold mt-2">{formatCurrency(walletBalance)}</h2>
          </div>
          <WalletIcon className="h-16 w-16 opacity-50" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Available Payment Methods</h3>
        
        {gateways.length === 0 ? (
          <div className="text-center py-12">
            <CreditCardIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No payment gateways available</p>
            <p className="text-sm text-gray-400 mt-2">Contact admin to add payment methods</p>
          </div>
        ) : (
          <div className="space-y-6">
            {gateways.map((gateway) => (
              <div key={gateway._id} className="border border-gray-200 rounded-xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">{gateway.name}</h4>
                    <p className="text-sm text-gray-500 capitalize">{gateway.type.replace('_', ' ')}</p>
                  </div>
                </div>

                {gateway.instructions && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-blue-800 whitespace-pre-line">{gateway.instructions}</p>
                  </div>
                )}

                {gateway.type === 'qr_code' && gateway.qrCodeUrl && (
                  <div className="flex justify-center">
                    <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
                      <img 
                        src={gateway.qrCodeUrl} 
                        alt={`${gateway.name} QR Code`}
                        className="w-64 h-64 object-contain"
                      />
                      <p className="text-center text-sm text-gray-600 mt-2">Scan to pay</p>
                    </div>
                  </div>
                )}

                {gateway.type === 'payment_link' && gateway.paymentLink && (
                  <div className="text-center">
                    <a
                      href={gateway.paymentLink.startsWith('http') ? gateway.paymentLink : `https://${gateway.paymentLink}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      <CreditCardIcon className="h-5 w-5" />
                      Pay Now
                    </a>
                  </div>
                )}

                <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-xs text-yellow-800">
                    <strong>Note:</strong> After payment, contact admin to credit the amount to your wallet.
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
