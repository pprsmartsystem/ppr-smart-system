'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  MagnifyingGlassIcon, PlusCircleIcon, MinusCircleIcon, EyeIcon,
  BuildingOfficeIcon, NoSymbolIcon, CheckIcon, TrashIcon,
} from '@heroicons/react/24/outline';
import { PageHeader, AdminTable, StatusBadge, AdminModal, ActionBtn } from '@/components/ui/AdminComponents';

export default function MasterDistributorDistributorsPage() {
  const [distributors, setDistributors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [selectedDistributor, setSelectedDistributor] = useState(null);
  const [balanceAmount, setBalanceAmount] = useState('');
  const [balanceType, setBalanceType] = useState('add'); // 'add' or 'deduct'
  const [deductRemark, setDeductRemark] = useState('');

  useEffect(() => {
    fetchDistributors();
  }, []);

  const fetchDistributors = async () => {
    try {
      const res = await fetch('/api/masterdistributor/distributors');
      if (res.ok) {
        const data = await res.json();
        setDistributors(data.distributors || []);
      }
    } catch (error) {
      toast.error('Failed to fetch distributors');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBalance = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/masterdistributor/distributors/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          distributorId: selectedDistributor._id, 
          amount: parseFloat(balanceAmount),
          type: 'add'
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        setShowBalanceModal(false);
        setBalanceAmount('');
        setSelectedDistributor(null);
        fetchDistributors();
      } else {
        toast.error(data.error || 'Failed to add balance');
      }
    } catch (error) {
      toast.error('Error adding balance');
    }
  };

  const handleDeductBalance = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/masterdistributor/distributors/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          distributorId: selectedDistributor._id, 
          amount: parseFloat(balanceAmount),
          type: 'deduct',
          remark: deductRemark
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
        toast.error(data.error || 'Failed to deduct balance');
      }
    } catch (error) {
      toast.error('Error deducting balance');
    }
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
        toast.success(`Distributor ${action === 'hold' ? 'held' : 'unheld'} successfully`);
        fetchDistributors();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to update hold status');
      }
    } catch (error) {
      toast.error('Error updating hold status');
    }
  };

  const handleDelete = async (distributorId) => {
    if (!confirm('Are you sure? This will delete the distributor and all associated data.')) return;
    
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
        toast.error(data.error || 'Failed to delete distributor');
      }
    } catch (error) {
      toast.error('Failed to delete distributor');
    }
  };

  const filteredDistributors = distributors.filter(dist => {
    const matchesSearch = dist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dist.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

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
          <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-3 py-1.5 rounded-xl">
            <span className="font-semibold text-gray-900">{filteredDistributors.length}</span> distributors
          </div>
        }
      />

      {/* Search */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <div className="relative">
          <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search distributors..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300" 
          />
        </div>
      </div>

      {/* Distributors Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                {['Name','Email','Wallet','Status','Joined','Actions'].map((h,i) => (
                  <th key={h} className={`py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide ${i===5?'text-right':'text-left'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredDistributors.map((dist) => (
                <tr key={dist._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 px-4">
                    <p className="text-sm font-semibold text-gray-900">{dist.name}</p>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-sm text-gray-500">{dist.email}</p>
                  </td>
                  <td className="py-3 px-4">
                    <p className={`text-sm font-semibold ${dist.walletBalance < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                      ₹{Math.abs(dist.walletBalance?.toFixed(2) || 0)}
                      {dist.walletBalance < 0 && <span className="ml-1 text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full">Debt</span>}
                    </p>
                  </td>
                  <td className="py-3 px-4">
                    {dist.isOnHold ? (
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">On Hold</span>
                    ) : (
                      <StatusBadge status={dist.status} />
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-xs text-gray-400">{new Date(dist.createdAt).toLocaleDateString('en-IN')}</p>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex justify-end gap-1">
                      <ActionBtn 
                        icon={PlusCircleIcon} 
                        onClick={() => { 
                          setSelectedDistributor(dist); 
                          setBalanceType('add');
                          setShowBalanceModal(true); 
                        }} 
                        color="text-blue-600 hover:bg-blue-50" 
                        title="Add Balance" 
                      />
                      <ActionBtn 
                        icon={MinusCircleIcon} 
                        onClick={() => { 
                          setSelectedDistributor(dist); 
                          setBalanceType('deduct');
                          setShowBalanceModal(true); 
                        }} 
                        color="text-red-500 hover:bg-red-50" 
                        title="Deduct Balance" 
                      />
                      <ActionBtn 
                        icon={dist.isOnHold ? CheckIcon : NoSymbolIcon} 
                        onClick={() => handleHoldToggle(dist._id, dist.isOnHold)} 
                        color={dist.isOnHold ? 'text-green-600 hover:bg-green-50' : 'text-orange-600 hover:bg-orange-50'} 
                        title={dist.isOnHold ? 'Unhold' : 'Hold'} 
                      />
                      <ActionBtn 
                        icon={TrashIcon} 
                        onClick={() => handleDelete(dist._id)} 
                        color="text-red-600 hover:bg-red-50" 
                        title="Delete" 
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredDistributors.length === 0 && (
          <div className="text-center py-12 text-sm text-gray-400">No distributors found</div>
        )}
      </div>

      {/* Balance Modal */}
      {showBalanceModal && selectedDistributor && (
        <AdminModal 
          title={balanceType === 'add' ? 'Add Balance' : 'Deduct Balance'} 
          subtitle={`${balanceType === 'add' ? 'To' : 'From'} ${selectedDistributor.name}'s wallet`} 
          onClose={() => { 
            setShowBalanceModal(false); 
            setBalanceAmount(''); 
            setDeductRemark('');
            setSelectedDistributor(null); 
          }}
        >
          <div className={`${balanceType === 'add' ? 'bg-blue-50 border-blue-100' : 'bg-red-50 border-red-100'} border rounded-xl p-4 mb-4`}>
            <p className="text-xs text-gray-500">Current Balance</p>
            <p className="text-2xl font-bold text-gray-900">₹{selectedDistributor.walletBalance?.toFixed(2) || '0.00'}</p>
          </div>
          <form onSubmit={balanceType === 'add' ? handleAddBalance : handleDeductBalance} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Amount (₹)</label>
              <input 
                type="number" 
                value={balanceAmount} 
                onChange={(e) => setBalanceAmount(e.target.value)} 
                placeholder="Enter amount" 
                min="1" 
                step="0.01" 
                required 
                className="input-field" 
                autoFocus 
              />
            </div>
            {balanceType === 'deduct' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Remark</label>
                <textarea 
                  value={deductRemark} 
                  onChange={(e) => setDeductRemark(e.target.value)} 
                  placeholder="Reason for deduction" 
                  className="input-field" 
                  rows="3" 
                  required 
                />
              </div>
            )}
            <div className="flex gap-3">
              <button 
                type="button" 
                onClick={() => { 
                  setShowBalanceModal(false); 
                  setBalanceAmount(''); 
                  setDeductRemark('');
                  setSelectedDistributor(null); 
                }} 
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className={`flex-1 py-3 rounded-xl text-white font-semibold ${balanceType === 'add' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'}`}
              >
                {balanceType === 'add' ? 'Add Balance' : 'Deduct'}
              </button>
            </div>
          </form>
        </AdminModal>
      )}
    </div>
  );
}
