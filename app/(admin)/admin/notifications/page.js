'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  BellIcon, CheckIcon, XMarkIcon, ArrowPathIcon,
  BanknotesIcon, ClockIcon, CheckCircleIcon, XCircleIcon,
  UserCircleIcon, ReceiptRefundIcon, FunnelIcon,
} from '@heroicons/react/24/outline';
import { PageHeader } from '@/components/ui/AdminComponents';

const TABS = [
  { key: 'all',      label: 'All',      color: 'text-gray-600' },
  { key: 'pending',  label: 'Pending',  color: 'text-amber-600' },
  { key: 'completed',label: 'Approved', color: 'text-green-600' },
  { key: 'failed',   label: 'Rejected', color: 'text-red-600' },
];

function timeAgo(date) {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [processingId, setProcessingId] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [newCount, setNewCount] = useState(0);

  const fetchNotifications = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    try {
      const res = await fetch('/api/admin/notifications', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        const fresh = data.notifications || [];
        setNotifications(prev => {
          const newPending = fresh.filter(n => n.status === 'pending').length;
          const oldPending = prev.filter(n => n.status === 'pending').length;
          if (newPending > oldPending && prev.length > 0) {
            setNewCount(newPending - oldPending);
            setTimeout(() => setNewCount(0), 3000);
          }
          return fresh;
        });
        setLastUpdated(new Date());
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const t = setInterval(() => fetchNotifications(), 15000);
    return () => clearInterval(t);
  }, [fetchNotifications]);

  const handleAction = async (id, action) => {
    setProcessingId(id);
    try {
      const res = await fetch('/api/admin/payment-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ transactionId: id, action }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(action === 'approve' ? '✓ Payment approved & wallet credited' : 'Payment rejected');
        fetchNotifications();
      } else {
        toast.error(data.error || 'Action failed');
      }
    } catch { toast.error('Error processing request'); }
    finally { setProcessingId(null); }
  };

  const filtered = notifications.filter(n =>
    activeTab === 'all' ? true : n.status === activeTab
  );

  const stats = {
    total:     notifications.length,
    pending:   notifications.filter(n => n.status === 'pending').length,
    approved:  notifications.filter(n => n.status === 'completed').length,
    rejected:  notifications.filter(n => n.status === 'failed').length,
    totalAmt:  notifications.filter(n => n.status === 'pending').reduce((s, n) => s + (n.amount || 0), 0),
  };

  if (loading) return (
    <div className="space-y-4 animate-pulse">
      <div className="h-12 bg-gray-200 rounded-2xl w-1/3" />
      <div className="grid grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-gray-200 rounded-2xl" />)}</div>
      {[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-gray-200 rounded-2xl" />)}
    </div>
  );

  return (
    <div className="space-y-5 max-w-4xl">

      {/* Header */}
      <PageHeader
        icon={BellIcon}
        title="Notifications"
        subtitle="Payment requests and system alerts"
        color="from-amber-500 to-orange-500"
        action={
          <div className="flex items-center gap-3">
            {lastUpdated && (
              <span className="text-xs text-gray-400 hidden sm:block">
                Updated {timeAgo(lastUpdated)}
              </span>
            )}
            <button
              onClick={() => fetchNotifications(true)}
              disabled={refreshing}
              className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <ArrowPathIcon className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        }
      />

      {/* New notification alert */}
      <AnimatePresence>
        {newCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="bg-indigo-600 text-white rounded-2xl px-5 py-3 flex items-center gap-3"
          >
            <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <p className="text-sm font-semibold">{newCount} new payment request{newCount > 1 ? 's' : ''} received!</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Requests', value: stats.total,    icon: BellIcon,          bg: 'bg-gray-50',    ic: 'text-gray-600',   val: 'text-gray-900' },
          { label: 'Pending',        value: stats.pending,  icon: ClockIcon,         bg: 'bg-amber-50',   ic: 'text-amber-600',  val: 'text-amber-700' },
          { label: 'Approved',       value: stats.approved, icon: CheckCircleIcon,   bg: 'bg-green-50',   ic: 'text-green-600',  val: 'text-green-700' },
          { label: 'Rejected',       value: stats.rejected, icon: XCircleIcon,       bg: 'bg-red-50',     ic: 'text-red-500',    val: 'text-red-700' },
        ].map(({ label, value, icon: Icon, bg, ic, val }) => (
          <div key={label} className={`${bg} rounded-2xl p-4 border border-white`}>
            <div className="flex items-center gap-2 mb-2">
              <Icon className={`w-4 h-4 ${ic}`} />
              <span className="text-xs text-gray-500 font-medium">{label}</span>
            </div>
            <p className={`text-2xl font-bold ${val}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Pending amount banner */}
      {stats.pending > 0 && (
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <BanknotesIcon className="w-6 h-6" />
            <div>
              <p className="font-bold text-sm">{stats.pending} pending payment request{stats.pending > 1 ? 's' : ''}</p>
              <p className="text-amber-100 text-xs">Total pending: ₹{stats.totalAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
            </div>
          </div>
          <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
        </div>
      )}

      {/* Tabs + Filter */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {/* Tab bar */}
        <div className="flex items-center justify-between px-4 pt-4 pb-0 border-b border-gray-100">
          <div className="flex gap-1">
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 text-sm font-semibold rounded-t-xl transition-all border-b-2 ${
                  activeTab === tab.key
                    ? `${tab.color} border-current bg-gray-50`
                    : 'text-gray-400 border-transparent hover:text-gray-600'
                }`}
              >
                {tab.label}
                {tab.key === 'pending' && stats.pending > 0 && (
                  <span className="ml-1.5 bg-amber-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                    {stats.pending}
                  </span>
                )}
              </button>
            ))}
          </div>
          <span className="text-xs text-gray-400 pb-2">{filtered.length} records</span>
        </div>

        {/* Notification list */}
        <div className="divide-y divide-gray-50">
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-3">
                <BellIcon className="w-7 h-7 text-gray-300" />
              </div>
              <p className="text-sm text-gray-400 font-medium">No {activeTab === 'all' ? '' : activeTab} notifications</p>
            </div>
          ) : (
            filtered.map((notif, i) => {
              const isPending   = notif.status === 'pending';
              const isApproved  = notif.status === 'completed';
              const isRejected  = notif.status === 'failed';
              const isProcessing = processingId === notif._id;

              return (
                <motion.div
                  key={notif._id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={`p-5 hover:bg-gray-50/50 transition-colors ${isPending ? 'border-l-4 border-l-amber-400' : isApproved ? 'border-l-4 border-l-green-400' : isRejected ? 'border-l-4 border-l-red-400' : ''}`}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      isPending ? 'bg-amber-50' : isApproved ? 'bg-green-50' : 'bg-red-50'
                    }`}>
                      {isPending
                        ? <ClockIcon className="w-5 h-5 text-amber-600" />
                        : isApproved
                        ? <CheckCircleIcon className="w-5 h-5 text-green-600" />
                        : <XCircleIcon className="w-5 h-5 text-red-500" />}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-bold text-gray-900">{notif.userId?.name || 'Unknown'}</p>
                          <span className="text-xs text-gray-400">{notif.userId?.email}</span>
                        </div>
                        <span className="text-xs text-gray-400 flex-shrink-0">{timeAgo(notif.createdAt)}</span>
                      </div>

                      <p className="text-sm text-gray-600 mb-2">{notif.description}</p>

                      {/* Amount + UTR */}
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-lg font-bold text-gray-900">
                          ₹{notif.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                        {notif.reference && (
                          <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-1 rounded-lg">
                            UTR: {notif.reference}
                          </span>
                        )}
                        {notif.metadata?.name && (
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            <UserCircleIcon className="w-3.5 h-3.5" /> {notif.metadata.name}
                          </span>
                        )}
                        {/* Status badge */}
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                          isPending  ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-200' :
                          isApproved ? 'bg-green-50 text-green-700 ring-1 ring-green-200' :
                                       'bg-red-50 text-red-600 ring-1 ring-red-200'
                        }`}>
                          {isPending ? 'Pending' : isApproved ? 'Approved' : 'Rejected'}
                        </span>
                      </div>

                      {/* Action buttons — only for pending */}
                      {isPending && (
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => handleAction(notif._id, 'approve')}
                            disabled={isProcessing}
                            className="flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
                          >
                            {isProcessing
                              ? <ArrowPathIcon className="w-4 h-4 animate-spin" />
                              : <CheckIcon className="w-4 h-4" />}
                            Approve & Credit
                          </button>
                          <button
                            onClick={() => handleAction(notif._id, 'reject')}
                            disabled={isProcessing}
                            className="flex items-center gap-1.5 px-4 py-2 bg-white border border-red-200 hover:bg-red-50 disabled:opacity-50 text-red-600 rounded-xl text-sm font-semibold transition-colors"
                          >
                            <XMarkIcon className="w-4 h-4" />
                            Reject
                          </button>
                        </div>
                      )}

                      {/* Approved info */}
                      {isApproved && (
                        <div className="mt-2 flex items-center gap-1.5 text-xs text-green-600">
                          <CheckCircleIcon className="w-3.5 h-3.5" />
                          Wallet credited successfully
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      {/* Auto-refresh indicator */}
      <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
        <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
        Auto-refreshing every 15 seconds
      </div>
    </div>
  );
}
