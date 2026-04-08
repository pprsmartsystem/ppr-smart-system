'use client';

import { motion } from 'framer-motion';
import { GiftIcon, LockClosedIcon } from '@heroicons/react/24/outline';

export default function VouchersPage() {
  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-gray-900">Gift Vouchers</h1>
        <p className="text-gray-600 mt-2">Browse and purchase gift vouchers</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="stats-card">
        <div className="text-center py-16">
          <div className="relative inline-block mb-6">
            <GiftIcon className="w-20 h-20 text-gray-300 mx-auto" />
            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
              <LockClosedIcon className="w-4 h-4 text-amber-600" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Feature Coming Soon</h3>
          <p className="text-gray-500 max-w-sm mx-auto">Gift Vouchers are currently disabled. This feature will be available soon.</p>
          <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-full">
            <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
            <span className="text-sm font-medium text-amber-700">Temporarily Unavailable</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
