'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  MagnifyingGlassIcon, PlusCircleIcon, MinusCircleIcon,
  BuildingOfficeIcon, NoSymbolIcon, CheckIcon, TrashIcon, PlusIcon,
  EyeIcon, EyeSlashIcon,
} from '@heroicons/react/24/outline';
import { PageHeader, StatusBadge, AdminModal, ActionBtn } from '@/components/ui/AdminComponents';

export default function MasterDistributorDistributorsPage() {
  const [distributors, setDistributors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Create modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });

  // Balance modal
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [selectedDistributor, setSelectedDistributor] = useState(null);
  const [balanceAmount, setBalanceAmount] = useState('');
  const [balanceType, setBalanceType] = useState('add');
  const [deductRemark, setDeductRemark] = useState('');

  useEffect(() => { fetchDistributors(); }, []);

  const fetchDistributors = async () => {
    try {
      const res = await fetch('/api/masterdistributor/distributors');
      if (res.ok) setDistributors((await res.json()).distributors || []);
    } catch { toast.error('Failed to fetch distributors'); }
    finally { setLoading(false); }
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$';
    let p = '';
    for (let i = 0; i < 12; i++) p += chars.charAt(Math.floor(Math.random() * chars.length));
    setForm(f => ({ ...f, password: p }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/masterdistributor/distributors/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Distributor created successfully!');
        setShowCreateModal(false);
        setForm({ name: '', email: '', password: '', phone: '' });
        fetchDistributors();
      } else {
        toast.error(data.error || 'Failed to create');
      }
    } catch { toast.error('Error creating distributor'); }
  };

  const handleBalance = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/masterdistributor/distributors/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          distributorId: selectedDistributor._id,
          amount: parseFloat(balanceAmount),
          type: balanceType,
          remark: deductRemark,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        setShowBalanceModal(false);
        setBalanceAmount('');
        setDeductRemark('');
        setSelectedDistributor(null);
        fetchDistributors();
      } else {
        toast.error(data.error || 'Failed');
      }
    } catch { toast.error('Error updating balance'); }
  };

  const handleHoldToggle = async (distributorId, currentHoldStatus) => {
    const action = currentHoldStatus ? 'unhold' : 'hold';
    const reason = !currentHoldStatus ? prompt('Enter reason for holding (optional):') : null;
    if (!currentHoldStatus && reason === null) return;
    try {
      const res = await fetch('/api/masterdistributor/distributors/hold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ distributorId, action, reason }),
      });
      if (res.ok) {
        toast.success(`Distributor ${action === 'hold' ? 'held' : 'unheld'}`);
        fetchDistributors();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed');
      }
    } catch { toast.error('Error updating hold status'); }
  };

  const handleDelete = async (distributorId) => {
    if (!confirm('Delete this distributor and all associated data?')) return;
    try {
      const res = await fetch('/api/masterdistributor/distributors/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ distributorId }),
      });
      if (res.ok) {
        toast.success('Distributor deleted');
        fetchDistributors();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to delete');
      }
    } catch { toast.error('Failed to delete'); }
  };

  const filtered = distributors.filter(d =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="space-y-4 animate-pulse">
      <div className="h-12 bg-gray-200 rounded-2xl w-1/3" />
      <div className="h-64 bg-gray-200 rounded-2xl" />
    </div>
  );

  return (
    <div className="space-y-5">
      <PageHeader
        icon={BuildingOfficeIcon}
        title="Distributor Management"
        subtitle="Manage distributors under your account"
        color="from-blue-500 to-cyan-500"
        action={
          <button onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
            <PlusIcon className="h-4 w-4" /> Create Distributor
          </button>
        }
      />

      {/* Search */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <div className="relative">
          <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search distributors..." value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                {['Name', 'Email', 'Wallet', 'Status', 'Joined', 'Actions'].map((h, i) => (
                  <th key={h} className={`py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide ${i === 5 ? 'text-right' : 'text-left'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((dist) => (
                <tr key={dist._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 px-4"><p className="text-sm font-semibold text-gray-900">{dist.name}</p></td>
                  <td className="py-3 px-4"><p className="text-sm text-gray-500">{dist.email}</p></td>
                  <td className="py-3 px-4">
                    <p className={`text-sm font-semibold ${dist.walletBalance < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                      ₹{Math.abs(dist.walletBalance?.toFixed(2) || 0)}
                      {dist.walletBalance < 0 && <span className="ml-1 text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full">Debt</span>}
                    </p>
                  </td>
                  <td className="py-3 px-4">
                    {dist.isOnHold
                      ? <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">On Hold</span>
                      : <StatusBadge status={dist.status} />}
                  </td>
                  <td className="py-3 px-4"><p className="text-xs text-gray-400">{new Date(dist.createdAt).toLocaleDateString('en-IN')}</p></td>
                  <td className="py-3 px-4">
                    <div className="flex justify-end gap-1">
                      <ActionBtn icon={PlusCircleIcon} onClick={() => { setSelectedDistributor(dist); setBalanceType('add'); setShowBalanceModal(true); }} color="text-blue-600 hover:bg-blue-50" title="Add Balance" />
                      <ActionBtn icon={MinusCircleIcon} onClick={() => { setSelectedDistributor(dist); setBalanceType('deduct'); setShowBalanceModal(true); }} color="text-red-500 hover:bg-red-50" title="Deduct Balance" />
                      <ActionBtn icon={dist.isOnHold ? CheckIcon : NoSymbolIcon} onClick={() => handleHoldToggle(dist._id, dist.isOnHold)} color={dist.isOnHold ? 'text-green-600 hover:bg-green-50' : 'text-orange-600 hover:bg-orange-50'} title={dist.isOnHold ? 'Unhold' : 'Hold'} />
                      <ActionBtn icon={TrashIcon} onClick={() => handleDelete(dist._id)} color="text-red-600 hover:bg-red-50" title="Delete" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <div className="text-center py-12 text-sm text-gray-400">No distributors found</div>}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <AdminModal title="Create Distributor" subtitle="New distributor under your account" onClose={() => { setShowCreateModal(false); setForm({ name: '', email: '', password: '', phone: '' }); }}>
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
              <button type="button" onClick={generatePassword} className="mt-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium">Generate Password</button>
            </div>
            <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 text-xs text-amber-800">
              Save this password before closing. It cannot be retrieved later.
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => { setShowCreateModal(false); setForm({ name: '', email: '', password: '', phone: '' }); }} className="flex-1 btn-secondary">Cancel</button>
              <button type="submit" className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700">Create</button>
            </div>
          </form>
        </AdminModal>
      )}

      {/* Balance Modal */}
      {showBalanceModal && selectedDistributor && (
        <AdminModal
          title={balanceType === 'add' ? 'Add Balance' : 'Deduct Balance'}
          subtitle={`${balanceType === 'add' ? 'To' : 'From'} ${selectedDistributor.name}'s wallet`}
          onClose={() => { setShowBalanceModal(false); setBalanceAmount(''); setDeductRemark(''); setSelectedDistributor(null); }}
        >
          <div className={`${balanceType === 'add' ? 'bg-blue-50 border-blue-100' : 'bg-red-50 border-red-100'} border rounded-xl p-4 mb-4`}>
            <p className="text-xs text-gray-500">Current Balance</p>
            <p className="text-2xl font-bold text-gray-900">₹{selectedDistributor.walletBalance?.toFixed(2) || '0.00'}</p>
          </div>
          <form onSubmit={handleBalance} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Amount (₹)</label>
              <input type="number" value={balanceAmount} onChange={e => setBalanceAmount(e.target.value)} placeholder="Enter amount" min="1" step="0.01" required className="input-field" autoFocus />
            </div>
            {balanceType === 'deduct' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Remark</label>
                <textarea value={deductRemark} onChange={e => setDeductRemark(e.target.value)} placeholder="Reason for deduction" className="input-field" rows="3" required />
              </div>
            )}
            <div className="flex gap-3">
              <button type="button" onClick={() => { setShowBalanceModal(false); setBalanceAmount(''); setDeductRemark(''); setSelectedDistributor(null); }} className="flex-1 btn-secondary">Cancel</button>
              <button type="submit" className={`flex-1 py-3 rounded-xl text-white font-semibold ${balanceType === 'add' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'}`}>
                {balanceType === 'add' ? 'Add Balance' : 'Deduct'}
              </button>
            </div>
          </form>
        </AdminModal>
      )}
    </div>
  );
}
