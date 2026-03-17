'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ComputerDesktopIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { formatCurrency } from '@/utils/cardUtils';

export default function UserServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchServices();
    fetchUser();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await fetch('/api/user/services');
      if (res.ok) {
        const data = await res.json();
        setServices(data.services || []);
      }
    } catch (error) {
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const fetchUser = async () => {
    const res = await fetch('/api/auth/me');
    if (res.ok) {
      const data = await res.json();
      setUser(data);
    }
  };

  const handlePurchase = async () => {
    if (!selectedService) return;

    if (user.walletBalance < selectedService.price) {
      toast.error('Insufficient wallet balance');
      return;
    }

    try {
      const res = await fetch('/api/user/services/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceId: selectedService._id }),
      });

      if (res.ok) {
        const data = await res.json();
        toast.success('Service purchased successfully!');
        setShowModal(false);
        setSelectedService(null);
        fetchUser();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Purchase failed');
      }
    } catch (error) {
      toast.error('Failed to purchase service');
    }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-gray-900">IT Services Marketplace</h1>
        <p className="text-gray-600 mt-2">Purchase digital services and software</p>
      </motion.div>

      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
        <p className="text-sm opacity-90">Your Wallet Balance</p>
        <h2 className="text-3xl font-bold mt-2">{formatCurrency(user?.walletBalance || 0)}</h2>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : services.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <motion.div
                key={service._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6">
                  <ComputerDesktopIcon className="h-12 w-12 text-white mb-3" />
                  <h3 className="text-xl font-bold text-white">{service.name}</h3>
                  <span className="inline-block mt-2 px-3 py-1 bg-white/20 rounded-full text-xs text-white capitalize">
                    {service.category}
                  </span>
                </div>
                <div className="p-6">
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">{service.description}</p>
                  
                  {service.features && service.features.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-gray-700 mb-2">Features:</p>
                      <ul className="space-y-1">
                        {service.features.slice(0, 3).map((feature, idx) => (
                          <li key={idx} className="text-xs text-gray-600 flex items-start">
                            <span className="text-green-500 mr-2">✓</span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{formatCurrency(service.price)}</p>
                      <p className="text-xs text-gray-500 capitalize">{service.deliveryType} delivery</p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedService(service);
                        setShowModal(true);
                      }}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                    >
                      <ShoppingCartIcon className="h-4 w-4" />
                      Buy Now
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl">
            <ComputerDesktopIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No services available</p>
          </div>
        )}
      </motion.div>

      {showModal && selectedService && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-xl p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Confirm Purchase</h2>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-600 mb-2">Service</p>
              <p className="font-semibold text-gray-900">{selectedService.name}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-600 mb-2">Price</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(selectedService.price)}</p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-800">
                <strong>Your Balance:</strong> {formatCurrency(user?.walletBalance || 0)}
              </p>
              <p className="text-sm text-blue-800">
                <strong>After Purchase:</strong> {formatCurrency((user?.walletBalance || 0) - selectedService.price)}
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <p className="text-xs text-yellow-800">
                Payment will be deducted from your wallet. Service will be delivered as per the delivery type.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedService(null);
                }}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handlePurchase}
                disabled={user?.walletBalance < selectedService.price}
                className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm Purchase
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
