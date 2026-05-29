'use client';

import { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, UsersIcon } from '@heroicons/react/24/outline';
import { PageHeader, StatusBadge } from '@/components/ui/AdminComponents';
import toast from 'react-hot-toast';

export default function MasterDistributorUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch('/api/masterdistributor/users')
      .then(r => r.json())
      .then(d => { setUsers(d.users || []); setLoading(false); })
      .catch(() => { toast.error('Failed to fetch users'); setLoading(false); });
  }, []);

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="space-y-4 animate-pulse">
      <div className="h-12 bg-gray-200 rounded-2xl w-1/3" />
      <div className="h-64 bg-gray-200 rounded-2xl" />
    </div>
  );

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      <PageHeader icon={UsersIcon} title="All Users" subtitle="Users under your distributors" color="from-purple-500 to-pink-500"
        action={
          <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-3 py-1.5 rounded-xl">
            <span className="font-semibold text-gray-900">{filtered.length}</span> users
          </div>
        }
      />

      {/* Search */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <div className="relative">
          <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search users by name or email..." value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-300" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                {['Name', 'Email', 'Distributor', 'Wallet', 'Status', 'Joined'].map((h) => (
                  <th key={h} className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 px-4"><p className="text-sm font-semibold text-gray-900">{user.name}</p></td>
                  <td className="py-3 px-4"><p className="text-sm text-gray-500">{user.email}</p></td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                      {user.distributorId?.name || '—'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <p className={`text-sm font-semibold ${user.walletBalance < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                      ₹{Math.abs(user.walletBalance?.toFixed(2) || 0)}
                    </p>
                  </td>
                  <td className="py-3 px-4"><StatusBadge status={user.status} /></td>
                  <td className="py-3 px-4"><p className="text-xs text-gray-400">{new Date(user.createdAt).toLocaleDateString('en-IN')}</p></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <div className="text-center py-12 text-sm text-gray-400">No users found</div>}
      </div>
    </div>
  );
}
