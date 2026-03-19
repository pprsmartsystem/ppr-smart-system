'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChatBubbleLeftRightIcon, PlusIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function UserSupportPage() {
  const [tickets, setTickets] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [newTicket, setNewTicket] = useState({ subject: '', message: '' });
  const [reply, setReply] = useState('');

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    const res = await fetch('/api/user/tickets');
    if (res.ok) {
      const data = await res.json();
      setTickets(data.tickets || []);
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/user/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTicket),
      });
      if (res.ok) {
        toast.success('Ticket created!');
        setShowModal(false);
        setNewTicket({ subject: '', message: '' });
        fetchTickets();
      }
    } catch (error) {
      toast.error('Failed to create ticket');
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/user/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId: selectedTicket._id, reply }),
      });
      if (res.ok) {
        toast.success('Reply sent!');
        setReply('');
        fetchTickets();
        const updated = await res.json();
        setSelectedTicket(updated.ticket);
      }
    } catch (error) {
      toast.error('Failed to send reply');
    }
  };

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-gray-900">Help & Support</h1>
        <p className="text-gray-600 mt-2">Get help from our support team</p>
      </motion.div>

      {!selectedTicket ? (
        <>
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">My Tickets</h2>
            <button onClick={() => setShowModal(true)} className="btn-primary">
              <PlusIcon className="w-4 h-4 mr-2" />
              Create Ticket
            </button>
          </div>

          <div className="space-y-4">
            {tickets.map((ticket) => (
              <div key={ticket._id} className="stats-card hover:shadow-lg cursor-pointer" onClick={() => setSelectedTicket(ticket)}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900">{ticket.subject}</h3>
                    <p className="text-sm text-gray-600 mt-1">{(ticket.replies?.[0]?.isAdmin ? ticket.replies[0].message : ticket.message).substring(0, 100)}...</p>
                    <p className="text-xs text-gray-500 mt-2">{new Date(ticket.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    ticket.status === 'open' ? 'bg-yellow-100 text-yellow-800' :
                    ticket.status === 'replied' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {ticket.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="stats-card">
          <button onClick={() => setSelectedTicket(null)} className="text-indigo-600 mb-4">← Back to Tickets</button>
          <h2 className="text-xl font-bold mb-4">{selectedTicket.subject}</h2>
          
          <div className="space-y-4 mb-6">
            {/* Only show original message if ticket was created by user (not admin-initiated) */}
            {!selectedTicket.replies?.[0]?.isAdmin && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">You</p>
                <p>{selectedTicket.message}</p>
              </div>
            )}
            
            {selectedTicket.replies?.map((reply, i) => (
              <div key={i} className={`p-4 rounded-lg ${reply.isAdmin ? 'bg-blue-50' : 'bg-gray-50'}`}>
                <p className="text-sm text-gray-600">{reply.isAdmin ? 'Support Team' : 'You'}</p>
                <p>{reply.message}</p>
                <p className="text-xs text-gray-500 mt-1">{new Date(reply.createdAt).toLocaleString()}</p>
              </div>
            ))}
          </div>

          {selectedTicket.status !== 'closed' && (
            <form onSubmit={handleReply} className="space-y-4">
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Type your reply..."
                className="input-field"
                rows="3"
                required
              />
              <button type="submit" className="btn-primary">Send Reply</button>
            </form>
          )}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-2xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-6">Create Support Ticket</h2>
            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                <input
                  type="text"
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea
                  value={newTicket.message}
                  onChange={(e) => setNewTicket({ ...newTicket, message: e.target.value })}
                  className="input-field"
                  rows="4"
                  required
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 btn-secondary">Cancel</button>
                <button type="submit" className="flex-1 btn-primary">Create Ticket</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}