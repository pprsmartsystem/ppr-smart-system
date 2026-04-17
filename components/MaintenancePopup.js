'use client';

import { useState, useEffect, useCallback } from 'react';

export default function MaintenancePopup() {
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState('');

  const checkMaintenance = useCallback(async () => {
    try {
      const res = await fetch('/api/user/maintenance', {
        cache: 'no-store',
        credentials: 'include',
        headers: { 'Cache-Control': 'no-cache' },
      });
      if (!res.ok) return;
      const data = await res.json();
      setShow(data.maintenanceMode === true);
      if (data.maintenanceMessage) setMessage(data.maintenanceMessage);
    } catch { }
  }, []);

  useEffect(() => {
    checkMaintenance();
    const t = setInterval(checkMaintenance, 15000);
    return () => clearInterval(t);
  }, [checkMaintenance]);

  if (!show) return null;

  const paragraphs = message.split('\n\n').filter(Boolean);

  return (
    <div
      className="fixed inset-0 z-[9999] overflow-y-auto"
      style={{ background: 'rgba(15,23,42,0.92)', backdropFilter: 'blur(12px)' }}
      onClick={e => e.stopPropagation()}
    >
      <div className="min-h-full flex items-center justify-center p-4 py-8">
        <div className="w-full max-w-md">

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">

            {/* Header */}
            <div className="relative overflow-hidden px-7 pt-8 pb-6 text-center"
              style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #1d4ed8 100%)' }}>
              <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-10"
                style={{ background: 'radial-gradient(circle, #818cf8, transparent)' }} />

              {/* Icon */}
              <div className="relative mx-auto mb-4 w-16 h-16">
                <div className="absolute inset-0 rounded-full bg-amber-400/20 animate-ping" />
                <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              </div>

              <h2 className="text-xl font-bold text-white mb-1">System Maintenance</h2>
              <div className="flex items-center justify-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-xs font-semibold text-amber-300 uppercase tracking-widest">In Progress</span>
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              </div>
            </div>

            {/* Body */}
            <div className="px-7 py-6 space-y-4">

              {/* Message paragraphs */}
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 space-y-3">
                {paragraphs.map((para, i) => (
                  <p key={i} className="text-gray-700 text-sm leading-relaxed">
                    {para}
                  </p>
                ))}
              </div>

              {/* Security note */}
              <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl p-4">
                <svg className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <p className="text-xs text-blue-700 leading-relaxed">
                  Your funds and data are <span className="font-semibold">safe and secure</span>. This notice will close automatically once maintenance is complete.
                </p>
              </div>

              {/* Disabled services */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Services Temporarily Unavailable</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {['Wallet Transactions', 'Card Operations', 'Settlement Requests', 'Payment Gateway', 'Voucher Redemption', 'KYC Submission'].map(s => (
                    <div key={s} className="flex items-center gap-1.5 bg-red-50 border border-red-100 rounded-lg px-2.5 py-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                      <span className="text-xs text-red-700 font-medium">{s}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact */}
              <p className="text-center text-xs text-gray-400">
                Urgent queries?{' '}
                <a href="mailto:support@pprsmartsystem.com" className="text-indigo-500 font-semibold hover:underline">
                  support@pprsmartsystem.com
                </a>
              </p>

              {/* Sign out */}
              <button
                onClick={async () => {
                  await fetch('/api/auth/logout', { method: 'POST' });
                  window.location.href = '/login';
                }}
                className="w-full py-2.5 rounded-xl border border-gray-200 text-gray-500 text-sm font-semibold hover:border-red-300 hover:text-red-600 hover:bg-red-50 transition-all"
              >
                Sign Out
              </button>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 border-t border-gray-100 px-7 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <span className="text-xs font-semibold text-gray-600">PPR Smart System</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-xs text-amber-600 font-medium">Maintenance Active</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
