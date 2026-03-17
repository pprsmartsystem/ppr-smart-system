'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ClipboardDocumentListIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/admin/audit-logs');
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch (error) {
      toast.error('Failed to load logs');
    } finally {
      setLoading(false);
    }
  };

  const getModuleColor = (module) => {
    const colors = {
      service: 'bg-blue-100 text-blue-800',
      order: 'bg-green-100 text-green-800',
      invoice: 'bg-purple-100 text-purple-800',
      user: 'bg-yellow-100 text-yellow-800',
      payment: 'bg-pink-100 text-pink-800',
      delivery: 'bg-indigo-100 text-indigo-800',
      settings: 'bg-gray-100 text-gray-800',
    };
    return colors[module] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
        <p className="text-gray-600 mt-2">Track all admin activities and system changes</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-xl shadow-sm border border-gray-200">
        {loading ? (
          <div className="p-6 space-y-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : logs.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {logs.map((log) => (
              <div key={log._id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getModuleColor(log.module)}`}>
                        {log.module}
                      </span>
                      <span className="text-sm font-medium text-gray-900">{log.userId?.name}</span>
                    </div>
                    <p className="text-sm text-gray-700">{log.action}</p>
                    {log.details && (
                      <p className="text-xs text-gray-500 mt-1">{log.details}</p>
                    )}
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-xs text-gray-500">{new Date(log.createdAt).toLocaleDateString()}</p>
                    <p className="text-xs text-gray-400">{new Date(log.createdAt).toLocaleTimeString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <ClipboardDocumentListIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No audit logs found</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
