'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  TrashIcon,
  BellIcon,
  FlagIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { BellIcon as BellSolid } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  open: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  replied: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
  in_progress: 'bg-purple-50 text-purple-700 ring-1 ring-purple-200',
  resolved: 'bg-green-50 text-green-700 ring-1 ring-green-200',
  closed: 'bg-gray-100 text-gray-500 ring-1 ring-gray-200',
};

const PRIORITY_COLORS = {
  low: 'text-gray-500',
  medium: 'text-blue-500',
  high: 'text-orange-500',
  urgent: 'text-red-500 animate-pulse',
};

const CATEGORIES = {
  account: { label: 'Account', icon: '👤', color: 'bg-blue-100 text-blue-700' },
  payment: { label: 'Payment', icon: '💳', color: 'bg-green-100 text-green-700' },
  card: { label: 'Card', icon: '🎴', color: 'bg-purple-100 text-purple-700' },
  kyc: { label: 'KYC', icon: '📄', color: 'bg-yellow-100 text-yellow-700' },
  settlement: { label: 'Settlement', icon: '💰', color: 'bg-emerald-100 text-emerald-700' },
  technical: { label: 'Technical', icon: '⚙️', color: 'bg-gray-100 text-gray-700' },
  other: { label: 'Other', icon: '❓', color: 'bg-pink-100 text-pink-700' },
};

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [reply, setReply] = useState('');
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [newMsg, setNewMsg] = useState({ userId: '', subject: '', message: '', category: 'other', priority: 'medium' });
  const [stats, setStats] = useState({ total: 0, unread: 0, open: 0, urgent: 0 });
  const chatEndRef = useRef(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => { 
    fetchTickets(); 
    fetchUsers(); 
  }, []);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(fetchTickets, 5000); // Refresh every 5 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  useEffect(() => { 
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); 
  }, [selectedTicket?.replies]);

  const fetchTickets = async () => {
    const res = await fetch('/api/admin/tickets');
    if (res.ok) {
      const data = await res.json();
      const ticketList = data.tickets || [];
      setTickets(ticketList);
      
      // Calculate stats
      setStats({
        total: ticketList.length,
        unread: ticketList.filter(t => t.unreadByAdmin).length,
        open: ticketList.filter(t => ['open', 'replied', 'in_progress'].includes(t.status)).length,
        urgent: ticketList.filter(t => t.priority === 'urgent' && t.status !== 'closed').length,
      });
    }
  };

  const fetchUsers = async () => {
    const res = await fetch('/api/admin/users');
    if (res.ok) {
      const data = await res.json();
      setUsers((data.users || []).filter(u => u.role !== 'admin'));
    }
  };

  const markAsRead = async (ticketId) => {
    try {
      await fetch('/api/admin/tickets/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId }),
      });
      fetchTickets();
    } catch (error) {
      console.error('Failed to mark as read');
    }
  };

  const handleSelectTicket = (ticket) => {
    setSelectedTicket(ticket);
    if (ticket.unreadByAdmin) {
      markAsRead(ticket._id);
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!reply.trim()) return;
    try {
      const res = await fetch('/api/admin/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId: selectedTicket._id, reply }),
      });
      if (res.ok) {
        const data = await res.json();
        setReply('');
        setSelectedTicket(data.ticket);
        fetchTickets();
        toast.success('Reply sent!');
      }
    } catch { toast.error('Failed to send reply'); }
  };

  const handleStatusChange = async (status) => {
    try {
      const res = await fetch('/api/admin/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId: selectedTicket._id, status }),
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedTicket(data.ticket);
        fetchTickets();
        toast.success(`Ticket marked as ${status}`);
      }
    } catch { toast.error('Failed to update status'); }
  };

  const handleNewMessage = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/tickets/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMsg),
      });
      if (res.ok) {
        const data = await res.json();
        toast.success(`Ticket #${data.ticket.ticketNumber} created!`);
        setShowNewModal(false);
        setNewMsg({ userId: '', subject: '', message: '', category: 'other', priority: 'medium' });
        await fetchTickets();
        setSelectedTicket(data.ticket);
      }
    } catch { toast.error('Failed to send message'); }
  };

  const handleDelete = async (ticketId) => {
    if (!confirm('Delete this ticket permanently?')) return;
    try {
      const res = await fetch('/api/admin/tickets', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId }),
      });
      if (res.ok) {
        toast.success('Ticket deleted');
        setTickets(prev => prev.filter(t => t._id !== ticketId));
        if (selectedTicket?._id === ticketId) setSelectedTicket(null);
      }
    } catch { toast.error('Failed to delete ticket'); }
  };

  const filtered = tickets.filter(t => {
    const matchFilter = filter === 'all' || 
                       (filter === 'unread' && t.unreadByAdmin) ||
                       (filter === 'urgent' && t.priority === 'urgent') ||
                       t.status === filter;
    const matchSearch = !search ||
      t.subject?.toLowerCase().includes(search.toLowerCase()) ||
      t.ticketNumber?.toLowerCase().includes(search.toLowerCase()) ||
      t.userId?.name?.toLowerCase().includes(search.toLowerCase()) ||
      t.userId?.email?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div className="space-y-4">
      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Tickets', value: stats.total, icon: ChatBubbleLeftRightIcon, color: 'from-blue-500 to-cyan-500' },
          { label: 'Unread', value: stats.unread, icon: BellSolid, color: 'from-amber-500 to-orange-500' },
          { label: 'Open', value: stats.open, icon: ExclamationCircleIcon, color: 'from-purple-500 to-pink-500' },
          { label: 'Urgent', value: stats.urgent, icon: FlagIcon, color: 'from-red-500 to-rose-500' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{value}</span>
            </div>
            <p className="text-sm text-gray-600">{label}</p>
          </div>
        ))}
      </div>

      {/* Main Panel */}
      <div className="flex h-[calc(100dvh-16rem)] gap-0 bg-white rounded-2xl border border-gray-100 overflow-hidden">

        {/* LEFT PANEL — Ticket List */}
        <div className="w-96 flex-shrink-0 border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200 space-y-3">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                Support Tickets
                {stats.unread > 0 && (
                  <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full animate-pulse">
                    {stats.unread}
                  </span>
                )}
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={`p-2 rounded-lg transition-colors ${autoRefresh ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}
                  title={autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
                >
                  <SparklesIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowNewModal(true)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700"
                >
                  <PlusIcon className="w-4 h-4" /> New
                </button>
              </div>
            </div>
            <div className="relative">
              <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search tickets..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div className="flex gap-1 flex-wrap">
              {['all', 'unread', 'urgent', 'open', 'in_progress', 'resolved', 'closed'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-2.5 py-1 text-xs rounded-lg capitalize font-medium transition-colors ${
                    filter === f ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {f.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <AnimatePresence>
              {filtered.length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-sm">No tickets found</div>
              ) : (
                filtered.map((ticket, i) => {
                  const cat = CATEGORIES[ticket.category] || CATEGORIES.other;
                  return (
                    <motion.div
                      key={ticket._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: i * 0.02 }}
                      onClick={() => handleSelectTicket(ticket)}
                      className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors relative ${
                        selectedTicket?._id === ticket._id ? 'bg-indigo-50 border-l-4 border-l-indigo-600' : ''
                      } ${ticket.unreadByAdmin ? 'bg-blue-50/50' : ''}`}
                    >
                      {ticket.unreadByAdmin && (
                        <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                      )}
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cat.color}`}>
                              {cat.icon} {cat.label}
                            </span>
                            <FlagIcon className={`w-3 h-3 ${PRIORITY_COLORS[ticket.priority]}`} />
                          </div>
                          <p className="text-sm font-semibold text-gray-900 truncate">{ticket.subject}</p>
                          <p className="text-xs text-gray-500 truncate mt-0.5">
                            #{ticket.ticketNumber} · {ticket.userId?.name}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[ticket.status]}`}>
                          {ticket.status.replace('_', ' ')}
                        </span>
                        <p className="text-xs text-gray-400">
                          {new Date(ticket.lastActivityAt || ticket.createdAt).toLocaleDateString('en-IN', { 
                            day: 'numeric', 
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* RIGHT PANEL — Chat (rest remains similar but with ticket number display) */}
        <div className="flex-1 flex flex-col">
          {!selectedTicket ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
              <ChatBubbleLeftRightIcon className="w-16 h-16 mb-4 opacity-30" />
              <p className="text-lg font-medium">Select a ticket to view</p>
              <p className="text-sm mt-1">or click New to message a user</p>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-900">{selectedTicket.subject}</h3>
                      <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded font-mono">
                        #{selectedTicket.ticketNumber}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{selectedTicket.userId?.name} · {selectedTicket.userId?.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[selectedTicket.status]}`}>
                      {selectedTicket.status.replace('_', ' ')}
                    </span>
                    {selectedTicket.status !== 'closed' && (
                      <>
                        <button
                          onClick={() => handleStatusChange('in_progress')}
                          className="px-3 py-1 bg-purple-100 text-purple-800 rounded-lg text-xs font-medium hover:bg-purple-200"
                        >
                          In Progress
                        </button>
                        <button
                          onClick={() => handleStatusChange('resolved')}
                          className="px-3 py-1 bg-green-100 text-green-800 rounded-lg text-xs font-medium hover:bg-green-200"
                        >
                          Resolve
                        </button>
                        <button
                          onClick={() => handleStatusChange('closed')}
                          className="px-3 py-1 bg-gray-100 text-gray-800 rounded-lg text-xs font-medium hover:bg-gray-200"
                        >
                          Close
                        </button>
                      </>
                    )}
                    {selectedTicket.status === 'closed' && (
                      <button
                        onClick={() => handleStatusChange('open')}
                        className="px-3 py-1 bg-amber-100 text-amber-800 rounded-lg text-xs font-medium hover:bg-amber-200"
                      >
                        Reopen
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(selectedTicket._id)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                      title="Delete ticket"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                    <button onClick={() => setSelectedTicket(null)} className="p-1 text-gray-400 hover:text-gray-600">
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-lg ${CATEGORIES[selectedTicket.category]?.color}`}>
                    {CATEGORIES[selectedTicket.category]?.icon} {CATEGORIES[selectedTicket.category]?.label}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-lg bg-gray-100 flex items-center gap-1 ${PRIORITY_COLORS[selectedTicket.priority]}`}>
                    <FlagIcon className="w-3 h-3" /> {selectedTicket.priority}
                  </span>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <ClockIcon className="w-3 h-3" />
                    Created {new Date(selectedTicket.createdAt).toLocaleDateString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                {/* Original message */}
                <div className="flex justify-start">
                  <div className="max-w-[70%]">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                        {selectedTicket.userId?.name?.charAt(0)}
                      </div>
                      <p className="text-xs text-gray-500">{selectedTicket.userId?.name}</p>
                    </div>
                    <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-gray-100">
                      <p className="text-sm text-gray-800 leading-relaxed">{selectedTicket.message}</p>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{new Date(selectedTicket.createdAt).toLocaleString('en-IN')}</p>
                  </div>
                </div>

                {/* Replies */}
                {selectedTicket.replies?.map((r, i) => (
                  <div key={i} className={`flex ${r.isAdmin ? 'justify-end' : 'justify-start'}`}>
                    <div className="max-w-[70%]">
                      {!r.isAdmin && (
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                            {selectedTicket.userId?.name?.charAt(0)}
                          </div>
                          <p className="text-xs text-gray-500">{selectedTicket.userId?.name}</p>
                        </div>
                      )}
                      {r.isAdmin && (
                        <div className="flex items-center gap-2 mb-1 justify-end">
                          <p className="text-xs text-indigo-600 font-medium">Support Team</p>
                          <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center">
                            <CheckCircleIcon className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      )}
                      <div className={`rounded-2xl px-4 py-3 shadow-sm ${
                        r.isAdmin 
                          ? 'bg-indigo-600 text-white rounded-tr-sm' 
                          : 'bg-white text-gray-800 rounded-tl-sm border border-gray-100'
                      }`}>
                        <p className="text-sm leading-relaxed">{r.message}</p>
                      </div>
                      <p className={`text-xs text-gray-400 mt-1 ${r.isAdmin ? 'text-right' : 'text-left'}`}>
                        {new Date(r.createdAt).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Reply Input */}
              {selectedTicket.status !== 'closed' ? (
                <form onSubmit={handleReply} className="p-4 border-t border-gray-200 bg-white">
                  <div className="flex gap-3 items-end">
                    <textarea
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      placeholder="Type your reply..."
                      className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none text-sm"
                      rows="2"
                      onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleReply(e); } }}
                      required
                    />
                    <button type="submit" className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors flex-shrink-0">
                      <PaperAirplaneIcon className="w-5 h-5" />
                    </button>
                  </div>
                </form>
              ) : (
                <div className="p-4 border-t border-gray-200 bg-gray-50 text-center text-sm text-gray-500">
                  This ticket is closed.
                  <button onClick={() => handleStatusChange('open')} className="ml-2 text-indigo-600 hover:underline font-medium">
                    Reopen Ticket
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* New Message Modal - same as before but with category/priority */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} 
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">New Message to User</h2>
              <button onClick={() => setShowNewModal(false)} className="text-gray-400 hover:text-gray-600">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleNewMessage} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select User</label>
                <select value={newMsg.userId} onChange={(e) => setNewMsg({ ...newMsg, userId: e.target.value })}
                  className="input-field" required>
                  <option value="">-- Select User --</option>
                  {users.map(u => (
                    <option key={u._id} value={u._id}>{u.name} ({u.email}) — {u.role}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select value={newMsg.category} onChange={(e) => setNewMsg({ ...newMsg, category: e.target.value })}
                    className="input-field">
                    {Object.entries(CATEGORIES).map(([key, val]) => (
                      <option key={key} value={key}>{val.icon} {val.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select value={newMsg.priority} onChange={(e) => setNewMsg({ ...newMsg, priority: e.target.value })}
                    className="input-field">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input type="text" value={newMsg.subject}
                  onChange={(e) => setNewMsg({ ...newMsg, subject: e.target.value })}
                  className="input-field" placeholder="e.g. Important Update" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea value={newMsg.message}
                  onChange={(e) => setNewMsg({ ...newMsg, message: e.target.value })}
                  className="input-field" rows="4" placeholder="Type your message..." required />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowNewModal(false)} className="flex-1 btn-secondary">Cancel</button>
                <button type="submit" className="flex-1 btn-primary">Send Message</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
