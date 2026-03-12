'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/solid';

export default function BroadcastBar() {
  const [broadcast, setBroadcast] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    fetchBroadcast();
  }, []);

  const fetchBroadcast = async () => {
    try {
      const res = await fetch('/api/broadcast');
      const data = await res.json();
      if (data.broadcast) {
        const dismissed = localStorage.getItem(`broadcast-${data.broadcast._id}`);
        if (!dismissed) {
          setBroadcast(data.broadcast);
          setIsVisible(true);
        }
      }
    } catch (error) {
      console.error('Failed to fetch broadcast:', error);
    }
  };

  const handleDismiss = () => {
    if (broadcast) {
      localStorage.setItem(`broadcast-${broadcast._id}`, 'true');
    }
    setIsVisible(false);
  };

  if (!isVisible || !broadcast) return null;

  return (
    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl mx-4 animate-slideDown">
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-2xl rounded-xl">
        <div className="flex items-center justify-between py-4 px-6 gap-4">
          <div className="flex-1 text-center">
            <p className="text-sm sm:text-base font-medium whitespace-pre-line leading-relaxed">
              {broadcast.message}
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 p-2 rounded-md hover:bg-white/30 transition-all duration-200 group bg-white/10"
            aria-label="Close banner"
          >
            <XMarkIcon className="h-5 w-5 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
