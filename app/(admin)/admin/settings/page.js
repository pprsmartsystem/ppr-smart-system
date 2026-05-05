'use client';

import { useState, useEffect } from 'react';
import { Cog6ToothIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { PageHeader, AdminModal } from '@/components/ui/AdminComponents';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    currency: 'INR',
    currencySymbol: '₹',
    cardExpiryYears: '3',
    maxSpendingLimit: '10000',
    minSpendingLimit: '100',
    allowUserRegistration: true,
    requireApproval: true,
    fast2smsApiKey: '',
    fast2smsEnabled: true,
  });
  const [paymentGateways, setPaymentGateways] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [newGateway, setNewGateway] = useState({
    name: '',
    type: 'qr_code',
    qrCodeUrl: '',
    paymentLink: '',
    instructions: '',
    userType: 'user',
  });

  useEffect(() => {
    fetchPaymentGateways();
    fetchUsers();
    fetchSettings();
  }, []);

  const fetchPaymentGateways = async () => {
    try {
      const res = await fetch('/api/admin/payment-gateway', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setPaymentGateways(data.gateways || []);
      } else {
        toast.error('Failed to load gateways');
      }
    } catch (error) {
      toast.error('Failed to load gateways');
    }
  };

  const fetchSettings = async () => {
    const res = await fetch('/api/admin/settings');
    if (res.ok) {
      const data = await res.json();
      if (data.settings) {
        setSettings({
          currency: data.settings.currency || 'INR',
          currencySymbol: data.settings.currencySymbol || '₹',
          cardExpiryYears: data.settings.cardExpiryYears?.toString() || '3',
          maxSpendingLimit: data.settings.maxSpendingLimit?.toString() || '100000',
          minSpendingLimit: data.settings.minSpendingLimit?.toString() || '100',
          allowUserRegistration: data.settings.allowUserRegistration ?? true,
          requireApproval: data.settings.requireApproval ?? true,
          fast2smsApiKey: data.settings.fast2smsApiKey || '',
          fast2smsEnabled: data.settings.fast2smsEnabled ?? true,
        });
      }
    }
  };

  const fetchUsers = async () => {
    const res = await fetch('/api/admin/users');
    if (res.ok) {
      const data = await res.json();
      // Filter out admin users
      const nonAdminUsers = (data.users || []).filter(u => u.role !== 'admin');
      setUsers(nonAdminUsers);
    }
  };

  const handleAddGateway = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/payment-gateway', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newGateway),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Payment gateway added!');
        setShowModal(false);
        setNewGateway({ name: '', type: 'qr_code', qrCodeUrl: '', paymentLink: '', instructions: '', userType: 'user' });
        await fetchPaymentGateways();
      } else {
        toast.error(data.message || 'Failed to add gateway');
      }
    } catch (error) {
      toast.error('Failed to add gateway');
    }
  };

  const handleDeleteGateway = async (id) => {
    if (!confirm('Are you sure you want to delete this gateway?')) return;
    try {
      const res = await fetch('/api/admin/payment-gateway', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gatewayId: id }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Gateway deleted');
        setPaymentGateways(prev => prev.filter(gw => gw._id !== id));
      } else {
        toast.error(data.message || 'Failed to delete');
      }
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });

    const data = await res.json();
    return data.url;
  };

  const handleQRUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      toast.loading('Uploading QR code...');
      const url = await uploadToCloudinary(file);
      toast.dismiss();
      setNewGateway({ ...newGateway, qrCodeUrl: url });
      toast.success('QR code uploaded!');
    }
  };

  const handleSave = async () => {
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currency: settings.currency,
          currencySymbol: settings.currencySymbol,
          cardExpiryYears: parseInt(settings.cardExpiryYears),
          maxSpendingLimit: parseInt(settings.maxSpendingLimit),
          minSpendingLimit: parseInt(settings.minSpendingLimit),
          allowUserRegistration: settings.allowUserRegistration,
          requireApproval: settings.requireApproval,
          fast2smsApiKey: settings.fast2smsApiKey,
          fast2smsEnabled: settings.fast2smsEnabled,
        })
      });

      if (res.ok) {
        toast.success('Settings saved successfully!');
      } else {
        toast.error('Failed to save settings');
      }
    } catch (error) {
      toast.error('Failed to save settings');
    }
  };

  const handleResetUserHistory = async () => {
    if (!selectedUser) {
      toast.error('Please select a user');
      return;
    }

    if (!confirm('This will delete ALL cards, transactions, settlements, and cashbacks for this user. This action CANNOT be undone. Continue?')) {
      return;
    }

    try {
      const res = await fetch('/api/admin/users/reset-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedUser })
      });

      if (res.ok) {
        toast.success('User history reset successfully');
        setShowResetModal(false);
        setSelectedUser('');
      } else {
        toast.error('Failed to reset user history');
      }
    } catch (error) {
      toast.error('Failed to reset user history');
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader icon={Cog6ToothIcon} title="System Settings" subtitle="Configure system-wide settings" color="from-slate-600 to-gray-700" />

      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h3 className="text-sm font-bold text-gray-900 mb-4">Currency Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
            <select value={settings.currency} onChange={(e) => setSettings({...settings, currency: e.target.value})} className="input-field">
              <option value="INR">INR - Indian Rupee</option>
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="AUD">AUD - Australian Dollar</option>
              <option value="CAD">CAD - Canadian Dollar</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Currency Symbol</label>
            <input type="text" value={settings.currencySymbol} onChange={(e) => setSettings({...settings, currencySymbol: e.target.value})} className="input-field" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h3 className="text-sm font-bold text-gray-900 mb-4">Card Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Card Expiry (Years)</label>
            <input type="number" value={settings.cardExpiryYears} onChange={(e) => setSettings({...settings, cardExpiryYears: e.target.value})} min="1" max="10" className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Max Spending Limit</label>
            <input type="number" value={settings.maxSpendingLimit} onChange={(e) => setSettings({...settings, maxSpendingLimit: e.target.value})} min="1000" step="1000" className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Min Spending Limit</label>
            <input type="number" value={settings.minSpendingLimit} onChange={(e) => setSettings({...settings, minSpendingLimit: e.target.value})} min="10" step="10" className="input-field" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h3 className="text-sm font-bold text-gray-900 mb-4">User Management</h3>
        <div className="space-y-4">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input type="checkbox" checked={settings.allowUserRegistration} onChange={(e) => setSettings({...settings, allowUserRegistration: e.target.checked})} className="w-5 h-5 text-indigo-600 rounded" />
            <span className="text-gray-700">Allow user registration</span>
          </label>
          <label className="flex items-center space-x-3 cursor-pointer">
            <input type="checkbox" checked={settings.requireApproval} onChange={(e) => setSettings({...settings, requireApproval: e.target.checked})} className="w-5 h-5 text-indigo-600 rounded" />
            <span className="text-gray-700">Require admin approval for new accounts</span>
          </label>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h3 className="text-sm font-bold text-gray-900 mb-4">Fast2SMS OTP Settings</h3>
        <div className="space-y-4">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input type="checkbox" checked={settings.fast2smsEnabled} onChange={(e) => setSettings({...settings, fast2smsEnabled: e.target.checked})} className="w-5 h-5 text-indigo-600 rounded" />
            <span className="text-gray-700">Enable OTP verification for KYC</span>
          </label>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Fast2SMS API Key</label>
            <input 
              type="text" 
              value={settings.fast2smsApiKey} 
              onChange={(e) => setSettings({...settings, fast2smsApiKey: e.target.value})} 
              className="input-field font-mono text-sm" 
              placeholder="Enter Fast2SMS API Key"
            />
            <p className="text-xs text-gray-500 mt-1">Get your API key from <a href="https://www.fast2sms.com" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Fast2SMS Dashboard</a></p>
          </div>
        </div>
      </div>

      <button onClick={handleSave} className="btn-primary">Save Settings</button>

      <div className="bg-white rounded-2xl border border-red-100 p-5">
        <h3 className="text-sm font-bold text-gray-900 mb-2">Reset User History</h3>
        <p className="text-sm text-gray-600 mb-4">Delete all cards, transactions, settlements, and cashbacks for a user. This action cannot be undone.</p>
        <button
          onClick={() => setShowResetModal(true)}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Reset User History
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-900">Payment Gateways</h3>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700"><PlusIcon className="w-3.5 h-3.5" />Add Gateway</button>
        </div>
        <div className="space-y-2">
          {paymentGateways.map((gw) => (
            <div key={gw._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div><p className="text-sm font-semibold text-gray-900">{gw.name}</p><p className="text-xs text-gray-400 capitalize">{gw.type.replace('_', ' ')}</p></div>
              <button onClick={() => handleDeleteGateway(gw._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><TrashIcon className="w-4 h-4" /></button>
            </div>
          ))}
          {paymentGateways.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No payment gateways configured</p>}
        </div>
      </div>

      {showModal && (
        <AdminModal title="Add Payment Gateway" onClose={() => setShowModal(false)}>
          <form onSubmit={handleAddGateway} className="space-y-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Gateway Name</label><input type="text" value={newGateway.name} onChange={(e) => setNewGateway({ ...newGateway, name: e.target.value })} placeholder="e.g., Razorpay" className="input-field" required /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Available For</label><select value={newGateway.userType} onChange={(e) => setNewGateway({ ...newGateway, userType: e.target.value })} className="input-field"><option value="user">Regular Users</option><option value="distributor">Distributors</option><option value="all">All Users</option></select></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Type</label><select value={newGateway.type} onChange={(e) => setNewGateway({ ...newGateway, type: e.target.value })} className="input-field"><option value="qr_code">QR Code</option><option value="payment_link">Payment Link</option></select></div>
            {newGateway.type === 'qr_code' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Upload QR Code</label>
                <input type="file" accept="image/*" onChange={handleQRUpload} className="input-field" />
                {newGateway.qrCodeUrl && <div className="mt-2 text-center"><img src={newGateway.qrCodeUrl} alt="QR" className="w-40 h-40 object-contain border rounded-xl mx-auto" /><p className="text-xs text-green-600 mt-1">✓ Uploaded</p></div>}
              </div>
            )}
            {newGateway.type === 'payment_link' && (
              <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Payment Link</label><input type="text" value={newGateway.paymentLink} onChange={(e) => setNewGateway({ ...newGateway, paymentLink: e.target.value })} placeholder="razorpay.me/@pprsmartsystem" className="input-field" required /></div>
            )}
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Instructions (Optional)</label><textarea value={newGateway.instructions} onChange={(e) => setNewGateway({ ...newGateway, instructions: e.target.value })} className="input-field" rows="3" placeholder="Payment instructions for users" /></div>
            <div className="flex gap-3"><button type="button" onClick={() => setShowModal(false)} className="flex-1 btn-secondary">Cancel</button><button type="submit" className="flex-1 btn-primary">Add Gateway</button></div>
          </form>
        </AdminModal>
      )}

      {showResetModal && (
        <AdminModal title="Reset User History" subtitle="This action cannot be undone" onClose={() => { setShowResetModal(false); setSelectedUser(''); }}>
          <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-4">
            <p className="text-sm text-red-700 font-medium mb-2">This will permanently delete:</p>
            <ul className="text-xs text-red-600 space-y-1 list-disc list-inside">
              {['All virtual cards','All transactions','All settlements','All cashbacks','Wallet balance (reset to ₹0)'].map(i => <li key={i}>{i}</li>)}
            </ul>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Select User</label>
            <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)} className="input-field" required>
              <option value="">-- Select User --</option>
              {users.map((u) => <option key={u._id} value={u._id}>{u.name} - {u.email} ({u.role})</option>)}
            </select>
          </div>
          <div className="flex gap-3">
            <button onClick={() => { setShowResetModal(false); setSelectedUser(''); }} className="flex-1 btn-secondary">Cancel</button>
            <button onClick={handleResetUserHistory} className="flex-1 py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700">Reset History</button>
          </div>
        </AdminModal>
      )}
    </div>
  );
}
