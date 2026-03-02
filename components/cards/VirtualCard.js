'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  CreditCardIcon,
  EyeIcon,
  EyeSlashIcon,
  LockClosedIcon,
  TrashIcon,
  ClipboardDocumentIcon
} from '@heroicons/react/24/outline';
import { formatCurrency } from '@/utils/cardUtils';

export default function VirtualCard({ 
  card, 
  onToggleFreeze,
  onDelete,
  className = '' 
}) {
  const [flipped, setFlipped] = useState(false);
  const [showCVV, setShowCVV] = useState(false);

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`);
  };

  // Generate consistent color based on card ID
  const colors = [
    'from-blue-500 via-blue-600 to-indigo-700',
    'from-purple-500 via-purple-600 to-pink-700',
    'from-green-500 via-emerald-600 to-teal-700',
    'from-orange-500 via-red-600 to-rose-700',
    'from-indigo-500 via-violet-600 to-purple-700',
    'from-pink-500 via-fuchsia-600 to-purple-700',
    'from-cyan-500 via-blue-600 to-indigo-700',
    'from-amber-500 via-orange-600 to-red-700',
  ];
  const cardGradient = colors[parseInt(card._id?.slice(-1), 16) % colors.length] || colors[0];
  const isExpired = card.status === 'expired';
  const isFrozen = card.status === 'frozen';

  return (
    <div className={`relative w-full max-w-sm ${className}`}>
      <motion.div
        className="relative w-full h-56 cursor-pointer"
        style={{ perspective: '1000px' }}
        onClick={() => setFlipped(!flipped)}
        whileHover={{ scale: 1.02 }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        <motion.div
          className="relative w-full h-full"
          style={{ transformStyle: 'preserve-3d' }}
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Front of Card */}
          <div
            className={`absolute inset-0 w-full h-full rounded-2xl p-6 text-white shadow-2xl bg-gradient-to-br ${cardGradient}`}
            style={{ backfaceVisibility: 'hidden' }}
          >
            {(isFrozen || isExpired) && (
              <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center">
                <div className="text-center">
                  <LockClosedIcon className="w-8 h-8 mx-auto mb-2" />
                  <p className="font-semibold">
                    {isFrozen ? 'Card Frozen' : 'Card Expired'}
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-between items-start mb-8">
              <div>
                <p className="text-sm opacity-80">PPR Smart Card</p>
                <p className="text-xs opacity-60">{card.cardType || 'Virtual'}</p>
              </div>
              <CreditCardIcon className="w-8 h-8" />
            </div>

            <div className="mb-8">
              <div className="flex items-center justify-between">
                <p className="text-xl font-mono tracking-wider">
                  {card.cardNumber.replace(/(.{4})/g, '$1 ').trim()}
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard(card.cardNumber, 'Card number');
                  }}
                  className="p-1.5 hover:bg-white/20 rounded transition-colors flex-shrink-0"
                >
                  <ClipboardDocumentIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex justify-between items-end">
              <div>
                <p className="text-xs opacity-60 mb-1">VALID THRU</p>
                <p className="text-sm font-mono">{card.expiryDate}</p>
              </div>
              <div className="text-right">
                <p className="text-xs opacity-60 mb-1">BALANCE</p>
                <p className="text-lg font-semibold">{formatCurrency(card.balance)}</p>
              </div>
            </div>
          </div>

          {/* Back of Card */}
          <div
            className={`absolute inset-0 w-full h-full rounded-2xl bg-gradient-to-br ${cardGradient} shadow-2xl`}
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <div className="w-full h-12 bg-black mt-6"></div>
            
            <div className="p-6 pt-8">
              <div className="bg-white rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700 text-sm font-medium">Security Code (CVV)</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowCVV(!showCVV);
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    {showCVV ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                  </button>
                </div>
                <div className="text-center">
                  <span className="text-gray-900 font-mono text-3xl font-bold tracking-widest">
                    {showCVV ? card.cvv : '• • •'}
                  </span>
                </div>
              </div>

              <div className="text-white text-xs space-y-2 opacity-80">
                <p>• This card is property of PPR Smart System</p>
                <p>• Report lost or stolen cards immediately</p>
                <p>• For customer service: support@ppr.com</p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      <div className="mt-4 space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Card Limit</span>
          <span className="text-sm font-medium">{formatCurrency(card.balance)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Status</span>
          <span className={`text-sm font-medium px-2 py-1 rounded-full ${
            card.status === 'active' ? 'bg-green-100 text-green-800' :
            card.status === 'frozen' ? 'bg-blue-100 text-blue-800' :
            'bg-red-100 text-red-800'
          }`}>
            {card.status.charAt(0).toUpperCase() + card.status.slice(1)}
          </span>
        </div>
        {onDelete && (
          <button onClick={() => onDelete(card._id)} className="w-full mt-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center space-x-2">
            <TrashIcon className="w-4 h-4" />
            <span>Delete Card</span>
          </button>
        )}
      </div>
    </div>
  );
}