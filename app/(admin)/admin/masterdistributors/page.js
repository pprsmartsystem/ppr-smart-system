'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  PlusIcon, TrashIcon, WalletIcon, EyeIcon, EyeSlashIcon,
  PauseCircleIcon, PlayCircleIcon, StarIcon, CheckBadgeIcon,
} from '@heroicons/react/24/outline';
import { PageHeader, StatusBadge, AdminModal, ActionBtn } from '@/components/ui/AdminComponents';
import { MinusCircleIcon } from '@heroicons/react/24/outline';

export default function AdminMasterDistributorsPage() {
  const [masterDistributors, setMasterDistributors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [walletType, setWalletType] = useState('add');
  const [selected, setSelected] = useState(null);
  const [walletAmount, setWalletAmount] = useState('');
  const [walletRemark, setWalletRemark] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const res = await fetch('/api/admin/masterdistributors');
      if (res.ok) setMasterDistributors((await res.json()).masterDistributors || []);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/masterdistributors/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Master Distributor created!');
        setShowCreateModal(false);
        setForm({ name: '', email: '', password: '', phone: '' });
        fetchAll();
      } else {
        toast.error(data.error || 'Failed to create');
      }
    } catch { toast.error('Error creating'); }
  };

  const handleWallet = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/masterdistributors/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ masterDistributorId: selected._id, amount: parseFloat(walletAmount), action: walletType, remark: walletRemark }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        setShowWalletModal(false);
        setWalletAmount('');
        setWalletRemark('');
        setSelected(null);
        fetchAll();
      } else {
        toast.error(data.error || 'Failed');
      }
    } catch { toast.error('Error'); }
  };

  const handleHold = async (md, action) => {
    const reason = action === 'hold' ? prompt('Reason for hold (optional):') : null;
    if (action === 'hold' && reason === null) return;
    try {
      const res = await fetch('/api/admin/masterdistributors/hold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ masterDistributorId: md._id, action, reason }),
      });
      const data = await res.json();
      if (res.ok) { toast.success(data.message); fetchAll(); }
      else toast.error(data.error || 'Failed');
    } catch { toast.error('Error'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this Master Distributor? Their distributors will be unlinked but not deleted.')) return;
    try {
      const res = await fetch('/api/admin/masterdistributors/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ masterDistributorId: id }),
      });
      const data = await res.json();
      if (res.ok) { toast.success(data.message); fetchAll(); }
      else toast.error(data.error || 'Failed');
    } catch { toast.error('Error'); }
  };

  const handleActivate = async (id) => {
    if (!confirm('Activate settlement for this Master Distributor? The ₹25,000 limit will be removed.')) return;
    try {
      const res = await fetch('/api/admin/masterdistributors/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ masterDistributorId: id }),
      });
      const data = await res.json();
      if (res.ok) { toast.success(data.message); fetchAll(); }
      else toast.error(data.error || 'Failed');
    } catch { toast.error('Error'); }
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$';
    let p = '';
    for (let i = 0; i < 12; i++) p += chars.charAt(Math.floor(Math.random() * chars.length));
    setForm(f => ({ ...f, password: p }));
  };

  if (loading) return (
    <div className="space-y-4 animate-pulse">
      <div className="h-12 bg-gray-200 rounded-2xl w-1/3" />
      <div className="h-64 bg-gray-200 rounded-2xl" />
    </div>
  );

  return (
    <div className="space-y-5">
      <PageHeader
        icon={StarIcon}
        title="Master Distributors"
        subtitle="Manage master distributor accounts"
        color="from-purple-600 to-indigo-600"
        action={
          <button onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700 transition-colors">
            <PlusIcon className="h-4 w-4" /> Create Master Distributor
          </button>
        }
      />

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                {['Name', 'Email', 'Phone', 'Wallet', 'Distributors', 'Settlement', 'Status', 'Joined', 'Actions'].map((h, i) => (
                  <th key={h} className={`py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide ${i === 8 ? 'text-right' : 'text-left'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {masterDistributors.map((md) => (
                <tr key={md._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                        <StarIcon className="w-3.5 h-3.5 text-white" />
                      </div>
                      <p className="text-sm font-semibold text-gray-900">{md.name}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4"><p className="text-sm text-gray-500">{md.email}</p></td>
                  <td className="py-3 px-4"><p className="text-sm text-gray-500">{md.phone || '—'}</p></td>
                  <td className="py-3 px-4">
                    <p className={`text-sm font-semibold ${md.walletBalance < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                      ₹{Math.abs(md.walletBalance?.toFixed(2) || 0)}
                      {md.walletBalance < 0 && <span className="ml-1 text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full">Debt</span>}
                    </p>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                      {md.distributorCount || 0} distributors
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {md.isOnHold
                      ? <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">On Hold</span>
                      : <StatusBadge status={md.status} />}
                  </td>
                  <td className="py-3 px-4">
                    {md.settlementActivated
                      ? <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">✓ Activated</span>
                      : <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">₹25K Limit</span>}
                  </td>
                  <td className="py-3 px-4"><p className="text-xs text-gray-400">{new Date(md.createdAt).toLocaleDateString('en-IN')}</p></td>
                  <td className="py-3 px-4">
                    <div className="flex justify-end gap-1">
                      <ActionBtn icon={EyeIcon} onClick={() => window.open(`/api/admin/users/impersonate?userId=${md._id}`, '_blank')} color="text-indigo-600 hover:bg-indigo-50" title="View as Master Distributor" />
                      <ActionBtn icon={WalletIcon} onClick={() => { setSelected(md); setWalletType('add'); setShowWalletModal(true); }} color="text-green-600 hover:bg-green-50" title="Add Balance" />
                      <ActionBtn icon={MinusCircleIcon} onClick={() => { setSelected(md); setWalletType('deduct'); setShowWalletModal(true); }} color="text-orange-600 hover:bg-orange-50" title="Deduct Balance" />
                      {!md.settlementActivated && (
                        <ActionBtn icon={CheckBadgeIcon} onClick={() => handleActivate(md._id)} color="text-purple-600 hover:bg-purple-50" title="Activate Settlement" />
                      )}
                      {md.isOnHold
                        ? <ActionBtn icon={PlayCircleIcon} onClick={() => handleHold(md, 'unhold')} color="text-green-600 hover:bg-green-50" title="Remove Hold" />
                        : <ActionBtn icon={PauseCircleIcon} onClick={() => handleHold(md, 'hold')} color="text-amber-600 hover:bg-amber-50" title="Place on Hold" />}
                      <ActionBtn icon={TrashIcon} onClick={() => handleDelete(md._id)} color="text-red-600 hover:bg-red-50" title="Delete" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {masterDistributors.length === 0 && (
          <div className="text-center py-12 text-sm text-gray-400">No master distributors found</div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <AdminModal title="Create Master Distributor" subtitle="New master distributor account" onClose={() => { setShowCreateModal(false); setForm({ name: '', email: '', password: '', phone: '' }); }}>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
              <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone (optional)</label>
              <input type="text" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} className="input-field pr-20" required minLength={6} />
                <button type="button" onClick={() => setShowPassword(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPassword ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                </button>
              </div>
              <button type="button" onClick={generatePassword} className="mt-1.5 text-xs text-purple-600 hover:text-purple-700 font-medium">Generate Password</button>
            </div>
            <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 text-xs text-amber-800">
              Save the password before closing. It cannot be retrieved later.
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => { setShowCreateModal(false); setForm({ name: '', email: '', password: '', phone: '' }); }} className="flex-1 btn-secondary">Cancel</button>
              <button type="submit" className="flex-1 py-3 rounded-xl bg-purple-600 text-white font-semibold hover:bg-purple-700">Create</button>
            </div>
          </form>
        </AdminModal>
      )}

      {/* Wallet Modal */}
      {showWalletModal && selected && (
        <AdminModal
          title={walletType === 'add' ? 'Add Balance' : 'Deduct Balance'}
          subtitle={`${walletType === 'add' ? 'To' : 'From'} ${selected.name}'s wallet · Current: ₹${selected.walletBalance?.toFixed(2) || '0.00'}`}
          onClose={() => { setShowWalletModal(false); setWalletAmount(''); setWalletRemark(''); setSelected(null); }}
        >
          <form onSubmit={handleWallet} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Amount (₹)</label>
              <input type="number" value={walletAmount} onChange={e => setWalletAmount(e.target.value)} className="input-field" min="1" step="0.01" required autoFocus />
            </div>
            {walletType === 'deduct' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Remark</label>
                <textarea value={walletRemark} onChange={e => setWalletRemark(e.target.value)} className="input-field" rows="3" placeholder="Reason for deduction..." required />
              </div>
            )}
            <div className="flex gap-3">
              <button type="button" onClick={() => { setShowWalletModal(false); setWalletAmount(''); setWalletRemark(''); setSelected(null); }} className="flex-1 btn-secondary">Cancel</button>
              <button type="submit" className={`flex-1 py-3 rounded-xl text-white font-semibold ${walletType === 'add' ? 'bg-green-600 hover:bg-green-700' : 'bg-orange-600 hover:bg-orange-700'}`}>
                {walletType === 'add' ? 'Add Balance' : 'Deduct'}
              </button>
            </div>
          </form>
        </AdminModal>
      )}
    </div>
  );
}
