'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Cog6ToothIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    currency: 'INR',
    currencySymbol: '₹',
    cardExpiryYears: '3',
    maxSpendingLimit: '10000',
    minSpendingLimit: '100',
    allowUserRegistration: true,
    requireApproval: true,
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
  });

  useEffect(() => {
    fetchPaymentGateways();
    fetchUsers();
  }, []);

  const fetchPaymentGateways = async () => {
    const res = await fetch('/api/admin/payment-gateway');
    if (res.ok) {
      const data = await res.json();
      setPaymentGateways(data.gateways || []);
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
      if (res.ok) {
        toast.success('Payment gateway added!');
        setShowModal(false);
        setNewGateway({ name: '', type: 'qr_code', qrCodeUrl: '', paymentLink: '', instructions: '' });
        fetchPaymentGateways();
      }
    } catch (error) {
      toast.error('Failed to add gateway');
    }
  };

  const handleDeleteGateway = async (id) => {
    try {
      const res = await fetch('/api/admin/payment-gateway', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gatewayId: id }),
      });
      if (res.ok) {
        toast.success('Gateway deleted');
        fetchPaymentGateways();
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

  const handleSave = () => {
    toast.success('Settings saved successfully!');
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
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
        <p className="text-gray-600 mt-2">Configure system-wide settings</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="stats-card">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Currency Settings</h3>
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
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="stats-card">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Card Settings</h3>
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
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="stats-card">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">User Management</h3>
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
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <button onClick={handleSave} className="btn-primary">
          Save Settings
        </button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="stats-card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Reset User History</h3>
        <p className="text-sm text-gray-600 mb-4">Delete all cards, transactions, settlements, and cashbacks for a user. This action cannot be undone.</p>
        <button
          onClick={() => setShowResetModal(true)}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Reset User History
        </button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="stats-card">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Payment Gateways</h3>
          <button onClick={() => setShowModal(true)} className="btn-primary">
            <PlusIcon className="w-4 h-4 mr-2" />
            Add Gateway
          </button>
        </div>
        <div className="space-y-4">
          {paymentGateways.map((gw) => (
            <div key={gw._id} className="p-4 border border-gray-200 rounded-xl flex justify-between items-center">
              <div>
                <p className="font-semibold">{gw.name}</p>
                <p className="text-sm text-gray-500 capitalize">{gw.type.replace('_', ' ')}</p>
              </div>
              <button onClick={() => handleDeleteGateway(gw._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      </motion.div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-2xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-6">Add Payment Gateway</h2>
            <form onSubmit={handleAddGateway} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gateway Name</label>
                <input
                  type="text"
                  value={newGateway.name}
                  onChange={(e) => setNewGateway({ ...newGateway, name: e.target.value })}
                  placeholder="e.g., Razorpay, Cashfree"
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select
                  value={newGateway.type}
                  onChange={(e) => setNewGateway({ ...newGateway, type: e.target.value })}
                  className="input-field"
                >
                  <option value="qr_code">QR Code</option>
                  <option value="payment_link">Payment Link</option>
                </select>
              </div>
              {newGateway.type === 'qr_code' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">QR Code URL</label>
                  <input
                    type="url"
                    value={newGateway.qrCodeUrl}
                    onChange={(e) => setNewGateway({ ...newGateway, qrCodeUrl: e.target.value })}
                    placeholder="Paste Cloudinary URL here"
                    className="input-field"
                    required
                  />
                  {newGateway.qrCodeUrl && (
                    <img src={newGateway.qrCodeUrl} alt="QR" className="mt-2 w-32 h-32 object-contain border rounded" />
                  )}
                </div>
              )}
              {newGateway.type === 'payment_link' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Link</label>
                  <input
                    type="url"
                    value={newGateway.paymentLink}
                    onChange={(e) => setNewGateway({ ...newGateway, paymentLink: e.target.value })}
                    placeholder="https://..."
                    className="input-field"
                    required
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Instructions (Optional)</label>
                <textarea
                  value={newGateway.instructions}
                  onChange={(e) => setNewGateway({ ...newGateway, instructions: e.target.value })}
                  className="input-field"
                  rows="3"
                  placeholder="Payment instructions for users"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 btn-secondary">Cancel</button>
                <button type="submit" className="flex-1 btn-primary">Add Gateway</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {showResetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-2xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4 text-red-600">Reset User History</h2>
            <p className="text-gray-600 mb-6">This will permanently delete:</p>
            <ul className="list-disc list-inside text-sm text-gray-600 mb-6 space-y-1">
              <li>All virtual cards</li>
              <li>All transactions</li>
              <li>All settlements</li>
              <li>All cashbacks</li>
              <li>Wallet balance (reset to ₹0)</li>
            </ul>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Select User</label>
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="input-field"
                required
              >
                <option value="">-- Select User --</option>
                {users.length > 0 ? (
                  users.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.name} - {user.email} ({user.role})
                    </option>
                  ))
                ) : (
                  <option disabled>No users available</option>
                )}
              </select>
            </div>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowResetModal(false);
                  setSelectedUser('');
                }}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleResetUserHistory}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Reset History
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
