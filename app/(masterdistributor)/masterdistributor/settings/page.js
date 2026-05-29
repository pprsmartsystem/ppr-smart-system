'use client';

import { useState, useEffect } from 'react';
import { CogIcon } from '@heroicons/react/24/outline';
import { PageHeader } from '@/components/ui/AdminComponents';
import toast from 'react-hot-toast';

export default function MasterDistributorSettingsPage() {
  const [profile, setProfile] = useState({ name: '', email: '', phone: '' });
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(d => {
        if (d.user) setProfile({ name: d.user.name || '', email: d.user.email || '', phone: d.user.phone || '' });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPass !== passwords.confirm) {
      toast.error('New passwords do not match');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: passwords.current, newPassword: passwords.newPass }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Password changed successfully');
        setPasswords({ current: '', newPass: '', confirm: '' });
      } else {
        toast.error(data.error || 'Failed to change password');
      }
    } catch { toast.error('Error changing password'); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="h-64 bg-gray-200 rounded-2xl animate-pulse" />;

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      <PageHeader icon={CogIcon} title="Settings" subtitle="Manage your account settings" color="from-gray-500 to-slate-600" />

      {/* Profile Info */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h3 className="font-bold text-gray-900 mb-4">Profile Information</h3>
        <div className="space-y-3">
          {[
            { label: 'Full Name', value: profile.name },
            { label: 'Email Address', value: profile.email },
            { label: 'Phone Number', value: profile.phone || 'Not set' },
            { label: 'Role', value: 'Master Distributor' },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <span className="text-sm text-gray-500">{label}</span>
              <span className="text-sm font-semibold text-gray-900">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h3 className="font-bold text-gray-900 mb-4">Change Password</h3>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Current Password</label>
            <input type="password" value={passwords.current} onChange={e => setPasswords(p => ({ ...p, current: e.target.value }))}
              className="input-field" required placeholder="Enter current password" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
            <input type="password" value={passwords.newPass} onChange={e => setPasswords(p => ({ ...p, newPass: e.target.value }))}
              className="input-field" required placeholder="Enter new password" minLength={6} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm New Password</label>
            <input type="password" value={passwords.confirm} onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))}
              className="input-field" required placeholder="Confirm new password" minLength={6} />
          </div>
          <button type="submit" disabled={saving}
            className="w-full py-3 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 disabled:opacity-50 transition-colors">
            {saving ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
