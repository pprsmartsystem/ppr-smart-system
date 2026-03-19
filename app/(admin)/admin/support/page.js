'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  open: 'bg-yellow-100 text-yellow-800',
  replied: 'bg-blue-100 text-blue-800',
  closed: 'bg-green-100 text-green-800',
};

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [reply, setReply] = useState('');
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [newMsg, setNewMsg] = useState({ userId: '', subject: '', message: '' });
  const chatEndRef = useRef(null);

  useEffect(() => { fetchTickets(); fetchUsers(); }, []);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [selectedTicket]);

  const fetchTickets = async () => {
    const res = await fetch('/api/admin/tickets');
    if (res.ok) {
      const data = await res.json();
      setTickets(data.tickets || []);
    }
  };

  const fetchUsers = async () => {
    const res = await fetch('/api/admin/users');
    if (res.ok) {
      const data = await res.json();
      setUsers((data.users || []).filter(u => u.role !== 'admin'));
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
        toast.success('Message sent!');
        setShowNewModal(false);
        setNewMsg({ userId: '', subject: '', message: '' });
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
    const matchFilter = filter === 'all' || t.status === filter;
    const matchSearch = !search ||
      t.subject?.toLowerCase().includes(search.toLowerCase()) ||
      t.userId?.name?.toLowerCase().includes(search.toLowerCase()) ||
      t.userId?.email?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div className="flex h-[calc(100vh-80px)] gap-0 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">

      {/* LEFT PANEL — Ticket List */}
      <div className="w-80 flex-shrink-0 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-bold text-gray-900">Support</h2>
            <button
              onClick={() => setShowNewModal(true)}
              className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700"
            >
              <PlusIcon className="w-4 h-4" /> New
            </button>
          </div>
          <div className="relative mb-3">
            <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
          <div className="flex gap-1">
            {['all', 'open', 'replied', 'closed'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 py-1 text-xs rounded-lg capitalize font-medium transition-colors ${filter === f ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">No tickets found</div>
          ) : (
            filtered.map(ticket => (
              <div
                key={ticket._id}
                onClick={() => setSelectedTicket(ticket)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${selectedTicket?._id === ticket._id ? 'bg-indigo-50 border-l-4 border-l-indigo-600' : ''}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <p className="text-sm font-semibold text-gray-900 truncate flex-1">{ticket.subject}</p>
                  <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[ticket.status]}`}>
                      {ticket.status}
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(ticket._id); }}
                      className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"
                      title="Delete ticket"
                    >
                      <TrashIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-gray-500 truncate">{ticket.userId?.name} · {ticket.userId?.email}</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(ticket.createdAt).toLocaleDateString()}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* RIGHT PANEL — Chat */}
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
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <div>
                <h3 className="font-bold text-gray-900">{selectedTicket.subject}</h3>
                <p className="text-sm text-gray-500">{selectedTicket.userId?.name} · {selectedTicket.userId?.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[selectedTicket.status]}`}>
                  {selectedTicket.status}
                </span>
                {selectedTicket.status !== 'closed' && (
                  <button
                    onClick={() => handleStatusChange('closed')}
                    className="px-3 py-1 bg-green-100 text-green-800 rounded-lg text-xs font-medium hover:bg-green-200"
                  >
                    Close
                  </button>
                )}
                {selectedTicket.status === 'closed' && (
                  <button
                    onClick={() => handleStatusChange('open')}
                    className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-lg text-xs font-medium hover:bg-yellow-200"
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

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {/* Original message from user (if not admin-initiated) */}
              {!selectedTicket.replies?.[0]?.isAdmin && (
                <div className="flex justify-start">
                  <div className="max-w-[70%]">
                    <p className="text-xs text-gray-500 mb-1">{selectedTicket.userId?.name}</p>
                    <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3">
                      <p className="text-sm text-gray-800">{selectedTicket.message}</p>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{new Date(selectedTicket.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              )}

              {/* All replies */}
              {selectedTicket.replies?.map((r, i) => (
                <div key={i} className={`flex ${r.isAdmin ? 'justify-end' : 'justify-start'}`}>
                  <div className="max-w-[70%]">
                    <p className="text-xs text-gray-500 mb-1">{r.isAdmin ? 'You (Admin)' : selectedTicket.userId?.name}</p>
                    <div className={`rounded-2xl px-4 py-3 ${r.isAdmin ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-gray-100 text-gray-800 rounded-tl-sm'}`}>
                      <p className="text-sm">{r.message}</p>
                    </div>
                    <p className="text-xs text-gray-400 mt-1 text-right">{new Date(r.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Reply Input */}
            {selectedTicket.status !== 'closed' ? (
              <form onSubmit={handleReply} className="p-4 border-t border-gray-200 flex gap-3 items-end">
                <textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none text-sm"
                  rows="2"
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleReply(e); } }}
                  required
                />
                <button type="submit" className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors flex-shrink-0">
                  <PaperAirplaneIcon className="w-5 h-5" />
                </button>
              </form>
            ) : (
              <div className="p-4 border-t border-gray-200 text-center text-sm text-gray-400">
                This ticket is closed.
                <button onClick={() => handleStatusChange('open')} className="ml-2 text-indigo-600 hover:underline">Reopen</button>
              </div>
            )}
          </>
        )}
      </div>

      {/* New Message Modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">New Message to User</h2>
              <button onClick={() => setShowNewModal(false)} className="text-gray-400 hover:text-gray-600">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleNewMessage} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select User</label>
                <select
                  value={newMsg.userId}
                  onChange={(e) => setNewMsg({ ...newMsg, userId: e.target.value })}
                  className="input-field"
                  required
                >
                  <option value="">-- Select User --</option>
                  {users.map(u => (
                    <option key={u._id} value={u._id}>{u.name} ({u.email}) — {u.role}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input
                  type="text"
                  value={newMsg.subject}
                  onChange={(e) => setNewMsg({ ...newMsg, subject: e.target.value })}
                  className="input-field"
                  placeholder="e.g. Important Update"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  value={newMsg.message}
                  onChange={(e) => setNewMsg({ ...newMsg, message: e.target.value })}
                  className="input-field"
                  rows="4"
                  placeholder="Type your message..."
                  required
                />
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
