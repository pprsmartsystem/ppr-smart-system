'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GiftIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function VouchersPage() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      const res = await fetch('/api/user/brands');
      if (res.ok) {
        const data = await res.json();
        setBrands(data.brands || []);
      }
    } catch (error) {
      toast.error('Failed to load brands');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-gray-900">Gift Vouchers</h1>
        <p className="text-gray-600 mt-2">Browse and purchase gift vouchers</p>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : brands.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {brands.map((brand, index) => (
            <motion.div key={brand._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className="stats-card hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center space-x-4 mb-4">
                <img src={brand.logo} alt={brand.name} className="w-16 h-16 rounded-lg" />
                <div>
                  <h3 className="font-semibold text-gray-900">{brand.name}</h3>
                  <p className="text-sm text-gray-600">{brand.category}</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">{brand.description}</p>
              <div className="flex flex-wrap gap-2">
                {brand.denominations?.slice(0, 4).map((denom, i) => (
                  <span key={i} className="px-3 py-1 bg-gray-100 rounded-lg text-sm font-medium">
                    ₹{denom.value}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 stats-card">
          <GiftIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No vouchers available</h3>
          <p className="text-gray-600">Check back later for new brands</p>
        </div>
      )}
    </div>
  );
}
