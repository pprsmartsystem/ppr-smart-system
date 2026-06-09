'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PlusIcon, TrashIcon, CheckIcon, ClockIcon, BoltIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function AdminSettlementPage() {
  const [settlements, setSettlements] = useState([]);
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [manualSettlement, setManualSettlement] = useState({ userId: '', spendAmount: '' });
  const [selectedPending, setSelectedPending] = useState([]);
  const [selectedProcessed, setSelectedProcessed] = useState([]);
  const [autoInfo, setAutoInfo] = useState(null);
  const [autoRunning, setAutoRunning] = useState(false);
  const [forceRunning, setForceRunning] = useState(false);

  useEffect(() => { fetchSettlements(); fetchUsers(); fetchAutoInfo(); }, []);

  // Poll auto info every 60s
  useEffect(() => {
    const t = setInterval(fetchAutoInfo, 60000);
    return () => clearInterval(t);
  }, []);

  // Auto-trigger at 10:30 AM IST client-side
  useEffect(() => {
    const checkTime = () => {
      const now = new Date();
      const ist = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
      if (ist.getHours() === 10 && ist.getMinutes() === 30 && ist.getSeconds() < 10) {
        handleAutoSettle(true, false);
      }
    };
    const t = setInterval(checkTime, 5000);
    return () => clearInterval(t);
  }, []);

  const fetchAutoInfo = async () => {
    const res = await fetch('/api/admin/settlement/auto');
    if (res.ok) setAutoInfo(await res.json());
  };

  const handleAutoSettle = async (silent = false, force = false) => {
    if (autoRunning || forceRunning) return;
    force ? setForceRunning(true) : setAutoRunning(true);
    try {
      const res = await fetch('/api/admin/settlement/auto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ force }),
      });
      const data = await res.json();
      if (res.ok) {
        if (data.skipped) {
          toast.error(data.message);
        } else if (!silent || data.count > 0) {
          toast.success(data.message);
        }
        fetchSettlements();
        fetchAutoInfo();
      } else {
        toast.error(data.error || 'Auto-settlement failed');
      }
    } catch { toast.error('Auto-settlement failed'); }
    finally { setAutoRunning(false); setForceRunning(false); }
  };

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
      else { const d = await res.json(); toast.error(d.error || 'Failed'); }
    } catch { toast.error('Failed to process'); }
  };

  const handleBulkProcess = async () => {
    if (!selectedPending.length) { toast.error('Select settlements first'); return; }
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
    try {
      const res = await fetch('/api/admin/settlement', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settlementIds: arr }),
      });
      if (res.ok) {
        toast.success(`${arr.length} settlement(s) deleted`);
        setSelectedPending(p => p.filter(id => !arr.includes(id)));
        setSelectedProcessed(p => p.filter(id => !arr.includes(id)));
        fetchSettlements();
      }
    } catch { toast.error('Failed to delete'); }
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

  const togglePending = (id) => setSelectedPending(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const toggleAllPending = () => setSelectedPending(selectedPending.length === pending.length ? [] : pending.map(s => s._id));
  const toggleProcessed = (id) => setSelectedProcessed(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const toggleAllProcessed = () => setSelectedProcessed(selectedProcessed.length === processed.length ? [] : processed.map(s => s._id));

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Spend / Redeem Settlement</h1>
            <p className="text-gray-500 mt-1">Auto-generated settlements when users spend or redeem via gateway (1.77% deduction)</p>
          </div>
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
            <PlusIcon className="w-4 h-4" /> Create Settlement
          </button>
        </div>
      </motion.div>

      {/* Auto-Settlement Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
            <ClockIcon className="w-6 h-6 text-indigo-300" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <p className="text-white font-semibold text-sm">Auto-Settlement Schedule</p>
              {autoInfo?.isBankingDay === false
                ? <span className="text-xs bg-red-500/20 text-red-300 px-2 py-0.5 rounded-full font-medium">Non-Banking Day</span>
                : <span className="text-xs bg-green-500/20 text-green-300 px-2 py-0.5 rounded-full font-medium">Active</span>
              }
            </div>
            <p className="text-indigo-300 text-xs">
              Runs at <span className="text-white font-bold">10:30 AM IST</span> on banking days
              {autoInfo?.todayStatus && autoInfo.isBankingDay === false &&
                <> · <span className="text-red-300">{autoInfo.todayStatus}</span></>}
              {autoInfo?.nextRunIST &&
                <> · Next: <span className="text-amber-300 font-medium">{autoInfo.nextRunIST}</span></>}
              {autoInfo?.pendingCount > 0 &&
                <> · <span className="text-yellow-300 font-medium">{autoInfo.pendingCount} pending</span></>}
            </p>
            <p className="text-indigo-400 text-xs mt-1">
              Excludes: Sundays · 2nd &amp; 4th Saturdays · Government/bank holidays
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={() => handleAutoSettle(false, false)}
              disabled={autoRunning || forceRunning}
              className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-colors"
            >
              {autoRunning
                ? <><ArrowPathIcon className="w-3.5 h-3.5 animate-spin" /> Running...</>
                : <><BoltIcon className="w-3.5 h-3.5" /> Run Now</>}
            </button>
            <button
              onClick={() => handleAutoSettle(false, true)}
              disabled={autoRunning || forceRunning}
              title="Force run even on non-banking days"
              className="flex items-center gap-1.5 px-3 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-colors"
            >
              {forceRunning
                ? <><ArrowPathIcon className="w-3.5 h-3.5 animate-spin" /> Forcing...</>
                : <><BoltIcon className="w-3.5 h-3.5" /> Force Run</>}
            </button>
          </div>
        </div>
      </div>

      {/* Pending */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Pending Settlements ({pending.length})</h2>
          {pending.length > 0 && (
            <div className="flex gap-2">
              <button onClick={handleBulkProcess} disabled={!selectedPending.length}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium ${selectedPending.length ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
                <CheckIcon className="w-4 h-4" /> Settle Selected ({selectedPending.length})
              </button>
              <button onClick={() => handleDelete(selectedPending)} disabled={!selectedPending.length}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium ${selectedPending.length ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
                <TrashIcon className="w-4 h-4" /> Delete Selected ({selectedPending.length})
              </button>
            </div>
          )}
        </div>

        {pending.length > 0 ? (
          <div className="space-y-3">
            <label className="flex items-center gap-2 p-2 cursor-pointer hover:bg-gray-50 rounded-lg">
              <input type="checkbox" checked={selectedPending.length === pending.length} onChange={toggleAllPending} className="w-4 h-4 text-indigo-600 rounded" />
              <span className="text-sm font-medium text-gray-700">Select All</span>
            </label>
            {pending.map((s) => (
              <div key={s._id} className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                <input type="checkbox" checked={selectedPending.includes(s._id)} onChange={() => togglePending(s._id)} className="w-4 h-4 text-indigo-600 rounded flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{s.userId?.name} <span className="text-xs text-gray-500 font-normal">({s.userId?.email})</span></p>
                  <p className="text-sm text-gray-600 mt-0.5">
                    Spend: <span className="font-medium">₹{s.spendAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    {' · '}Deduction: <span className="font-medium text-red-600">₹{(s.spendAmount * s.settlementRate / 100).toFixed(2)}</span>
                    {' · '}Settlement: <span className="font-medium text-green-700">₹{s.settlementAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{new Date(s.createdAt).toLocaleString('en-IN')}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => handleProcessSettlement(s._id)} className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700">Settle</button>
                  <button onClick={() => handleDelete(s._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><TrashIcon className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-400 py-8">No pending settlements</p>
        )}
      </div>

      {/* Processed */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Processed Settlements ({processed.length})</h2>
          {processed.length > 0 && (
            <button onClick={() => handleDelete(selectedProcessed)} disabled={!selectedProcessed.length}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium ${selectedProcessed.length ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
              <TrashIcon className="w-4 h-4" /> Delete Selected ({selectedProcessed.length})
            </button>
          )}
        </div>
        {processed.length > 0 ? (
          <div className="space-y-3">
            <label className="flex items-center gap-2 p-2 cursor-pointer hover:bg-gray-50 rounded-lg">
              <input type="checkbox" checked={selectedProcessed.length === processed.length} onChange={toggleAllProcessed} className="w-4 h-4 text-indigo-600 rounded" />
              <span className="text-sm font-medium text-gray-700">Select All</span>
            </label>
            {processed.map((s) => (
              <div key={s._id} className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                <input type="checkbox" checked={selectedProcessed.includes(s._id)} onChange={() => toggleProcessed(s._id)} className="w-4 h-4 text-indigo-600 rounded flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{s.userId?.name} <span className="text-xs text-gray-500 font-normal">({s.userId?.email})</span></p>
                  <p className="text-sm text-gray-600 mt-0.5">Settlement: <span className="font-medium text-green-700">₹{s.settlementAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></p>
                  <p className="text-xs text-gray-400 mt-0.5">Processed: {new Date(s.processedAt).toLocaleString('en-IN')}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">Processed</span>
                  <button onClick={() => handleDelete(s._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><TrashIcon className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-400 py-8">No processed settlements</p>
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-bold mb-6">Create Settlement</h2>
            <form onSubmit={handleCreateSettlement} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">User</label>
                <select value={manualSettlement.userId} onChange={(e) => setManualSettlement({ ...manualSettlement, userId: e.target.value })} className="input-field" required>
                  <option value="">Select User</option>
                  {users.map((u) => <option key={u._id} value={u._id}>{u.name} ({u.email})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Spend Amount (₹)</label>
                <input type="number" value={manualSettlement.spendAmount} onChange={(e) => setManualSettlement({ ...manualSettlement, spendAmount: e.target.value })} className="input-field" required min="1" step="0.01" />
                <p className="text-xs text-gray-500 mt-1">1.77% will be deducted as settlement fee</p>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 btn-secondary">Cancel</button>
                <button type="submit" className="flex-1 btn-primary">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
