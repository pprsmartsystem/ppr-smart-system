'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCardIcon, PlusIcon } from '@heroicons/react/24/outline';
import VirtualCard from '@/components/cards/VirtualCard';
import toast from 'react-hot-toast';

// ── Card Creating Overlay ────────────────────────────────────────────────────
function CardCreatingOverlay({ amount }) {
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);

  const steps = [
    { label: 'Initialising secure environment', sub: 'Setting up encrypted channel...', duration: 5000 },
    { label: 'Generating card number', sub: 'Creating unique 16-digit card...', duration: 6000 },
    { label: 'Assigning CVV & expiry', sub: 'Generating security credentials...', duration: 5000 },
    { label: 'Linking to your wallet', sub: `Loading ₹${parseFloat(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}...`, duration: 6000 },
    { label: 'Activating card', sub: 'Registering with payment network...', duration: 5000 },
    { label: 'Finalising card details', sub: 'Almost ready...', duration: 3000 },
  ];

  useEffect(() => {
    const total = steps.reduce((s, x) => s + x.duration, 0);
    let elapsed = 0;
    const interval = setInterval(() => {
      elapsed += 100;
      setProgress(Math.min((elapsed / total) * 100, 98));
    }, 100);

    let delay = 0;
    steps.forEach((s, i) => {
      setTimeout(() => setStep(i), delay);
      delay += s.duration;
    });

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)' }}>
      <div className="w-full max-w-sm px-6">
        {/* Animated card visual */}
        <div className="relative mx-auto mb-10" style={{ width: 300, height: 180 }}>
          <motion.div
            animate={{ rotateY: [0, 8, -8, 0], scale: [1, 1.03, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              width: 300, height: 180, borderRadius: 18,
              background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)',
              boxShadow: '0 25px 60px rgba(0,0,0,0.6), 0 0 40px rgba(99,102,241,0.3)',
              position: 'relative', overflow: 'hidden', padding: 24,
            }}
          >
            {/* Shimmer */}
            <motion.div
              animate={{ x: [-300, 400] }}
              transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 1 }}
              style={{ position: 'absolute', top: 0, left: 0, width: 80, height: '100%', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)', transform: 'skewX(-20deg)' }}
            />
            {/* Chip */}
            <div style={{ width: 40, height: 30, background: 'linear-gradient(135deg, #d4af37, #f5d76e)', borderRadius: 5, marginBottom: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }} />
            {/* Card number */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
              {['••••', '••••', '••••', '••••'].map((g, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: step >= 1 ? 1 : 0 }}
                  transition={{ delay: i * 0.3 }}
                  style={{ color: 'rgba(255,255,255,0.9)', fontSize: 16, fontFamily: 'monospace', letterSpacing: 2 }}
                >{g}</motion.span>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', marginBottom: 2 }}>CARD HOLDER</div>
                <motion.div animate={{ opacity: step >= 3 ? 1 : 0.3 }} style={{ fontSize: 13, color: '#fff', fontWeight: 600, letterSpacing: 1 }}>PPR SMART</motion.div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', marginBottom: 2 }}>EXPIRES</div>
                <motion.div animate={{ opacity: step >= 2 ? 1 : 0.3 }} style={{ fontSize: 13, color: '#fff', fontWeight: 600 }}>••/••</motion.div>
              </div>
            </div>
            {/* Network logo */}
            <motion.div animate={{ opacity: step >= 4 ? 1 : 0 }} style={{ position: 'absolute', top: 20, right: 20, display: 'flex', gap: -6 }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#eb001b', opacity: 0.9 }} />
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#f79e1b', opacity: 0.9, marginLeft: -8 }} />
            </motion.div>
          </motion.div>
        </div>

        {/* Steps */}
        <div className="space-y-3 mb-8">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center gap-3">
              <div style={{ width: 24, height: 24, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: i < step ? '#22c55e' : i === step ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.05)',
                border: i === step ? '2px solid #6366f1' : '2px solid transparent',
              }}>
                {i < step
                  ? <span style={{ color: '#fff', fontSize: 12 }}>✓</span>
                  : i === step
                  ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} style={{ width: 10, height: 10, border: '2px solid #6366f1', borderTopColor: 'transparent', borderRadius: '50%' }} />
                  : null}
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: i <= step ? 600 : 400, color: i < step ? '#22c55e' : i === step ? '#fff' : 'rgba(255,255,255,0.3)' }}>{s.label}</p>
                {i === step && <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 1 }}>{s.sub}</p>}
              </div>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 99, height: 4, overflow: 'hidden' }}>
          <motion.div animate={{ width: `${progress}%` }} transition={{ ease: 'linear' }} style={{ height: '100%', background: 'linear-gradient(90deg, #6366f1, #8b5cf6)', borderRadius: 99 }} />
        </div>
        <p style={{ textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 10 }}>Please wait, do not close this window</p>
      </div>
    </div>
  );
}

