'use client';

import { useState, useEffect } from 'react';
import { MegaphoneIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { PageHeader, StatusBadge, AdminModal, ActionBtn } from '@/components/ui/AdminComponents';

export default function BroadcastPage() {
  const [broadcasts, setBroadcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchBroadcasts();
  }, []);

  const fetchBroadcasts = async () => {
    try {
      const res = await fetch('/api/admin/broadcast');
      const data = await res.json();
      setBroadcasts(data.broadcasts || []);
    } catch (error) {
      toast.error('Failed to fetch broadcasts');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });

      if (res.ok) {
        toast.success('Broadcast created successfully');
        setMessage('');
        setShowModal(false);
        fetchBroadcasts();
      } else {
        toast.error('Failed to create broadcast');
      }
    } catch (error) {
      toast.error('Failed to create broadcast');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this broadcast?')) return;

    try {
      const res = await fetch(`/api/admin/broadcast?id=${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        toast.success('Broadcast deleted');
        fetchBroadcasts();
      } else {
        toast.error('Failed to delete broadcast');
      }
    } catch (error) {
      toast.error('Failed to delete broadcast');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader icon={MegaphoneIcon} title="Broadcast Messages" subtitle="Manage announcement popup bar" color="from-orange-500 to-amber-500"
        action={<button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700"><PlusIcon className="h-4 w-4" />New Broadcast</button>}
      />

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-gray-100 bg-gray-50/50">{['Message','Status','Created','Actions'].map((h,i) => <th key={h} className={`py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide ${i===3?'text-right':'text-left'}`}>{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-gray-50">
              {broadcasts.map((b) => (
                <tr key={b._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 text-sm text-gray-800 max-w-md whitespace-pre-line">{b.message}</td>
                  <td className="px-4 py-3"><StatusBadge status={b.isActive ? 'active' : 'inactive'} /></td>
                  <td className="px-4 py-3 text-xs text-gray-400">{new Date(b.createdAt).toLocaleDateString('en-IN')}</td>
                  <td className="px-4 py-3 text-right"><ActionBtn icon={TrashIcon} onClick={() => handleDelete(b._id)} color="text-red-500 hover:bg-red-50" title="Delete" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {broadcasts.length === 0 && <div className="text-center py-12 text-sm text-gray-400">No broadcasts yet</div>}
      </div>

      {showModal && (
        <AdminModal title="New Broadcast" subtitle="Announce to all users" onClose={() => setShowModal(false)}>
          <form onSubmit={handleCreate} className="space-y-4">
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Enter broadcast message..." className="input-field" rows="4" required />
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowModal(false)} className="flex-1 btn-secondary">Cancel</button>
              <button type="submit" className="flex-1 btn-primary">Create</button>
            </div>
          </form>
        </AdminModal>
      )}
    </div>
  );
}
