'use client';

import { useState, useEffect } from 'react';
import { BellIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { PageHeader } from '@/components/ui/AdminComponents';

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
    <div className="space-y-5">
      <PageHeader icon={BellIcon} title="Notifications" subtitle="Payment requests and system alerts" color="from-amber-500 to-orange-500" />

      <div className="space-y-3">
        {notifications.length > 0 ? notifications.map((notif) => (
          <div key={notif._id} className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <BellIcon className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-semibold text-gray-900 text-sm">{notif.userId?.name}</p>
                  <span className="text-xs text-gray-400">{new Date(notif.createdAt).toLocaleString('en-IN')}</span>
                </div>
                <p className="text-sm text-gray-600">{notif.description}</p>
                <p className="text-sm font-semibold text-indigo-600 mt-1">₹{notif.amount?.toFixed(2)}</p>
                {notif.type === 'payment_request' && notif.metadata && (
                  <div className="mt-2 text-xs text-gray-500 bg-gray-50 rounded-lg p-2">
                    <p>UTR: <span className="font-mono font-semibold">{notif.reference}</span></p>
                    <p>Name: {notif.metadata.name}</p>
                  </div>
                )}
                {notif.type === 'payment_request' && notif.status === 'pending' && (
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => handlePaymentAction(notif._id, 'approve')} className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700">
                      <CheckIcon className="w-4 h-4" /> Approve
                    </button>
                    <button onClick={() => handlePaymentAction(notif._id, 'reject')} className="flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700">
                      <XMarkIcon className="w-4 h-4" /> Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )) : (
          <div className="bg-white rounded-2xl border border-gray-100 text-center py-16">
            <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-3">
              <BellIcon className="w-7 h-7 text-gray-300" />
            </div>
            <p className="text-sm text-gray-400">No notifications</p>
          </div>
        )}
      </div>
    </div>
  );
}
