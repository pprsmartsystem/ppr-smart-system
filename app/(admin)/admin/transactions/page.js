'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ArrowDownTrayIcon, TrashIcon, PencilIcon, MagnifyingGlassIcon, 
  FunnelIcon, CalendarIcon, UserIcon, CheckIcon, DocumentChartBarIcon
} from '@heroicons/react/24/outline';
import { formatCurrency } from '@/utils/cardUtils';
import toast from 'react-hot-toast';
import { PageHeader, StatusBadge, AdminModal } from '@/components/ui/AdminComponents';

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    search: '',
    type: 'all',
    status: 'all',
    startDate: '',
    endDate: ''
  });
  const [stats, setStats] = useState({ totalCredit: 0, totalDebit: 0, count: 0 });
  const [selectedIds, setSelectedIds] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTransaction, setEditTransaction] = useState(null);
  const observerTarget = useRef(null);
  const limit = 50;

  useEffect(() => {
    setTransactions([]);
    setPage(1);
    setHasMore(true);
    fetchTransactions(1, true);
  }, [filters]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage(p => p + 1);
        }
      },
      { threshold: 1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading]);

  useEffect(() => {
    if (page > 1) {
      fetchTransactions(page, false);
    }
  }, [page]);

  const fetchTransactions = async (pageNum, reset = false) => {
    if (loading) return;
    setLoading(true);

    try {
      const params = new URLSearchParams({
        page: pageNum,
        limit,
        ...(filters.type !== 'all' && { type: filters.type }),
        ...(filters.status !== 'all' && { status: filters.status }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate })
      });

      const res = await fetch(`/api/admin/transactions?${params}`);
      if (res.ok) {
        const data = await res.json();
        
        if (reset) {
          setTransactions(data.transactions || []);
        } else {
          setTransactions(prev => [...prev, ...(data.transactions || [])]);
        }
        
        setTotal(data.total || 0);
        setHasMore(data.transactions.length === limit);
        
        // Calculate stats
        const credit = data.transactions.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0);
        const debit = data.transactions.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0);
        setStats({ totalCredit: credit, totalDebit: debit, count: data.total });
      }
    } catch (error) {
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams({
        format: 'csv',
        ...(filters.type !== 'all' && { type: filters.type }),
        ...(filters.status !== 'all' && { status: filters.status }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate })
      });

      const res = await fetch(`/api/admin/transactions/export?${params}`);
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transactions-${Date.now()}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('Exported successfully');
      }
    } catch (error) {
      toast.error('Export failed');
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedIds.length) return;
    setConfirmDelete({ ids: selectedIds, label: `${selectedIds.length} transaction(s)` });
  };

  const executeDelete = async (ids) => {
    setConfirmDelete(null);
    try {
      const res = await fetch('/api/admin/transactions/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids })
      });
      if (res.ok) {
        toast.success(`${ids.length} transactions deleted`);
        setSelectedIds([]);
        setTransactions([]);
        setPage(1);
        fetchTransactions(1, true);
      }
    } catch { toast.error('Failed to delete'); }
  };

  const handleEdit = (transaction) => {
    setEditTransaction({
      id: transaction._id,
      amount: transaction.amount,
      description: transaction.description,
      status: transaction.status,
      type: transaction.type
    });
    setShowEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/transactions/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editTransaction)
      });

      if (res.ok) {
        toast.success('Transaction updated');
        setShowEditModal(false);
        setTransactions([]);
        setPage(1);
        fetchTransactions(1, true);
      }
    } catch (error) {
      toast.error('Failed to update');
    }
  };

  const filteredTransactions = transactions.filter(t =>
    !filters.search || 
    t.userId?.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
    t.userId?.email?.toLowerCase().includes(filters.search.toLowerCase()) ||
    t.reference?.toLowerCase().includes(filters.search.toLowerCase()) ||
    t.description?.toLowerCase().includes(filters.search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <PageHeader icon={DocumentChartBarIcon} title="Transactions" subtitle={`${total.toLocaleString()} total records`} color="from-blue-500 to-cyan-500"
        action={
          <div className="flex gap-2">
            {selectedIds.length > 0 && <button onClick={handleBulkDelete} className="flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700"><TrashIcon className="w-4 h-4" />Delete ({selectedIds.length})</button>}
            <button onClick={handleExport} className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700"><ArrowDownTrayIcon className="w-4 h-4" />Export CSV</button>
          </div>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5"><p className="text-xs text-green-600 font-semibold uppercase tracking-wide">Total Credit</p><p className="text-2xl font-bold text-green-700 mt-1">{formatCurrency(stats.totalCredit)}</p></div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5"><p className="text-xs text-red-500 font-semibold uppercase tracking-wide">Total Debit</p><p className="text-2xl font-bold text-red-600 mt-1">{formatCurrency(stats.totalDebit)}</p></div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5"><p className="text-xs text-blue-600 font-semibold uppercase tracking-wide">Net Balance</p><p className="text-2xl font-bold text-blue-700 mt-1">{formatCurrency(stats.totalCredit - stats.totalDebit)}</p></div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div className="md:col-span-2 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" placeholder="Search by name, email, reference..." value={filters.search} onChange={(e) => setFilters({...filters, search: e.target.value})} className="w-full pl-9 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200" />
          </div>
          <select value={filters.type} onChange={(e) => setFilters({...filters, type: e.target.value})} className="input-field text-sm">
            <option value="all">All Types</option>
            <option value="credit">Credit</option>
            <option value="debit">Debit</option>
            <option value="voucher">Voucher</option>
            <option value="transfer">Transfer</option>
          </select>
          <select value={filters.status} onChange={(e) => setFilters({...filters, status: e.target.value})} className="input-field text-sm">
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
          <button onClick={() => setFilters({...filters, startDate: '', endDate: ''})} className="btn-secondary text-sm">Clear Dates</button>
        </div>
        <div className="grid grid-cols-2 gap-3 mt-3">
          <div><label className="block text-xs font-medium text-gray-500 mb-1">Start Date</label><input type="date" value={filters.startDate} onChange={(e) => setFilters({...filters, startDate: e.target.value})} className="input-field text-sm" /></div>
          <div><label className="block text-xs font-medium text-gray-500 mb-1">End Date</label><input type="date" value={filters.endDate} onChange={(e) => setFilters({...filters, endDate: e.target.value})} className="input-field text-sm" /></div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="py-3 px-4"><input type="checkbox" checked={selectedIds.length === filteredTransactions.length && filteredTransactions.length > 0} onChange={(e) => setSelectedIds(e.target.checked ? filteredTransactions.map(t => t._id) : [])} className="w-4 h-4" /></th>
                {['Date & Time','Reference','User','Type','Amount','Status','Description','Actions'].map((h,i) => <th key={h} className={`py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide ${i===7?'text-center':'text-left'}`}>{h}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredTransactions.map((tx) => (
                <tr key={tx._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 px-4"><input type="checkbox" checked={selectedIds.includes(tx._id)} onChange={(e) => setSelectedIds(e.target.checked ? [...selectedIds, tx._id] : selectedIds.filter(id => id !== tx._id))} className="w-4 h-4" /></td>
                  <td className="py-3 px-4"><p className="text-xs font-semibold text-gray-900">{new Date(tx.createdAt).toLocaleDateString('en-IN')}</p><p className="text-xs text-gray-400">{new Date(tx.createdAt).toLocaleTimeString('en-IN')}</p></td>
                  <td className="py-3 px-4"><span className="text-xs font-mono text-indigo-600 font-semibold">{tx.reference || 'N/A'}</span></td>
                  <td className="py-3 px-4"><p className="text-xs font-semibold text-gray-900">{tx.userId?.name || 'N/A'}</p><p className="text-xs text-gray-400">{tx.userId?.email}</p></td>
                  <td className="py-3 px-4"><span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${tx.type === 'credit' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>{tx.type}</span></td>
                  <td className="py-3 px-4"><span className={`text-sm font-bold ${tx.type === 'credit' ? 'text-green-600' : 'text-red-500'}`}>{tx.type === 'credit' ? '+' : '-'}{formatCurrency(tx.amount)}</span></td>
                  <td className="py-3 px-4"><StatusBadge status={tx.status} /></td>
                  <td className="py-3 px-4"><p className="text-xs text-gray-500 max-w-xs truncate">{tx.description}</p></td>
                  <td className="py-3 px-4 text-center"><button onClick={() => handleEdit(tx)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><PencilIcon className="h-4 w-4" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">Loading more...</p>
          </div>
        )}

        {!loading && hasMore && <div ref={observerTarget} className="h-10" />}

        {!loading && !hasMore && filteredTransactions.length > 0 && (
          <div className="text-center py-8 text-gray-500 text-sm">
            All {filteredTransactions.length} transactions loaded
          </div>
        )}

        {!loading && filteredTransactions.length === 0 && (
          <div className="text-center py-12 text-gray-500">No transactions found</div>
        )}
      </div>

      {confirmDelete && (
        <AdminModal title="Confirm Delete" subtitle={`Delete ${confirmDelete.label}? This cannot be undone.`} onClose={() => setConfirmDelete(null)}>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setConfirmDelete(null)} className="flex-1 btn-secondary">Cancel</button>
            <button onClick={() => executeDelete(confirmDelete.ids)} className="flex-1 py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700">Delete</button>
          </div>
        </AdminModal>
      )}

      {showEditModal && editTransaction && (
        <AdminModal title="Edit Transaction" onClose={() => setShowEditModal(false)}>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Amount (₹)</label><input type="number" value={editTransaction.amount} onChange={(e) => setEditTransaction({...editTransaction, amount: parseFloat(e.target.value)})} className="input-field" required /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Type</label><select value={editTransaction.type} onChange={(e) => setEditTransaction({...editTransaction, type: e.target.value})} className="input-field"><option value="credit">Credit</option><option value="debit">Debit</option><option value="voucher">Voucher</option><option value="transfer">Transfer</option></select></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label><select value={editTransaction.status} onChange={(e) => setEditTransaction({...editTransaction, status: e.target.value})} className="input-field"><option value="pending">Pending</option><option value="completed">Completed</option><option value="failed">Failed</option></select></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label><textarea value={editTransaction.description} onChange={(e) => setEditTransaction({...editTransaction, description: e.target.value})} className="input-field" rows="3" /></div>
            <div className="flex gap-3"><button type="submit" className="flex-1 btn-primary">Update</button><button type="button" onClick={() => setShowEditModal(false)} className="flex-1 btn-secondary">Cancel</button></div>
          </form>
        </AdminModal>
      )}
    </div>
  );
}
