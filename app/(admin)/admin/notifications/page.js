'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BellIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/admin/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentAction = async (transactionId, action) => {
    try {
      const res = await fetch('/api/admin/payment-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId, action }),
      });
      
      if (res.ok) {
        toast.success(action === 'approve' ? 'Payment approved' : 'Payment rejected');
        fetchNotifications();
      } else {
        toast.error('Action failed');
      }
    } catch (error) {
      toast.error('Error processing request');
    }
  };

  if (loading) {
    return <div className="animate-pulse">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
        <p className="text-gray-600 mt-2">Settlement requests and system alerts</p>
      </motion.div>

      <div className="stats-card">
        {notifications.length > 0 ? (
          <div className="space-y-4">
            {notifications.map((notif) => (
              <div key={notif._id} className="flex items-start space-x-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <BellIcon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-semibold text-gray-900">{notif.userId?.name}</p>
                    <span className="text-xs text-gray-500">
                      {new Date(notif.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{notif.description}</p>
                  <p className="text-sm font-medium text-blue-600 mt-1">
                    Amount: ₹{notif.amount?.toFixed(2)}
                  </p>
                  {notif.type === 'payment_request' && notif.metadata && (
                    <div className="mt-2 text-sm text-gray-600">
                      <p>UTR: {notif.reference}</p>
                      <p>Name: {notif.metadata.name}</p>
                    </div>
                  )}
                  {notif.type === 'payment_request' && notif.status === 'pending' && (
                    <div className="flex space-x-2 mt-3">
                      <button
                        onClick={() => handlePaymentAction(notif._id, 'approve')}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-1"
                      >
                        <CheckIcon className="w-4 h-4" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => handlePaymentAction(notif._id, 'reject')}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-1"
                      >
                        <XMarkIcon className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <BellIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No notifications</p>
          </div>
        )}
      </div>
    </div>
  );
}
