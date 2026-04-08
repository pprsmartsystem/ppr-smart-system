'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  ChatBubbleLeftRightIcon,
  PlusIcon,
  ArrowLeftIcon,
  PaperAirplaneIcon,
  XMarkIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ChevronRightIcon,
  ShieldCheckIcon,
  BoltIcon,
  QuestionMarkCircleIcon,
} from '@heroicons/react/24/outline';

const STATUS = {
  open:    { label: 'Open',    style: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',  dot: 'bg-amber-400' },
  replied: { label: 'Replied', style: 'bg-blue-50  text-blue-700  ring-1 ring-blue-200',   dot: 'bg-blue-400'  },
  closed:  { label: 'Closed',  style: 'bg-gray-100 text-gray-500  ring-1 ring-gray-200',   dot: 'bg-gray-400'  },
};

const FAQS = [
  { q: 'How do I add money to my wallet?', a: 'Go to Wallet → Add Money, scan the QR or use the payment link, then submit your UTR number for verification.' },
  { q: 'How long does wallet credit take?', a: 'After submitting your UTR, admin verifies and credits your wallet within 24 hours on business days.' },
  { q: 'What is the minimum settlement amount?', a: 'The minimum settlement amount is ₹10,000. Your KYC must be approved before initiating a settlement.' },
  { q: 'How do I freeze or unfreeze my card?', a: 'Go to Cards, click on your card and use the freeze/unfreeze toggle. Frozen cards cannot be used for transactions.' },
  { q: 'How do I complete KYC?', a: 'Go to KYC section, fill in your personal details, upload Aadhaar, PAN, and bank documents. Admin reviews within 2 business days.' },
];

export default function UserSupportPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [newTicket, setNewTicket] = useState({ subject: '', message: '' });
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => { fetchTickets(); }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [selectedTicket?.replies]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/user/tickets');
      if (res.ok) setTickets((await res.json()).tickets || []);
    } finally { setLoading(false); }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      const res = await fetch('/api/user/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTicket),
      });
      if (res.ok) {
        toast.success('Ticket created! We\'ll respond shortly.');
        setShowModal(false);
        setNewTicket({ subject: '', message: '' });
        fetchTickets();
      } else toast.error('Failed to create ticket');
    } catch { toast.error('Failed to create ticket'); }
    finally { setSending(false); }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!reply.trim()) return;
    setSending(true);
    try {
      const res = await fetch('/api/user/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId: selectedTicket._id, reply }),
      });
      if (res.ok) {
        toast.success('Reply sent!');
        setReply('');
        const updated = await res.json();
        setSelectedTicket(updated.ticket);
        fetchTickets();
      }
    } catch { toast.error('Failed to send reply'); }
    finally { setSending(false); }
  };

  const openCount = tickets.filter(t => t.status === 'open' || t.status === 'replied').length;

  // ── Ticket Detail View ──────────────────────────────────────────────────
  if (selectedTicket) return (
    <div className="max-w-2xl mx-auto flex flex-col" style={{ height: 'calc(100dvh - 9rem)' }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-gray-100 p-4 mb-3 flex items-center gap-3 flex-shrink-0">
        <button onClick={() => setSelectedTicket(null)}
          className="w-9 h-9 rounded-xl bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition-colors">
          <ArrowLeftIcon className="w-4 h-4 text-gray-600" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 truncate">{selectedTicket.subject}</p>
          <p className="text-xs text-gray-400">#{selectedTicket._id?.slice(-8).toUpperCase()}</p>
        </div>
        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold flex-shrink-0 ${STATUS[selectedTicket.status]?.style}`}>
          {STATUS[selectedTicket.status]?.label}
        </span>
      </motion.div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 px-1 pb-3">
        {/* Original message */}
        {!selectedTicket.replies?.[0]?.isAdmin && (
          <div className="flex justify-end">
            <div className="max-w-[80%]">
              <div className="bg-indigo-600 text-white rounded-2xl rounded-tr-sm px-4 py-3">
                <p className="text-sm leading-relaxed">{selectedTicket.message}</p>
              </div>
              <p className="text-xs text-gray-400 text-right mt-1">
                {new Date(selectedTicket.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        )}

        {selectedTicket.replies?.map((r, i) => (
          <div key={i} className={`flex ${r.isAdmin ? 'justify-start' : 'justify-end'}`}>
            <div className="max-w-[80%]">
              {r.isAdmin && (
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center">
                    <ShieldCheckIcon className="w-3 h-3 text-indigo-600" />
                  </div>
                  <span className="text-xs font-semibold text-indigo-600">Support Team</span>
                </div>
              )}
              <div className={`rounded-2xl px-4 py-3 ${r.isAdmin ? 'bg-white border border-gray-100 rounded-tl-sm text-gray-800' : 'bg-indigo-600 text-white rounded-tr-sm'}`}>
                <p className="text-sm leading-relaxed">{r.message}</p>
              </div>
              <p className={`text-xs text-gray-400 mt-1 ${r.isAdmin ? 'text-left' : 'text-right'}`}>
                {new Date(r.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Reply Input */}
      {selectedTicket.status !== 'closed' ? (
        <form onSubmit={handleReply} className="flex-shrink-0 mt-2">
          <div className="bg-white rounded-2xl border border-gray-100 p-3 flex items-end gap-3">
            <textarea
              value={reply}
              onChange={e => setReply(e.target.value)}
              placeholder="Type your message..."
              rows={2}
              className="flex-1 resize-none text-sm text-gray-800 placeholder-gray-400 outline-none bg-transparent"
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleReply(e); } }}
            />
            <button type="submit" disabled={sending || !reply.trim()}
              className="w-10 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 flex items-center justify-center transition-colors flex-shrink-0">
              <PaperAirplaneIcon className="w-4 h-4 text-white" />
            </button>
          </div>
        </form>
      ) : (
        <div className="flex-shrink-0 mt-2 bg-gray-50 rounded-2xl border border-gray-100 p-4 text-center">
          <CheckCircleIcon className="w-5 h-5 text-gray-400 mx-auto mb-1" />
          <p className="text-sm text-gray-500">This ticket is closed</p>
        </div>
      )}
    </div>
  );

  // ── Main View ───────────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-10">

      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="relative overflow-hidden rounded-3xl p-6 text-white"
          style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #1d4ed8 100%)' }}>
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #818cf8, transparent)' }} />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <ChatBubbleLeftRightIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold">Help & Support</h1>
                <p className="text-indigo-300 text-xs">We typically reply within 24 hours</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Total Tickets', value: tickets.length, icon: ChatBubbleLeftRightIcon, color: 'text-blue-300' },
                { label: 'Active',        value: openCount,       icon: ExclamationCircleIcon,  color: 'text-amber-300' },
                { label: 'Resolved',      value: tickets.filter(t => t.status === 'closed').length, icon: CheckCircleIcon, color: 'text-green-300' },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/10">
                  <Icon className={`w-4 h-4 ${color} mb-1.5`} />
                  <p className="text-white font-bold text-lg">{value}</p>
                  <p className="text-indigo-300 text-xs">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Help */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: BoltIcon,             label: '24h Response',  sub: 'Business days',   color: 'from-amber-400 to-orange-500' },
            { icon: ShieldCheckIcon,       label: 'Secure Chat',   sub: 'Encrypted',       color: 'from-emerald-400 to-green-500' },
            { icon: QuestionMarkCircleIcon,label: 'FAQ Available', sub: 'Instant answers', color: 'from-indigo-400 to-purple-500' },
          ].map(({ icon: Icon, label, sub, color }) => (
            <div key={label} className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mx-auto mb-2`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-xs font-bold text-gray-800">{label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* My Tickets */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">My Tickets</h3>
            <button onClick={() => setShowModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-colors">
              <PlusIcon className="w-3.5 h-3.5" /> New Ticket
            </button>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-50 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : tickets.length > 0 ? (
            <div className="space-y-2">
              {tickets.map((ticket, i) => {
                const st = STATUS[ticket.status] || STATUS.open;
                const hasNewReply = ticket.status === 'replied';
                return (
                  <motion.div key={ticket._id}
                    initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                    onClick={() => setSelectedTicket(ticket)}
                    className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 hover:border-indigo-100 hover:bg-indigo-50/30 cursor-pointer transition-all group"
                  >
                    <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${st.dot} ${hasNewReply ? 'animate-pulse' : ''}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{ticket.subject}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(ticket.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        {ticket.replies?.length > 0 && ` · ${ticket.replies.length} repl${ticket.replies.length > 1 ? 'ies' : 'y'}`}
                      </p>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold flex-shrink-0 ${st.style}`}>{st.label}</span>
                    <ChevronRightIcon className="w-4 h-4 text-gray-300 group-hover:text-indigo-400 transition-colors flex-shrink-0" />
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10">
              <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-3">
                <ChatBubbleLeftRightIcon className="w-7 h-7 text-gray-300" />
              </div>
              <p className="text-sm font-medium text-gray-500 mb-1">No tickets yet</p>
              <p className="text-xs text-gray-400">Create a ticket and we'll help you out</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* FAQ */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <QuestionMarkCircleIcon className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-gray-900">Frequently Asked Questions</h3>
          </div>
          <div className="space-y-2">
            {FAQS.map((faq, i) => (
              <div key={i} className="border border-gray-100 rounded-xl overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors">
                  <span className="text-sm font-semibold text-gray-800 pr-4">{faq.q}</span>
                  <ChevronRightIcon className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${openFaq === i ? 'rotate-90' : ''}`} />
                </button>
                {openFaq === i && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                    className="px-4 pb-4 border-t border-gray-50">
                    <p className="text-sm text-gray-600 leading-relaxed pt-3">{faq.a}</p>
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Create Ticket Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-gray-900">New Support Ticket</h2>
                <p className="text-xs text-gray-400 mt-0.5">Describe your issue and we'll help</p>
              </div>
              <button onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                <XMarkIcon className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Subject</label>
                <input type="text" value={newTicket.subject}
                  onChange={e => setNewTicket({ ...newTicket, subject: e.target.value })}
                  placeholder="e.g. Wallet not credited after payment"
                  className="input-field" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Message</label>
                <textarea value={newTicket.message}
                  onChange={e => setNewTicket({ ...newTicket, message: e.target.value })}
                  placeholder="Describe your issue in detail..."
                  className="input-field resize-none" rows={4} required />
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                <p className="text-xs text-blue-700 flex items-center gap-1.5">
                  <ClockIcon className="w-3.5 h-3.5 flex-shrink-0" />
                  Our team typically responds within 24 hours on business days.
                </p>
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 btn-secondary">Cancel</button>
                <button type="submit" disabled={sending}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-sm hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 transition-all">
                  {sending ? 'Submitting...' : 'Submit Ticket'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
