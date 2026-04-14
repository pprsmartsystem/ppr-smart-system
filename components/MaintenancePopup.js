'use client';

import { useState, useEffect, useCallback } from 'react';
import { WrenchScrewdriverIcon, ShieldExclamationIcon } from '@heroicons/react/24/outline';

export default function MaintenancePopup() {
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState('');

  const checkMaintenance = useCallback(async () => {
    try {
      const res = await fetch('/api/user/maintenance', {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
      });
      if (!res.ok) return;
      const data = await res.json();
      setShow(data.maintenanceMode === true);
      if (data.maintenanceMessage) setMessage(data.maintenanceMessage);
    } catch {
      // silently fail — don't block user if API is down
    }
  }, []);

  useEffect(() => {
    // Check immediately on mount
    checkMaintenance();
    // Then poll every 15 seconds
    const t = setInterval(checkMaintenance, 15000);
    return () => clearInterval(t);
  }, [checkMaintenance]);

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
      // Prevent any click from closing
      onClick={e => e.stopPropagation()}
    >
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-3xl overflow-hidden shadow-2xl">
          {/* Top gradient bar */}
          <div className="h-2 w-full bg-gradient-to-r from-amber-400 via-orange-500 to-red-500" />

          <div className="p-8 text-center">
            {/* Animated icon */}
            <div className="relative mx-auto mb-6 w-20 h-20">
              <div className="absolute inset-0 rounded-full bg-amber-100 animate-ping opacity-40" />
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                <WrenchScrewdriverIcon className="w-10 h-10 text-white" />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-gray-900 mb-2">System Maintenance</h2>
            <div className="flex items-center justify-center gap-1.5 mb-6">
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-xs font-semibold text-amber-600 uppercase tracking-widest">In Progress</span>
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            </div>

            {/* Message */}
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 mb-6 text-left">
              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{message}</p>
            </div>

            {/* Info strip */}
            <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-4 mb-6">
              <ShieldExclamationIcon className="w-5 h-5 text-indigo-500 flex-shrink-0" />
              <p className="text-xs text-gray-500 text-left">
                All your data and funds are <span className="font-semibold text-gray-700">safe and secure</span>. This window will automatically close once maintenance is complete.
              </p>
            </div>

            {/* Disabled services */}
            <div className="grid grid-cols-2 gap-2 mb-6">
              {['Wallet Transactions', 'Card Operations', 'Settlement Requests', 'Payment Gateway', 'Voucher Redemption', 'KYC Submission'].map(s => (
                <div key={s} className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                  <span className="text-xs text-red-700 font-medium">{s}</span>
                </div>
              ))}
            </div>

            <p className="text-xs text-gray-400">
              For urgent queries contact{' '}
              <a href="mailto:contact@pprsmartsystem.com" className="text-indigo-500 font-semibold hover:underline">
                contact@pprsmartsystem.com
              </a>
            </p>
          </div>

          {/* Bottom bar */}
          <div className="bg-gray-50 border-t border-gray-100 px-8 py-3 flex items-center justify-between">
            <span className="text-xs text-gray-400">PPR Smart System</span>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-xs text-amber-600 font-medium">Maintenance Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
