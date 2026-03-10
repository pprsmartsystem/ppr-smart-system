'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [reply, setReply] = useState('');

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    const res = await fetch('/api/admin/tickets');
    if (res.ok) {
      const data = await res.json();
      setTickets(data.tickets || []);
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/tickets', {
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

  const handleStatusChange = async (status) => {
    try {
      const res = await fetch('/api/admin/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId: selectedTicket._id, status }),
      });
      if (res.ok) {
        toast.success('Status updated!');
        fetchTickets();
        const updated = await res.json();
        setSelectedTicket(updated.ticket);
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-gray-900">Support Tickets</h1>
        <p className="text-gray-600 mt-2">Manage customer support requests</p>
      </motion.div>

      {!selectedTicket ? (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <div key={ticket._id} className="stats-card hover:shadow-lg cursor-pointer" onClick={() => setSelectedTicket(ticket)}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-900">{ticket.subject}</h3>
                  <p className="text-sm text-gray-600 mt-1">From: {ticket.userId?.name} ({ticket.userId?.email})</p>
                  <p className="text-sm text-gray-600 mt-1">{ticket.message.substring(0, 100)}...</p>
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
      ) : (
        <div className="stats-card">
          <div className="flex justify-between items-center mb-4">
            <button onClick={() => setSelectedTicket(null)} className="text-indigo-600">← Back to Tickets</button>
            <div className="flex space-x-2">
              <button onClick={() => handleStatusChange('open')} className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-lg text-sm">Open</button>
              <button onClick={() => handleStatusChange('closed')} className="px-3 py-1 bg-green-100 text-green-800 rounded-lg text-sm">Close</button>
            </div>
          </div>
          
          <h2 className="text-xl font-bold mb-2">{selectedTicket.subject}</h2>
          <p className="text-sm text-gray-600 mb-4">From: {selectedTicket.userId?.name} ({selectedTicket.userId?.email})</p>
          
          <div className="space-y-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Customer</p>
              <p>{selectedTicket.message}</p>
            </div>
            
            {selectedTicket.replies?.map((reply, i) => (
              <div key={i} className={`p-4 rounded-lg ${reply.isAdmin ? 'bg-blue-50' : 'bg-gray-50'}`}>
                <p className="text-sm text-gray-600">{reply.isAdmin ? 'You (Admin)' : 'Customer'}</p>
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
    </div>
  );
}