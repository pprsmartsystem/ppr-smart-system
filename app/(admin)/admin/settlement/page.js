'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PlusIcon, TrashIcon, CheckIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function AdminSettlementPage() {
  const [settlements, setSettlements] = useState([]);
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [manualSettlement, setManualSettlement] = useState({ userId: '', spendAmount: '' });
  const [selectedPending, setSelectedPending] = useState([]);
  const [selectedProcessed, setSelectedProcessed] = useState([]);

  useEffect(() => { fetchSettlements(); fetchUsers(); }, []);

  const fetchSettlements = async () => {
    const res = await fetch('/api/admin/settlement');
    if (res.ok) { const data = await res.json(); setSettlements(data.settlements || []); }
  };

  const fetchUsers = async () => {
    const res = await fetch('/api/admin/users');
    if (res.ok) { const data = await res.json(); setUsers(data.users || []); }
  };

  const pending = settlements.filter(s => s.status === 'pending');
  const processed = settlements.filter(s => s.status === 'processed');

  const handleProcessSettlement = async (settlementId) => {
    try {
      const res = await fetch('/api/admin/settlement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'process', settlementId }),
      });
      if (res.ok) { toast.success('Settlement processed!'); fetchSettlements(); }
    } catch { toast.error('Failed to process'); }
  };

  const handleBulkProcess = async () => {
    if (!selectedPending.length) { toast.error('Select settlements first'); return; }
    if (!confirm(`Process ${selectedPending.length} settlement(s)?`)) return;
    try {
      const res = await fetch('/api/admin/settlement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'bulk_process', settlementIds: selectedPending }),
      });
      if (res.ok) {
        const data = await res.json();
        toast.success(data.message);
        setSelectedPending([]);
        fetchSettlements();
      }
    } catch { toast.error('Failed to process'); }
  };

  const handleDelete = async (ids) => {
    const arr = Array.isArray(ids) ? ids : [ids];
    if (!confirm(`Delete ${arr.length} settlement(s)? This will remove them permanently.`)) return;
    try {
      const res = await fetch('/api/admin/settlement', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settlementIds: arr }),
      });
      if (res.ok) {
        toast.success(`${arr.length} settlement(s) deleted`);
        setSelectedPending(prev => prev.filter(id => !arr.includes(id)));
        setSelectedProcessed(prev => prev.filter(id => !arr.includes(id)));
        fetchSettlements();
      }
    } catch { toast.error('Failed to delete'); }
  };

  const handleToggleAutoSettlement = async (userId, enabled) => {
    try {
      const res = await fetch('/api/admin/settlement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle_auto', userId, enabled }),
      });
      if (res.ok) { toast.success(`Auto settlement ${enabled ? 'enabled' : 'paused'}`); fetchUsers(); }
    } catch { toast.error('Failed to update'); }
  };

  const handleCreateSettlement = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/settlement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_settlement',
          userId: manualSettlement.userId,
          spendAmount: parseFloat(manualSettlement.spendAmount),
        }),
      });
      if (res.ok) {
        toast.success('Settlement created!');
        setShowModal(false);
        setManualSettlement({ userId: '', spendAmount: '' });
        fetchSettlements();
      }
    } catch { toast.error('Failed to create'); }
  };

  const togglePending = (id) => {
    setSelectedPending(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleAllPending = () => {
    setSelectedPending(selectedPending.length === pending.length ? [] : pending.map(s => s._id));
  };

  const toggleProcessed = (id) => {
    setSelectedProcessed(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleAllProcessed = () => {
    setSelectedProcessed(selectedProcessed.length === processed.length ? [] : processed.map(s => s._id));
  };

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Settlement Management</h1>
            <p className="text-gray-600 mt-2">Manage user settlements (1.77% deduction)</p>
          </div>
          <button onClick={() => setShowModal(true)} className="btn-primary">
            <PlusIcon className="w-4 h-4 mr-2" /> Create Settlement
          </button>
        </div>
      </motion.div>

      {/* Auto Settlement Controls */}
      <div className="stats-card">
        <h2 className="text-xl font-semibold mb-4">Auto Settlement Controls</h2>
        <div className="space-y-3">
          {users.map((user) => (
            <div key={user._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">{user.name}</p>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>
              <button
                onClick={() => handleToggleAutoSettlement(user._id, !user.autoSettlement)}
                className={`px-3 py-1 rounded-lg text-sm font-medium ${
                  user.autoSettlement ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}
              >
                {user.autoSettlement ? 'Enabled' : 'Paused'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Pending Settlements */}
      <div className="stats-card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Pending Settlements ({pending.length})</h2>
          {pending.length > 0 && (
            <div className="flex gap-2">
              <button
                onClick={handleBulkProcess}
                disabled={!selectedPending.length}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium ${
                  selectedPending.length ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <CheckIcon className="w-4 h-4" /> Settle Selected ({selectedPending.length})
              </button>
              <button
                onClick={() => handleDelete(selectedPending)}
                disabled={!selectedPending.length}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium ${
                  selectedPending.length ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <TrashIcon className="w-4 h-4" /> Delete Selected ({selectedPending.length})
              </button>
            </div>
          )}
        </div>

        {pending.length > 0 ? (
          <div className="space-y-3">
            {/* Select All */}
            <label className="flex items-center gap-2 p-2 cursor-pointer hover:bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                checked={selectedPending.length === pending.length && pending.length > 0}
                onChange={toggleAllPending}
                className="w-4 h-4 text-indigo-600 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Select All</span>
            </label>

            {pending.map((s) => (
              <div key={s._id} className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <input
                  type="checkbox"
                  checked={selectedPending.includes(s._id)}
                  onChange={() => togglePending(s._id)}
                  className="w-4 h-4 text-indigo-600 rounded flex-shrink-0"
                />
                <div className="flex-1">
                  <p className="font-medium">{s.userId?.name} <span className="text-xs text-gray-500">({s.userId?.email})</span></p>
                  <p className="text-sm text-gray-600">Spend: ₹{s.spendAmount} · Deduction: ₹{(s.spendAmount * s.settlementRate / 100).toFixed(2)} · Settlement: ₹{s.settlementAmount}</p>
                  <p className="text-xs text-gray-500">{new Date(s.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => handleProcessSettlement(s._id)} className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700">Settle</button>
                  <button onClick={() => handleDelete(s._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><TrashIcon className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-400 py-6">No pending settlements</p>
        )}
      </div>

      {/* Processed Settlements */}
      <div className="stats-card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Recent Settlements ({processed.length})</h2>
          {processed.length > 0 && (
            <button
              onClick={() => handleDelete(selectedProcessed)}
              disabled={!selectedProcessed.length}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium ${
                selectedProcessed.length ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <TrashIcon className="w-4 h-4" /> Delete Selected ({selectedProcessed.length})
            </button>
          )}
        </div>

        {processed.length > 0 ? (
          <div className="space-y-3">
            <label className="flex items-center gap-2 p-2 cursor-pointer hover:bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                checked={selectedProcessed.length === processed.length && processed.length > 0}
                onChange={toggleAllProcessed}
                className="w-4 h-4 text-indigo-600 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Select All</span>
            </label>

            {processed.map((s) => (
              <div key={s._id} className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                <input
                  type="checkbox"
                  checked={selectedProcessed.includes(s._id)}
                  onChange={() => toggleProcessed(s._id)}
                  className="w-4 h-4 text-indigo-600 rounded flex-shrink-0"
                />
                <div className="flex-1">
                  <p className="font-medium">{s.userId?.name}</p>
                  <p className="text-sm text-gray-600">Settlement: ₹{s.settlementAmount}</p>
                  <p className="text-xs text-gray-500">Processed: {new Date(s.processedAt).toLocaleString()}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">Processed</span>
                  <button onClick={() => handleDelete(s._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><TrashIcon className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-400 py-6">No processed settlements</p>
        )}
      </div>

      {/* Create Settlement Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-2xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-6">Create Settlement</h2>
            <form onSubmit={handleCreateSettlement} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">User</label>
                <select value={manualSettlement.userId} onChange={(e) => setManualSettlement({ ...manualSettlement, userId: e.target.value })} className="input-field" required>
                  <option value="">Select User</option>
                  {users.map((user) => (
                    <option key={user._id} value={user._id}>{user.name} ({user.email})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Spend Amount (₹)</label>
                <input type="number" value={manualSettlement.spendAmount} onChange={(e) => setManualSettlement({ ...manualSettlement, spendAmount: e.target.value })} className="input-field" required min="1" step="0.01" />
                <p className="text-xs text-gray-500 mt-1">1.77% will be deducted (Settlement = Spend - 1.77%)</p>
              </div>
              <div className="flex space-x-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 btn-secondary">Cancel</button>
                <button type="submit" className="flex-1 btn-primary">Create Settlement</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