// ── Card Success Overlay ──────────────────────────────────────────────────────
function CardSuccessOverlay({ card, onDone }) {
  const [revealed, setRevealed] = useState(false);

  const fmt = (n) => n?.toString().replace(/(.{4})/g, '$1 ').trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)' }}>
      <div className="w-full max-w-sm px-6 text-center">
        {/* Success tick */}
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 15 }} className="mx-auto mb-6" style={{ width: 72, height: 72 }}>
          <svg viewBox="0 0 72 72" width="72" height="72">
            <circle cx="36" cy="36" r="34" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
            <motion.circle cx="36" cy="36" r="34" fill="none" stroke="#22c55e" strokeWidth="3"
              strokeDasharray="213" initial={{ strokeDashoffset: 213 }} animate={{ strokeDashoffset: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }} />
            <motion.polyline points="20,36 30,46 52,26" fill="none" stroke="#22c55e" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"
              strokeDasharray="50" initial={{ strokeDashoffset: 50 }} animate={{ strokeDashoffset: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }} />
          </svg>
        </motion.div>

        <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} style={{ color: '#fff', fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Card Created!</motion.h2>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginBottom: 32 }}>Your virtual card is ready to use</motion.p>

        {/* Real card reveal */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
          style={{
            width: '100%', height: 190, borderRadius: 18, padding: 24, position: 'relative', overflow: 'hidden', marginBottom: 24,
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)',
            boxShadow: '0 25px 60px rgba(0,0,0,0.6), 0 0 40px rgba(99,102,241,0.4)',
          }}
        >
          {/* Shimmer */}
          <motion.div animate={{ x: [-300, 400] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
            style={{ position: 'absolute', top: 0, left: 0, width: 80, height: '100%', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent)', transform: 'skewX(-20deg)' }} />
          {/* Chip */}
          <div style={{ width: 40, height: 30, background: 'linear-gradient(135deg, #d4af37, #f5d76e)', borderRadius: 5, marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }} />
          {/* Card number */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
            {(fmt(card.cardNumber) || '•••• •••• •••• ••••').split(' ').map((g, i) => (
              <motion.span key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 + i * 0.15 }}
                style={{ color: '#fff', fontSize: 15, fontFamily: 'monospace', letterSpacing: 2, fontWeight: 600 }}>
                {revealed ? g : (i < 3 ? '••••' : g)}
              </motion.span>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', marginBottom: 2 }}>CARD HOLDER</div>
              <div style={{ fontSize: 12, color: '#fff', fontWeight: 600, letterSpacing: 1 }}>PPR SMART USER</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', marginBottom: 2 }}>EXPIRES</div>
              <div style={{ fontSize: 12, color: '#fff', fontWeight: 600 }}>{card.expiryDate || '••/••'}</div>
            </div>
          </div>
          {/* Network */}
          <div style={{ position: 'absolute', top: 20, right: 20, display: 'flex' }}>
            <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#eb001b', opacity: 0.9 }} />
            <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#f79e1b', opacity: 0.9, marginLeft: -8 }} />
          </div>
          {/* Balance badge */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }}
            style={{ position: 'absolute', bottom: 20, right: 20, background: 'rgba(255,255,255,0.12)', borderRadius: 8, padding: '4px 10px', backdropFilter: 'blur(8px)' }}>
            <span style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>₹{card.balance?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </motion.div>
        </motion.div>

        {/* Card details */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
          style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: '12px 16px', marginBottom: 24, textAlign: 'left' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Card Number</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, color: '#fff', fontFamily: 'monospace' }}>{revealed ? fmt(card.cardNumber) : `•••• •••• •••• ${card.cardNumber?.slice(-4)}`}</span>
              <button onClick={() => setRevealed(r => !r)} style={{ fontSize: 11, color: '#6366f1', background: 'none', border: 'none', cursor: 'pointer' }}>{revealed ? 'Hide' : 'Show'}</button>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>CVV</span>
            <span style={{ fontSize: 12, color: '#fff', fontFamily: 'monospace' }}>{revealed ? card.cvv : '•••'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Balance</span>
            <span style={{ fontSize: 12, color: '#22c55e', fontWeight: 700 }}>₹{card.balance?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
        </motion.div>

        <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
          onClick={onDone}
          style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}
        >
          View My Cards
        </motion.button>
      </div>
    </div>
  );
}

export default function CardsPage() {
  const [cards, setCards] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ amount: '', pin: '' });
  const [creatingStep, setCreatingStep] = useState(null); // null | 'creating' | 'success'
  const [newCard, setNewCard] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [userRes, cardsRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/user/cards')
      ]);
      
      if (userRes.ok) setUser(await userRes.json());
      if (cardsRes.ok) {
        const data = await cardsRes.json();
        setCards(data.cards || []);
      }
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchCards = fetchData;

  const handleCreateCard = async (e) => {
    e.preventDefault();
    if (!formData.amount || !formData.pin) return toast.error('Please fill all fields');
    if (formData.pin.length !== 4) return toast.error('PIN must be 4 digits');

    setShowModal(false);
    setCreatingStep('creating');

    try {
      // Minimum 30s experience — API call + artificial delay run in parallel
      const [res] = await Promise.all([
        fetch('/api/user/cards/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: parseFloat(formData.amount), pin: formData.pin }),
        }),
        new Promise(r => setTimeout(r, 30000)),
      ]);

      const data = await res.json();

      if (res.ok) {
        setNewCard(data.card);
        setCreatingStep('success');
        setFormData({ amount: '', pin: '' });
        fetchData();
      } else {
        setCreatingStep(null);
        toast.error(data.message || 'Failed to create card');
      }
    } catch {
      setCreatingStep(null);
      toast.error('Error creating card');
    }
  };

  const handleDeleteCard = async (cardId) => {
    if (!confirm('Are you sure you want to delete this card?')) return;
    
    try {
      const res = await fetch(`/api/user/cards/${cardId}`, {
        method: 'DELETE',
      });
      
      if (res.ok) {
        toast.success('Card deleted successfully!');
        fetchCards();
      } else {
        toast.error('Failed to delete card');
      }
    } catch (error) {
      toast.error('Error deleting card');
    }
  };

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Cards</h1>
          <p className="text-gray-600 mt-2">Manage your virtual cards • Wallet: ₹{user?.walletBalance?.toFixed(2) || '0.00'}</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <PlusIcon className="w-4 h-4 mr-2" />
          New Card
        </button>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-200 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : cards.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card, index) => (
            <motion.div key={card._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
              <VirtualCard card={card} onDelete={handleDeleteCard} />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 stats-card">
          <CreditCardIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No cards yet</h3>
          <p className="text-gray-600 mb-6">Create your first virtual card</p>
          <button onClick={handleCreateCard} className="btn-primary">
            <PlusIcon className="w-4 h-4 mr-2" />
            Create Card
          </button>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <CreditCardIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Create New Card</h2>
                <p className="text-xs text-gray-500">Balance: ₹{user?.walletBalance?.toFixed(2) || '0.00'}</p>
              </div>
            </div>
            <form onSubmit={handleCreateCard} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Card Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">₹</span>
                  <input type="number" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} placeholder="0.00" min="1" max={user?.walletBalance || 0} step="0.01" required className="input-field pl-7" />
                </div>
                <p className="text-xs text-gray-400 mt-1">Deducted from your wallet</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">4-Digit PIN</label>
                <input type="password" value={formData.pin} onChange={(e) => setFormData({...formData, pin: e.target.value.replace(/\D/g, '').slice(0, 4)})} placeholder="••••" maxLength="4" required className="input-field tracking-widest text-center text-xl" />
                <p className="text-xs text-gray-400 mt-1">Used to authorise transactions</p>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowModal(false); setFormData({ amount: '', pin: '' }); }} className="flex-1 btn-secondary">Cancel</button>
                <button type="submit" className="flex-1 btn-primary">Create Card</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Card Creating Screen */}
      {creatingStep === 'creating' && <CardCreatingOverlay amount={formData.amount} />}

      {/* Card Success Screen */}
      {creatingStep === 'success' && newCard && (
        <CardSuccessOverlay card={newCard} onDone={() => { setCreatingStep(null); setNewCard(null); }} />
      )}
    </div>
  );
}
